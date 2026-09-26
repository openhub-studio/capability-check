import type { CheckResult, Feature } from '../types.js';
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
    let ok = false;
    try {
      ok = WebAssembly.validate(WASM_SIMD_MODULE);
    } catch {
      ok = false;
    }
    return {
      status: ok ? 'supported' : 'unsupported',
      detail: ok
        ? 'v128 vector operations validate successfully.'
        : 'This engine rejects SIMD128 vector instructions.',
      meta: [
        { label: 'Vector width', value: '128-bit', ok: ok ? true : null },
      ],
    };
  },
};
