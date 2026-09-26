import type { CheckResult, Feature, MetaItem } from '../types.js';

export const webShare: Feature = {
  id: 'web-share',
  name: 'Web Share',
  tag: 'OS share sheet',
  group: 'engagement',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="12" r="2.6"/>
    <circle cx="17.5" cy="5.5" r="2.6"/>
    <circle cx="17.5" cy="18.5" r="2.6"/>
    <path d="M8.3 10.8l7-4M8.3 13.2l7 4"/>
  </svg>`,
  description:
    'Hands text, links, and files to the operating system share sheet — the native sharing path for installed apps.',
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
        value: share ? 'Available' : 'Unavailable',
        ok: share,
      },
      {
        label: 'canShare()',
        value: canShare ? 'Available' : 'Unavailable',
        ok: canShare,
      },
    ];
    if (canShare) {
      meta.push({
        label: 'URL payload',
        value:
          urlShare === null ? 'Not verifiable' : urlShare ? 'Accepted' : 'Rejected',
        ok: urlShare,
      });
      meta.push({
        label: 'File payload',
        value:
          fileShare === null
            ? 'Not verifiable'
            : fileShare
              ? 'Accepted'
              : 'Rejected',
        ok: fileShare,
      });
    }

    if (share) {
      return {
        status: fileShare === false ? 'partial' : 'supported',
        detail:
          fileShare === false
            ? 'navigator.share works for text/links, but this browser rejects file payloads.'
            : 'navigator.share is available — the OS share sheet can be invoked.',
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail:
        'navigator.share is not exposed (may require HTTPS on this platform).',
      meta,
    };
  },
};
