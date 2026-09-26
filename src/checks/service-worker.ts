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
  name: 'Service Worker',
  tag: 'Offline core',
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.5 12a8.5 8.5 0 1 1-2.49-6.01"/>
    <path d="M20.5 3.5v4h-4"/>
  </svg>`,
  description:
    'A scriptable network proxy that enables offline support, caching strategies, and push delivery.',
  async detect(): Promise<CheckResult> {
    if (!('serviceWorker' in navigator)) {
      return {
        status: 'unsupported',
        detail: 'navigator.serviceWorker is not exposed by this browser.',
      };
    }
    if (!window.isSecureContext) {
      return {
        status: 'unsupported',
        detail: 'Service workers require a secure context (HTTPS or localhost).',
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
        detail:
          'API is present but a real registration failed or timed out.',
      };
    }

    const { reg, activated } = outcome;
    const meta: MetaItem[] = [
      { label: 'Probe scope', value: reg.scope },
      {
        label: 'Activation',
        value: activated ? 'Worker reached activated state' : 'Not confirmed',
        ok: activated,
      },
      {
        label: 'Page controlled',
        value: navigator.serviceWorker.controller ? 'Yes' : 'No',
        ok: null,
      },
      {
        label: 'Registrations on origin',
        value: existing !== undefined ? String(existing) : 'Unknown',
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
        ? 'A test worker registered, activated, and released successfully.'
        : 'Registration worked but activation could not be confirmed.',
      meta,
    };
  },
};
