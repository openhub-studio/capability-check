import type { CheckResult, Feature, MetaItem } from '../types.js';

export const backgroundSync: Feature = {
  id: 'background-sync',
  name: 'Background Sync',
  tag: 'Deferred work',
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 9a8 8 0 0 1 14.1-2.4L20.5 9"/>
    <path d="M20.5 4v5h-5"/>
    <path d="M20 15a8 8 0 0 1-14.1 2.4L3.5 15"/>
    <path d="M3.5 20v-5h5"/>
  </svg>`,
  description:
    'Lets a service worker retry failed requests and run periodic work in the background.',
  async detect(): Promise<CheckResult> {
    if (!('ServiceWorkerRegistration' in window)) {
      return {
        status: 'unsupported',
        detail:
          'No service worker support — background sync cannot exist here.',
      };
    }
    const proto = ServiceWorkerRegistration.prototype;
    const sync = 'sync' in proto; // SyncManager
    const periodic = 'periodicSync' in proto; // PeriodicSyncManager

    const meta: MetaItem[] = [
      { label: 'SyncManager', value: sync ? 'Available' : 'Unavailable', ok: sync },
      {
        label: 'PeriodicSyncManager',
        value: periodic ? 'Available' : 'Unavailable',
        ok: periodic,
      },
    ];

    if (sync && periodic) {
      return {
        status: 'supported',
        detail: 'One-off and periodic background sync are both available.',
        meta,
      };
    }
    if (sync) {
      return {
        status: 'partial',
        detail: 'Basic sync works; periodic background sync is missing.',
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: 'This browser does not implement background sync.',
      meta,
    };
  },
};
