import type { CheckResult, Feature, MetaItem } from '../types.js';

export const notificationsPush: Feature = {
  id: 'notifications-push',
  name: 'Notifications & Push',
  tag: 'Re-engagement',
  group: 'engagement',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Push_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z"/>
    <path d="M10 20a2.2 2.2 0 0 0 4 0"/>
  </svg>`,
  description:
    'Local notifications plus push messages delivered to the service worker while the app is closed.',
  async detect(): Promise<CheckResult> {
    const notif =
      typeof Notification !== 'undefined' && 'permission' in Notification;
    const push = 'PushManager' in window;

    const meta: MetaItem[] = [
      {
        label: 'Notification API',
        value: notif ? 'Available' : 'Unavailable',
        ok: notif,
      },
      {
        label: 'Push API',
        value: push ? 'Available' : 'Unavailable',
        ok: push,
      },
    ];
    if (notif) {
      const perm = Notification.permission;
      meta.push({
        label: 'Permission',
        value: perm[0]!.toUpperCase() + perm.slice(1),
        ok: perm === 'granted' ? true : perm === 'denied' ? false : null,
      });
    }

    if (notif && push) {
      return {
        status: 'supported',
        detail: 'Both notification display and push delivery are available.',
        meta,
      };
    }
    if (notif || push) {
      return {
        status: 'partial',
        detail:
          'Partial coverage — ' +
          (notif
            ? 'notifications work but the Push API is missing.'
            : 'push plumbing exists but notifications are unavailable.'),
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: 'Neither notifications nor push messaging is available.',
      meta,
    };
  },
};
