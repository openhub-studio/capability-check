import type { CheckResult, Feature } from '../types.js';

/** Real probe: registers the bundled no-op sw.js, then unregisters it. */
async function probeRegistration(): Promise<ServiceWorkerRegistration> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('registration timed out')), 5000),
  );
  return Promise.race([navigator.serviceWorker.register('/sw.js'), timeout]);
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
    let reg: ServiceWorkerRegistration;
    try {
      reg = await probeRegistration();
    } catch (err) {
      return {
        status: 'unsupported',
        detail:
          'API is present but registration failed: ' +
          (err instanceof Error ? err.message : String(err)),
      };
    }
    const scope = reg.scope;
    try {
      await reg.unregister();
    } catch {
      /* cosmetic — the probe worker intercepts nothing anyway */
    }
    return {
      status: 'supported',
      detail: 'A test worker registered and released successfully.',
      meta: [{ label: 'Probe scope', value: scope }],
    };
  },
};
