import type { CheckResult, Feature, MetaItem } from '../types.js';

const PROBE_FILE = 'capability-check-probe.txt';
const PROBE_TEXT = 'ok';

type StorageWithOPFS = StorageManager & {
  getDirectory?: () => Promise<FileSystemDirectoryHandle>;
};

/** Real probe: getDirectory → create file → write → read back → remove. 3s guard. */
async function roundtrip(): Promise<boolean> {
  const storage = navigator.storage as StorageWithOPFS;
  const probe = (async () => {
    const root = await storage.getDirectory!();
    const handle = await root.getFileHandle(PROBE_FILE, { create: true });
    const writable = await handle.createWritable();
    await writable.write(PROBE_TEXT);
    await writable.close();
    const file = await handle.getFile();
    const text = await file.text();
    await root.removeEntry(PROBE_FILE);
    return text === PROBE_TEXT;
  })();
  const timeout = new Promise<boolean>((resolve) =>
    setTimeout(() => resolve(false), 3000),
  );
  try {
    return await Promise.race([probe, timeout]);
  } catch {
    return false;
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + ' GB';
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(0) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
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

    const meta: MetaItem[] = [
      {
        label: 'Sync access handles',
        value:
          typeof FileSystemFileHandle !== 'undefined' &&
          'createSyncAccessHandle' in FileSystemFileHandle.prototype
            ? 'Available (workers)'
            : 'Unavailable',
        ok:
          typeof FileSystemFileHandle !== 'undefined' &&
          'createSyncAccessHandle' in FileSystemFileHandle.prototype,
      },
    ];
    try {
      const [estimate, persisted] = await Promise.all([
        storage.estimate?.(),
        storage.persisted?.(),
      ]);
      if (estimate?.quota) {
        meta.push({ label: 'Storage quota', value: formatBytes(estimate.quota) });
      }
      if (persisted !== undefined) {
        meta.push({
          label: 'Persistent storage',
          value: persisted ? 'Granted' : 'Not granted',
          ok: persisted,
        });
      }
    } catch {
      /* estimate/persisted are optional */
    }

    const ok = await roundtrip();
    return {
      status: ok ? 'supported' : 'partial',
      detail: ok
        ? 'A file was written to and read back from the origin-private filesystem.'
        : 'API exists but a real write failed — private mode or blocked storage.',
      meta,
    };
  },
};
