import type { CheckResult, Feature, MetaItem } from '../types.js';

export const webgpu: Feature = {
  id: 'webgpu',
  name: 'WebGPU',
  tag: 'GPU for the web',
  group: 'graphics',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2.5"/>
    <rect x="10" y="10" width="4" height="4" rx="1"/>
    <path d="M9 2.8V6M15 2.8V6M9 18v3.2M15 18v3.2M2.8 9H6M2.8 15H6M18 9h3.2M18 15h3.2"/>
  </svg>`,
  description:
    'A modern low-level API for GPU rendering and general-purpose compute on the web.',
  async detect(): Promise<CheckResult> {
    if (!window.isSecureContext) {
      return {
        status: 'unsupported',
        detail: 'WebGPU requires a secure context (HTTPS or localhost).',
      };
    }
    if (!('gpu' in navigator)) {
      return {
        status: 'unsupported',
        detail: 'navigator.gpu is not exposed by this browser.',
      };
    }
    let adapter: GPUAdapter | null = null;
    try {
      adapter = await navigator.gpu.requestAdapter();
    } catch {
      adapter = null;
    }
    if (!adapter) {
      return {
        status: 'unsupported',
        detail: 'The API is present, but no GPU adapter was returned.',
      };
    }
    // Adapter info: `adapter.info` (current spec) or
    // `requestAdapterInfo()` (earlier implementations).
    let info: GPUAdapterInfo | null = adapter.info ?? null;
    if (!info) {
      const legacy = (
        adapter as { requestAdapterInfo?: () => Promise<GPUAdapterInfo> }
      ).requestAdapterInfo;
      if (typeof legacy === 'function') {
        try {
          info = await legacy.call(adapter);
        } catch {
          info = null;
        }
      }
    }
    const meta: MetaItem[] = [];
    if (info) {
      if (info.vendor) meta.push({ label: 'Vendor', value: info.vendor });
      if (info.architecture)
        meta.push({ label: 'Architecture', value: info.architecture });
      if (info.description)
        meta.push({ label: 'Device', value: info.description });
    }
    // `isFallbackAdapter` existed in earlier spec drafts; probe it loosely.
    const isFallback =
      (adapter as { isFallbackAdapter?: boolean }).isFallbackAdapter === true;
    if (isFallback) {
      return {
        status: 'partial',
        detail:
          'Only a software fallback adapter is available — hardware acceleration may be off.',
        meta,
      };
    }
    return {
      status: 'supported',
      detail: 'A hardware GPU adapter was returned.',
      meta,
    };
  },
};
