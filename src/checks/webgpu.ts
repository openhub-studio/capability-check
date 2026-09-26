import type { CheckResult, Feature, MetaItem } from '../types.js';
import { tryProbe } from './common.js';

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
    const adapter = await tryProbe(navigator.gpu.requestAdapter(), 5000);
    if (!adapter) {
      return {
        status: 'unsupported',
        detail:
          'The API is present, but requestAdapter() returned no adapter — no usable GPU was found.',
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
        info = await tryProbe(legacy.call(adapter));
      }
    }
    const meta: MetaItem[] = [];
    if (info) {
      if (info.vendor) meta.push({ label: 'Vendor', value: info.vendor });
      if (info.architecture)
        meta.push({ label: 'Architecture', value: info.architecture });
      if (info.device) meta.push({ label: 'Device', value: info.device });
      else if (info.description)
        meta.push({ label: 'Device', value: info.description });
    }
    // `isFallbackAdapter` existed in earlier spec drafts; probe it loosely.
    const isFallback =
      (adapter as { isFallbackAdapter?: boolean }).isFallbackAdapter === true;

    const features = adapter.features;
    meta.push({
      label: 'Optional features',
      value: String(features.size) + ' exposed',
    });
    try {
      meta.push({
        label: 'Canvas format',
        value: navigator.gpu.getPreferredCanvasFormat(),
      });
    } catch {
      /* not critical */
    }
    const limits = adapter.limits;
    meta.push({
      label: 'Max 2D texture',
      value: limits.maxTextureDimension2D.toLocaleString() + ' px',
    });
    meta.push({
      label: 'Workgroup size',
      value: limits.maxComputeInvocationsPerWorkgroup.toLocaleString() +
        ' invocations',
    });

    // Deeper probe: actually request a device — adapter presence alone
    // does not guarantee a usable context.
    const device = await tryProbe(adapter.requestDevice(), 5000);
    meta.push({
      label: 'Device acquisition',
      value: device ? 'Passed' : 'Failed',
      ok: device !== null,
    });
    device?.destroy();

    if (isFallback) {
      return {
        status: 'partial',
        detail:
          'Only a software fallback adapter is available — hardware acceleration may be off.',
        meta,
      };
    }
    if (!device) {
      return {
        status: 'partial',
        detail:
          'An adapter exists but requestDevice() failed — GPU access is blocked.',
        meta,
      };
    }
    return {
      status: 'supported',
      detail: 'A hardware GPU adapter was returned and a device was created.',
      meta,
    };
  },
};
