import type { CheckResult, Feature, MetaItem } from '../types.js';
import { formatBytes, tryProbe } from './common.js';

const PROBE_FILE = 'capability-check-probe.txt';
const PROBE_DIR = 'capability-check-probe-dir';
const PROBE_TEXT = 'ok';

type StorageWithOPFS = StorageManager & {
  getDirectory?: () => Promise<FileSystemDirectoryHandle>;
};

/**
 * Real probe: getDirectory → create subdirectory → write a file inside →
 * read it back → remove both. Exercises file + directory ops, not just
 * API presence.
 */
async function roundtrip(storage: StorageWithOPFS): Promise<boolean> {
  const root = await storage.getDirectory!();
  const dir = await root.getDirectoryHandle(PROBE_DIR, { create: true });
  const handle = await dir.getFileHandle(PROBE_FILE, { create: true });
  const writable = await handle.createWritable();
  await writable.write(PROBE_TEXT);
  await writable.close();
  const file = await handle.getFile();
  const text = await file.text();
  await dir.removeEntry(PROBE_FILE);
  await root.removeEntry(PROBE_DIR);
  return text === PROBE_TEXT;
}

/**
 * createSyncAccessHandle only works inside a dedicated worker — spawn an
 * inline worker and actually write/read synchronously rather than trusting
 * the prototype check.
 */
function syncAccessProbe(): Promise<boolean> {
  return new Promise((resolve) => {
    const src = `onmessage = async () => {
      try {
        const root = await navigator.storage.getDirectory();
        const fh = await root.getFileHandle('cc-sync-probe', { create: true });
        const h = await fh.createSyncAccessHandle();
        h.write(new Uint8Array([1]), { at: 0 });
        h.flush();
        h.close();
        await root.removeEntry('cc-sync-probe');
        postMessage(true);
      } catch { postMessage(false); }
    };`;
    let worker: Worker;
    try {
      const url = URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' }),
      );
      worker = new Worker(url);
      URL.revokeObjectURL(url);
    } catch {
      resolve(false);
      return;
    }
    const timer = setTimeout(() => {
      worker.terminate();
      resolve(false);
    }, 3000);
    worker.onmessage = (e: MessageEvent<unknown>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data === true);
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve(false);
    };
    worker.postMessage(0);
  });
}

export const opfs: Feature = {
  id: 'opfs',
  name: 'OPFS',
  tag: 'File system storage',
  group: 'storage',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-6z"/>
    <path d="M13 3v6h6"/>
    <path d="M9 14h6M9 17.5h4"/>
  </svg>`,
  description:
    'Origin Private File System — a fast, origin-scoped virtual filesystem for persistent binary data.',
  async detect(): Promise<CheckResult> {
    const storage =
      'storage' in navigator
        ? (navigator.storage as StorageWithOPFS)
        : undefined;
    if (!storage || typeof storage.getDirectory !== 'function') {
      return {
        status: 'unsupported',
        detail:
          'navigator.storage.getDirectory is absent — OPFS is not implemented (or the context is insecure).',
      };
    }

    const meta: MetaItem[] = [];
    const [estimate, persisted, syncOk] = await Promise.all([
      tryProbe(storage.estimate?.()),
      tryProbe(storage.persisted?.()),
      tryProbe(syncAccessProbe(), 4000),
    ]);
    meta.push({
      label: 'Sync access handles',
      value:
        syncOk === true
          ? 'Verified in a worker'
          : syncOk === false
            ? 'Worker write failed'
            : 'Probe inconclusive',
      ok: syncOk,
    });
    if (estimate?.quota) {
      meta.push({ label: 'Storage quota', value: formatBytes(estimate.quota) });
    }
    if (persisted !== null && persisted !== undefined) {
      meta.push({
        label: 'Persistent storage',
        value: persisted ? 'Granted' : 'Not granted',
        ok: persisted,
      });
    }

    const t0 = performance.now();
    const ok = (await tryProbe(roundtrip(storage))) === true;
    meta.push({
      label: 'File + directory probe',
      value: ok ? 'Write/read/remove passed' : 'Failed',
      ok,
    });
    meta.push({
      label: 'Roundtrip latency',
      value: Math.max(1, Math.round(performance.now() - t0)) + ' ms',
    });

    return {
      status: ok ? 'supported' : 'partial',
      detail: ok
        ? 'A file was written to and read back from a directory inside the origin-private filesystem.'
        : 'API exists but a real write failed — private mode or blocked storage.',
      meta,
    };
  },
};
