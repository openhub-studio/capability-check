/* Shared test binaries and helpers for WASM-based checks. */

/** Minimal valid WebAssembly module (magic + version header only). */
export const WASM_MINIMAL = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
]);

/**
 * Canonical fixed-width-SIMD test module (same bytes as Google's
 * wasm-feature-detect): returns a v128 value produced by
 * i8x16.splat + i8x16.bitmask. Validates only where WASM SIMD128 ships.
 */
export const WASM_SIMD_MODULE = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10,
  10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
]);

/** True when the WebAssembly runtime exists and can validate binaries. */
export function hasWASM(): boolean {
  return (
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.validate === 'function'
  );
}
