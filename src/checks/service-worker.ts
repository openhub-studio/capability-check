import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';
import { tryProbe } from './common.js';

/**
 * Wait for a registration's worker to reach 'activated' state.
 * (Can't use navigator.serviceWorker.ready — that resolves against the
 * page-controlling registration, not this probe's dedicated scope.)
 */
function waitForActivation(reg: ServiceWorkerRegistration): Promise<boolean> {
  const sw = reg.installing ?? reg.waiting ?? reg.active;
  if (!sw) return Promise.resolve(false);
  if (sw.state === 'activated') return Promise.resolve(true);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 4000);
    sw.addEventListener('statechange', () => {
      if (sw.state === 'activated') {
        clearTimeout(timer);
        resolve(true);
      }
    });
  });
}

/**
 * Real probe: registers the bundled no-op sw-probe.js under its own scope
 * (so it can never disturb the site's real '/' registration), waits for
 * activation, then unregisters.
 */
async function probeRegistration(): Promise<{
  reg: ServiceWorkerRegistration;
  activated: boolean;
} | null> {
  const reg = await navigator.serviceWorker.register('/sw-probe.js', {
    scope: '/__cc_probe__/',
  });
  const activated = await waitForActivation(reg);
  return { reg, activated };
}

export const serviceWorker: Feature = {
  id: 'service-worker',
  name: msg('check.sw.name'),
  tag: msg('check.sw.tag'),
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.5 12a8.5 8.5 0 1 1-2.49-6.01"/>
    <path d="M20.5 3.5v4h-4"/>
  </svg>`,
  description: msg('check.sw.desc'),
  async detect(): Promise<CheckResult> {
    if (!('serviceWorker' in navigator)) {
      return {
        status: 'unsupported',
        detail: msg('check.sw.noApi'),
      };
    }
    if (!window.isSecureContext) {
      return {
        status: 'unsupported',
        detail: msg('check.sw.insecure'),
      };
    }

    const existing = (await tryProbe(
      navigator.serviceWorker.getRegistrations(),
    ))?.length;

    let outcome: { reg: ServiceWorkerRegistration; activated: boolean } | null;
    try {
      outcome = await tryProbe(probeRegistration(), 6000);
    } catch {
      outcome = null;
    }
    if (!outcome) {
      return {
        status: 'unsupported',
        detail: msg('check.sw.regFail'),
      };
    }

    const { reg, activated } = outcome;
    const meta: MetaItem[] = [
      { label: msg('check.sw.meta.scope'), value: reg.scope },
      {
        label: msg('check.sw.meta.activation'),
        value: activated
          ? msg('check.sw.meta.activationOk')
          : msg('check.sw.meta.activationUnknown'),
        ok: activated,
      },
      {
        label: msg('check.sw.meta.controlled'),
        value: navigator.serviceWorker.controller
          ? msg('meta.yes')
          : msg('meta.no'),
        ok: null,
      },
      {
        label: msg('check.sw.meta.regCount'),
        value:
          existing !== undefined ? String(existing) : msg('meta.unknown'),
      },
    ];
    try {
      await reg.unregister();
    } catch {
      /* cosmetic — the probe worker intercepts nothing anyway */
    }
    return {
      status: activated ? 'supported' : 'partial',
      detail: activated
        ? msg('check.sw.ok')
        : msg('check.sw.partial'),
      meta,
    };
  },
};
