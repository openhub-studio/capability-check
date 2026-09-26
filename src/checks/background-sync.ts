import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';

export const backgroundSync: Feature = {
  id: 'background-sync',
  name: msg('check.bgsync.name'),
  tag: msg('check.bgsync.tag'),
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 9a8 8 0 0 1 14.1-2.4L20.5 9"/>
    <path d="M20.5 4v5h-5"/>
    <path d="M20 15a8 8 0 0 1-14.1 2.4L3.5 15"/>
    <path d="M3.5 20v-5h5"/>
  </svg>`,
  description: msg('check.bgsync.desc'),
  async detect(): Promise<CheckResult> {
    const swApi = 'serviceWorker' in navigator;
    if (!('ServiceWorkerRegistration' in window)) {
      return {
        status: 'unsupported',
        detail: msg('check.bgsync.noSw'),
        meta: [
          {
            label: msg('check.bgsync.meta.swApi'),
            value: swApi
              ? msg('check.bgsync.meta.swApiLimited')
              : msg('meta.missing'),
            ok: false,
          },
        ],
      };
    }
    const proto = ServiceWorkerRegistration.prototype;
    const sync = 'sync' in proto; // SyncManager
    const periodic = 'periodicSync' in proto; // PeriodicSyncManager

    const meta: MetaItem[] = [
      {
        label: msg('check.bgsync.meta.swApi'),
        value: msg('check.bgsync.meta.swApiPresent'),
        ok: true,
      },
      {
        label: msg('check.bgsync.meta.sync'),
        value: sync
          ? msg('check.bgsync.meta.syncValue')
          : msg('meta.unavailable'),
        ok: sync,
      },
      {
        label: msg('check.bgsync.meta.periodic'),
        value: periodic
          ? msg('check.bgsync.meta.periodicValue')
          : msg('meta.unavailable'),
        ok: periodic,
      },
    ];

    if (sync && periodic) {
      return {
        status: 'supported',
        detail: msg('check.bgsync.both'),
        meta,
      };
    }
    if (sync) {
      return {
        status: 'partial',
        detail: msg('check.bgsync.partial'),
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: msg('check.bgsync.no'),
      meta,
    };
  },
};
