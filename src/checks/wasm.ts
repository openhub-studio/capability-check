import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';
import { hasWASM, WASM_MINIMAL } from './common.js';

/**
 * Functional streaming test: feed compileStreaming a real Response carrying
 * the application/wasm MIME type — stronger than checking typeof.
 */
async function streamingCompile(): Promise<boolean> {
  const compile =
    typeof WebAssembly.compileStreaming === 'function'
      ? WebAssembly.compileStreaming
      : typeof WebAssembly.instantiateStreaming === 'function'
        ? async (src: Response | Promise<Response>) =>
            (await WebAssembly.instantiateStreaming(src)).module
        : null;
  if (!compile) return false;
  try {
    const res = new Response(WASM_MINIMAL.slice().buffer, {
      headers: { 'Content-Type': 'application/wasm' },
    });
    const mod = await compile(Promise.resolve(res));
    return mod instanceof WebAssembly.Module;
  } catch {
    return false;
  }
}

/**
 * Shared-memory probe: constructing a shared WebAssembly.Memory is the
 * mechanical half of WASM threads; SharedArrayBuffer + cross-origin
 * isolation decide whether threads can actually communicate.
 */
function threadPrimitives(): {
  sharedMem: boolean;
  sab: boolean;
  isolated: boolean;
} {
  let sharedMem = false;
  try {
    new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
    sharedMem = true;
  } catch {
    sharedMem = false;
  }
  return {
    sharedMem,
    sab: typeof SharedArrayBuffer === 'function',
    isolated: window.crossOriginIsolated === true,
  };
}

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
  description: msg('check.wasm.desc'),
  async detect(): Promise<CheckResult> {
    if (!hasWASM()) {
      return {
        status: 'unsupported',
        detail: msg('check.wasm.noApi'),
      };
    }
    if (!WebAssembly.validate(WASM_MINIMAL)) {
      return {
        status: 'unsupported',
        detail: msg('check.wasm.badValidation'),
      };
    }

    const t0 = performance.now();
    let instantiated = false;
    try {
      const { instance } = await WebAssembly.instantiate(WASM_MINIMAL);
      instantiated = instance instanceof WebAssembly.Instance;
    } catch {
      /* fall through */
    }
    const latency = Math.max(1, Math.round(performance.now() - t0));

    const [streaming, threads] = await Promise.all([
      streamingCompile(),
      Promise.resolve(threadPrimitives()),
    ]);
    const threadsReady = threads.sharedMem && threads.sab;

    const meta: MetaItem[] = [
      {
        label: msg('check.wasm.meta.streaming'),
        value: streaming
          ? msg('check.wasm.meta.streamingOk')
          : msg('meta.unavailable'),
        ok: streaming,
      },
      {
        label: msg('check.wasm.meta.threads'),
        value: threadsReady
          ? threads.isolated
            ? msg('check.wasm.meta.threadsReady')
            : msg('check.wasm.meta.threadsNeedsIsolation')
          : msg('meta.unavailable'),
        ok: threadsReady && threads.isolated ? true : threads.sharedMem ? null : false,
      },
      { label: msg('check.wasm.meta.latency'), value: latency + ' ms' },
    ];

    return {
      status: instantiated ? 'supported' : 'partial',
      detail: instantiated
        ? msg('check.wasm.ok')
        : msg('check.wasm.partial'),
      meta,
    };
  },
};
