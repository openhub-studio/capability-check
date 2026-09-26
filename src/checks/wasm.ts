import type { CheckResult, Feature } from '../types.js';
import { hasWASM, WASM_MINIMAL } from './common.js';

export const wasm: Feature = {
  id: 'wasm',
  name: 'WebAssembly',
  tag: 'WASM 1.0',
  group: 'compute',
  docs: 'https://developer.mozilla.org/en-US/docs/WebAssembly',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2.8l8 4.4v9.6l-8 4.4-8-4.4V7.2l8-4.4z"/>
    <path d="M4 7.2l8 4.4 8-4.4M12 11.6v9.6"/>
  </svg>`,
  description:
    'A binary instruction format that runs code at near-native speed inside the browser.',
  async detect(): Promise<CheckResult> {
    if (!hasWASM()) {
      return {
        status: 'unsupported',
        detail: 'The WebAssembly object is not exposed by this browser.',
      };
    }
    if (!WebAssembly.validate(WASM_MINIMAL)) {
      return {
        status: 'unsupported',
        detail: 'WebAssembly exists but failed binary validation.',
      };
    }
    let instantiated = false;
    try {
      const { instance } = await WebAssembly.instantiate(WASM_MINIMAL);
      instantiated = instance instanceof WebAssembly.Instance;
    } catch {
      /* fall through */
    }
    const streaming = typeof WebAssembly.instantiateStreaming === 'function';
    return {
      status: instantiated ? 'supported' : 'partial',
      detail: instantiated
        ? 'Modules validate and instantiate correctly.'
        : 'Modules validate but could not be instantiated.',
      meta: [
        {
          label: 'Streaming compilation',
          value: streaming ? 'Available' : 'Unavailable',
          ok: streaming,
        },
      ],
    };
  },
};
