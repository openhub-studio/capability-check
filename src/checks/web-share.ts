import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';

export const webShare: Feature = {
  id: 'web-share',
  name: msg('check.share.name'),
  tag: msg('check.share.tag'),
  group: 'engagement',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="12" r="2.6"/>
    <circle cx="17.5" cy="5.5" r="2.6"/>
    <circle cx="17.5" cy="18.5" r="2.6"/>
    <path d="M8.3 10.8l7-4M8.3 13.2l7 4"/>
  </svg>`,
  description: msg('check.share.desc'),
  async detect(): Promise<CheckResult> {
    const share = typeof navigator.share === 'function';
    const canShare = typeof navigator.canShare === 'function';

    // Real payload tests — canShare answers per payload type.
    let urlShare: boolean | null = null;
    let fileShare: boolean | null = null;
    if (canShare) {
      try {
        urlShare = navigator.canShare({ url: 'https://example.com/' });
      } catch {
        urlShare = null;
      }
      try {
        const file = new File(['x'], 'probe.txt', { type: 'text/plain' });
        fileShare = navigator.canShare({ files: [file] });
      } catch {
        fileShare = null;
      }
    }

    const meta: MetaItem[] = [
      {
        label: 'share()',
        value: share ? msg('meta.available') : msg('meta.unavailable'),
        ok: share,
      },
      {
        label: 'canShare()',
        value: canShare ? msg('meta.available') : msg('meta.unavailable'),
        ok: canShare,
      },
    ];
    if (canShare) {
      meta.push({
        label: msg('check.share.meta.url'),
        value:
          urlShare === null
            ? msg('check.share.meta.unverifiable')
            : urlShare
              ? msg('check.share.meta.accepted')
              : msg('check.share.meta.rejected'),
        ok: urlShare,
      });
      meta.push({
        label: msg('check.share.meta.file'),
        value:
          fileShare === null
            ? msg('check.share.meta.unverifiable')
            : fileShare
              ? msg('check.share.meta.accepted')
              : msg('check.share.meta.rejected'),
        ok: fileShare,
      });
    }

    if (share) {
      return {
        status: fileShare === false ? 'partial' : 'supported',
        detail:
          fileShare === false
            ? msg('check.share.noFiles')
            : msg('check.share.ok'),
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: msg('check.share.noApi'),
      meta,
    };
  },
};
