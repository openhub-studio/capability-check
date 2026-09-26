import type { CheckResult, Feature, MetaItem } from '../types.js';
import { hasWASM, WASM_SIMD_MODULE } from './common.js';

export const wasmSimd: Feature = {
  id: 'wasm-simd',
  name: 'SIMD',
  tag: 'WASM SIMD128',
  group: 'compute',
  docs: 'https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3"/>
    <path d="M8.2 4v16M12 4v16M15.8 4v16"/>
  </svg>`,
  description:
    'Fixed-width 128-bit vector instructions for parallel data processing in WebAssembly.',
  async detect(): Promise<CheckResult> {
    if (!hasWASM()) {
      return {
        status: 'unsupported',
        detail: 'Requires WebAssembly, which is unavailable.',
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
      { label: 'Vector width', value: '128-bit', ok: validated ? true : null },
      {
        label: 'Binary validation',
        value: validated ? 'Passed' : 'Rejected',
        ok: validated,
      },
      {
        label: 'Instantiation',
        value: instantiated ? 'Passed' : 'Failed',
        ok: instantiated ? true : validated ? false : null,
      },
    ];
    if (validated && instantiated) {
      return {
        status: 'supported',
        detail: 'v128 vector operations validate and instantiate.',
        meta,
      };
    }
    if (validated) {
      return {
        status: 'partial',
        detail: 'SIMD binaries validate but fail to instantiate on this engine.',
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: 'This engine rejects SIMD128 vector instructions.',
      meta,
    };
  },
};
