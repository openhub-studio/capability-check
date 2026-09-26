/* ============================================================
   features.ts — the capability registry (the file you extend)
   ------------------------------------------------------------
   HOW TO ADD A NEW CHECK
   1. Push one Feature into `FEATURES` below:

      {
        id: 'webtransport',            // unique key
        name: 'WebTransport',          // display name
        tag: 'HTTP/3',                 // small line under the name
        group: 'network',              // key of an entry in GROUPS
        docs: 'https://developer.mozilla.org/...',   // "Learn more" link
        icon: '<svg …></svg>',         // 24×24, stroke-based
        description: 'One sentence shown on the card.',
        async detect(): Promise<CheckResult> {
          // Return: { status, detail, meta? }
          //   status: 'supported' | 'partial' | 'unsupported'
          //   detail: one short sentence of human-readable evidence
          //   meta:   optional [{ label, value, ok }] rows
          //           (ok ∈ true/false/null → tinted green/red/neutral)
          return { status: 'supported', detail: '…' };
        },
      }

   2. If `group` doesn't exist yet, add it to GROUPS.
   That's it — cards, badges, summary score and the report pick it up.
   ============================================================ */

import type {
  CheckResult,
  Feature,
  FeatureGroup,
  MetaItem,
} from './types.js';

/* Groups render in this order. */
export const GROUPS: FeatureGroup[] = [
  {
    key: 'compute',
    title: 'Compute',
    sub: 'Near-native performance, compiled and vectorised.',
  },
  {
    key: 'graphics',
    title: 'Graphics',
    sub: 'Modern GPU access for rendering and compute.',
  },
];

/* ---------- shared test binaries ---------- */

// Minimal valid WebAssembly module (magic + version header only).
const WASM_MINIMAL = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
]);

// Canonical fixed-width-SIMD test module (same bytes as
// Google's wasm-feature-detect): returns a v128 value produced by
// i8x16.splat + i8x16.bitmask. Validates only where WASM SIMD128 ships.
const WASM_SIMD_MODULE = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10,
  10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
]);

/* ---------- icons (24×24, 1.6px stroke, geometric) ---------- */

const ICONS = {
  wasm: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2.8l8 4.4v9.6l-8 4.4-8-4.4V7.2l8-4.4z"/>
    <path d="M4 7.2l8 4.4 8-4.4M12 11.6v9.6"/>
  </svg>`,
  simd: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3"/>
    <path d="M8.2 4v16M12 4v16M15.8 4v16"/>
  </svg>`,
  gpu: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2.5"/>
    <rect x="10" y="10" width="4" height="4" rx="1"/>
    <path d="M9 2.8V6M15 2.8V6M9 18v3.2M15 18v3.2M2.8 9H6M2.8 15H6M18 9h3.2M18 15h3.2"/>
  </svg>`,
} as const;

/* ---------- helpers shared by detectors ---------- */

function hasWASM(): boolean {
  return (
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.validate === 'function'
  );
}

/* ============================================================
   THE REGISTRY
   ============================================================ */

export const FEATURES: Feature[] = [
  {
    id: 'wasm',
    name: 'WebAssembly',
    tag: 'WASM 1.0',
    group: 'compute',
    docs: 'https://developer.mozilla.org/en-US/docs/WebAssembly',
    icon: ICONS.wasm,
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
  },

  {
    id: 'wasm-simd',
    name: 'SIMD',
    tag: 'WASM SIMD128',
    group: 'compute',
    docs: 'https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface',
    icon: ICONS.simd,
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
  },

  {
    id: 'webgpu',
    name: 'WebGPU',
    tag: 'GPU for the web',
    group: 'graphics',
    docs: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API',
    icon: ICONS.gpu,
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
  },
];
