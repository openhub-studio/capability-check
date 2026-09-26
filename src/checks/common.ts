/* Shared test binaries and helpers for the capability probes. */

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

/**
 * Run a probe against a timeout. Resolves `null` on timeout or rejection —
 * probes should never throw or hang the runner.
 */
export async function tryProbe<T>(
  probe: Promise<T> | undefined | null,
  timeoutMs = 3000,
): Promise<T | null> {
  if (!probe) return null;
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), timeoutMs),
  );
  try {
    return await Promise.race([probe, timeout]);
  } catch {
    return null;
  }
}

/** Human-readable byte sizes, e.g. 1.0 GB / 240 MB / 12 KB. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + ' GB';
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(0) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}
