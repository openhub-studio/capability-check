import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';
import { tryProbe } from './common.js';

export const webgpu: Feature = {
  id: 'webgpu',
  name: msg('check.webgpu.name'),
  tag: msg('check.webgpu.tag'),
  group: 'graphics',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2.5"/>
    <rect x="10" y="10" width="4" height="4" rx="1"/>
    <path d="M9 2.8V6M15 2.8V6M9 18v3.2M15 18v3.2M2.8 9H6M2.8 15H6M18 9h3.2M18 15h3.2"/>
  </svg>`,
  description: msg('check.webgpu.desc'),
  async detect(): Promise<CheckResult> {
    if (!window.isSecureContext) {
      return {
        status: 'unsupported',
        detail: msg('check.webgpu.insecure'),
      };
    }
    if (!('gpu' in navigator)) {
      return {
        status: 'unsupported',
        detail: msg('check.webgpu.noApi'),
      };
    }
    const adapter = await tryProbe(navigator.gpu.requestAdapter(), 5000);
    if (!adapter) {
      return {
        status: 'unsupported',
        detail: msg('check.webgpu.noAdapter'),
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
      if (info.vendor)
        meta.push({ label: msg('check.webgpu.meta.vendor'), value: info.vendor });
      if (info.architecture)
        meta.push({
          label: msg('check.webgpu.meta.arch'),
          value: info.architecture,
        });
      if (info.device)
        meta.push({ label: msg('check.webgpu.meta.device'), value: info.device });
      else if (info.description)
        meta.push({
          label: msg('check.webgpu.meta.device'),
          value: info.description,
        });
    }
    // `isFallbackAdapter` existed in earlier spec drafts; probe it loosely.
    const isFallback =
      (adapter as { isFallbackAdapter?: boolean }).isFallbackAdapter === true;

    const features = adapter.features;
    meta.push({
      label: msg('check.webgpu.meta.features'),
      value: msg('check.webgpu.meta.featuresValue', { n: features.size }),
    });
    try {
      meta.push({
        label: msg('check.webgpu.meta.canvasFormat'),
        value: navigator.gpu.getPreferredCanvasFormat(),
      });
    } catch {
      /* not critical */
    }
    const limits = adapter.limits;
    meta.push({
      label: msg('check.webgpu.meta.maxTex'),
      value: limits.maxTextureDimension2D.toLocaleString() + ' px',
    });
    meta.push({
      label: msg('check.webgpu.meta.workgroup'),
      value: msg('check.webgpu.meta.workgroupValue', {
        n: limits.maxComputeInvocationsPerWorkgroup.toLocaleString(),
      }),
    });

    // Deeper probe: actually request a device — adapter presence alone
    // does not guarantee a usable context.
    const device = await tryProbe(adapter.requestDevice(), 5000);
    meta.push({
      label: msg('check.webgpu.meta.deviceAcq'),
      value: device ? msg('meta.passed') : msg('meta.failed'),
      ok: device !== null,
    });
    device?.destroy();

    if (isFallback) {
      return {
        status: 'partial',
        detail: msg('check.webgpu.fallback'),
        meta,
      };
    }
    if (!device) {
      return {
        status: 'partial',
        detail: msg('check.webgpu.deviceFail'),
        meta,
      };
    }
    return {
      status: 'supported',
      detail: msg('check.webgpu.ok'),
      meta,
    };
  },
};
