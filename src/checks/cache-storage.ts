import type { CheckResult, Feature } from '../types.js';

const PROBE_CACHE = 'capability-check-probe';
const PROBE_URL = '/__capability_probe__';

/** Real probe: open → write → read back → delete. */
async function roundtrip(): Promise<'ok' | 'write-failed' | 'error'> {
  try {
    const cache = await caches.open(PROBE_CACHE);
    await cache.put(PROBE_URL, new Response('ok'));
    const hit = await cache.match(PROBE_URL);
    await caches.delete(PROBE_CACHE);
    return hit ? 'ok' : 'write-failed';
  } catch {
    try {
      await caches.delete(PROBE_CACHE);
    } catch {
      /* best effort cleanup */
    }
    return 'error';
  }
}

export const cacheStorage: Feature = {
  id: 'cache-storage',
  name: 'Cache Storage',
  tag: 'Offline assets',
  group: 'storage',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="12" cy="5.5" rx="8" ry="2.8"/>
    <path d="M4 5.5v13c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-13"/>
    <path d="M4 12c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8"/>
  </svg>`,
  description:
    'Programmatic request/response storage — what service workers use to keep apps working offline.',
  async detect(): Promise<CheckResult> {
    if (!('caches' in window)) {
      return {
        status: 'unsupported',
        detail:
          'window.caches is absent (API missing or insecure context).',
      };
    }
    const res = await roundtrip();
    if (res === 'ok') {
      return {
        status: 'supported',
        detail: 'Write/read/delete roundtrip succeeded.',
      };
    }
    if (res === 'write-failed') {
      return {
        status: 'partial',
        detail: 'Cache opened but the readback came up empty.',
      };
    }
    return {
      status: 'unsupported',
      detail: 'API exists but a real write failed — storage may be disabled.',
    };
  },
};
