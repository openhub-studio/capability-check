import type { CheckResult, Feature } from '../types.js';

const DB_NAME = 'capability-check-probe';

/** Real probe: open a database, then delete it. 3s guard. */
function roundtrip(): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (!done) {
        done = true;
        resolve(ok);
      }
    };
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, 1);
    } catch {
      finish(false);
      return;
    }
    req.onerror = () => finish(false);
    req.onblocked = () => finish(false);
    req.onsuccess = () => {
      req.result.close();
      const del = indexedDB.deleteDatabase(DB_NAME);
      // delete failures are cosmetic — the open itself proved support
      del.onsuccess = () => finish(true);
      del.onerror = () => finish(true);
      del.onblocked = () => finish(true);
    };
    setTimeout(() => finish(false), 3000);
  });
}

export const indexeddb: Feature = {
  id: 'indexeddb',
  name: 'IndexedDB',
  tag: 'Structured storage',
  group: 'storage',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3.5" width="18" height="5" rx="1.5"/>
    <rect x="3" y="9.5" width="18" height="5" rx="1.5"/>
    <rect x="3" y="15.5" width="18" height="5" rx="1.5"/>
  </svg>`,
  description:
    'Transactional client-side database for structured data — the backbone of offline-first apps.',
  async detect(): Promise<CheckResult> {
    if (!('indexedDB' in window) || !indexedDB) {
      return {
        status: 'unsupported',
        detail: 'indexedDB is not exposed by this browser.',
      };
    }
    const ok = await roundtrip();
    return {
      status: ok ? 'supported' : 'partial',
      detail: ok
        ? 'A probe database opened and was removed cleanly.'
        : 'API exists but open() failed — private mode or storage is blocked.',
    };
  },
};
