import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';

export const notificationsPush: Feature = {
  id: 'notifications-push',
  name: msg('check.push.name'),
  tag: msg('check.push.tag'),
  group: 'engagement',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Push_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z"/>
    <path d="M10 20a2.2 2.2 0 0 0 4 0"/>
  </svg>`,
  description: msg('check.push.desc'),
  async detect(): Promise<CheckResult> {
    const notif =
      typeof Notification !== 'undefined' && 'permission' in Notification;
    const swApi = 'serviceWorker' in navigator;
    const push =
      'PushManager' in window &&
      swApi &&
      'ServiceWorkerRegistration' in window &&
      'pushManager' in ServiceWorkerRegistration.prototype;

    const meta: MetaItem[] = [
      {
        label: msg('check.push.meta.notifApi'),
        value: notif ? msg('meta.available') : msg('meta.unavailable'),
        ok: notif,
      },
      {
        label: msg('check.push.meta.pushApi'),
        value: push ? msg('meta.available') : msg('meta.unavailable'),
        ok: push,
      },
      {
        label: msg('check.push.meta.path'),
        value: swApi
          ? msg('check.push.meta.pathOk')
          : msg('check.push.meta.pathNo'),
        ok: swApi ? true : push ? false : null,
      },
    ];

    // Real encryption detail: which content encodings push supports.
    const enc =
      typeof PushManager !== 'undefined'
        ? (
            PushManager as unknown as {
              supportedContentEncodings?: readonly string[];
            }
          ).supportedContentEncodings
        : undefined;
    if (push && enc?.length) {
      meta.push({
        label: msg('check.push.meta.encodings'),
        value: enc.join(', '),
      });
    }

    let perm: NotificationPermission | null = null;
    if (notif) {
      perm = Notification.permission;
      meta.push({
        label: msg('check.push.meta.permission'),
        value: msg(
          perm === 'granted'
            ? 'perm.granted'
            : perm === 'denied'
              ? 'perm.denied'
              : 'perm.default',
        ),
        ok: perm === 'granted' ? true : perm === 'denied' ? false : null,
      });
    }

    if (notif && push) {
      if (perm === 'denied') {
        return {
          status: 'partial',
          detail: msg('check.push.denied'),
          meta,
        };
      }
      return {
        status: 'supported',
        detail:
          perm === 'granted'
            ? msg('check.push.okGranted')
            : msg('check.push.ok'),
        meta,
      };
    }
    if (notif || push) {
      return {
        status: 'partial',
        detail: notif
          ? msg('check.push.notifOnly')
          : msg('check.push.pushOnly'),
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: msg('check.push.no'),
      meta,
    };
  },
};
