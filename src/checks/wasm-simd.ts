import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';
import { hasWASM, WASM_SIMD_MODULE } from './common.js';

export const wasmSimd: Feature = {
  id: 'wasm-simd',
  name: msg('check.simd.name'),
  tag: msg('check.simd.tag'),
  group: 'compute',
  docs: 'https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3"/>
    <path d="M8.2 4v16M12 4v16M15.8 4v16"/>
  </svg>`,
  description: msg('check.simd.desc'),
  async detect(): Promise<CheckResult> {
    if (!hasWASM()) {
      return {
        status: 'unsupported',
        detail: msg('check.simd.noWasm'),
      };
    }
    let validated = false;
    try {
      validated = WebAssembly.validate(WASM_SIMD_MODULE);
    } catch {
      validated = false;
    }
    let instantiated = false;
    if (validated) {
      try {
        const { instance } = await WebAssembly.instantiate(WASM_SIMD_MODULE);
        instantiated = instance instanceof WebAssembly.Instance;
      } catch {
        instantiated = false;
      }
    }
    const meta: MetaItem[] = [
      {
        label: msg('check.simd.meta.width'),
        value: '128-bit',
        ok: validated ? true : null,
      },
      {
        label: msg('check.simd.meta.validation'),
        value: validated ? msg('meta.passed') : msg('check.simd.meta.rejected'),
        ok: validated,
      },
      {
        label: msg('check.simd.meta.instantiate'),
        value: instantiated ? msg('meta.passed') : msg('meta.failed'),
        ok: instantiated ? true : validated ? false : null,
      },
    ];
    if (validated && instantiated) {
      return {
        status: 'supported',
        detail: msg('check.simd.ok'),
        meta,
      };
    }
    if (validated) {
      return {
        status: 'partial',
        detail: msg('check.simd.partial'),
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: msg('check.simd.no'),
      meta,
    };
  },
};
