import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';
import { formatBytes, tryProbe } from './common.js';

const DB_NAME = 'capability-check-probe';
const STORE = 'probe';
const KEY = 'k';
const VALUE = 'ok';

/**
 * Real probe: open → create object store → write a record → read it back →
 * delete the database. 3s guard.
 */
function roundtrip(): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (!done) {
        done = true;
        resolve(ok);
      }
    };
    const cleanup = (db: IDBDatabase | null) => {
      db?.close();
      const del = indexedDB.deleteDatabase(DB_NAME);
      del.onsuccess = del.onerror = del.onblocked = () => undefined;
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
    req.onupgradeneeded = () => {
      try {
        req.result.createObjectStore(STORE);
      } catch {
        /* handled by onerror / transaction failure */
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      try {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        store.put(VALUE, KEY);
        const get = store.get(KEY);
        get.onsuccess = () => finish(get.result === VALUE);
        get.onerror = () => finish(false);
        tx.oncomplete = () => cleanup(db);
        tx.onerror = tx.onabort = () => {
          cleanup(db);
          finish(false);
        };
      } catch {
        cleanup(db);
        finish(false);
      }
    };
    setTimeout(() => finish(false), 3000);
  });
}

export const indexeddb: Feature = {
  id: 'indexeddb',
  name: msg('check.idb.name'),
  tag: msg('check.idb.tag'),
  group: 'storage',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3.5" width="18" height="5" rx="1.5"/>
    <rect x="3" y="9.5" width="18" height="5" rx="1.5"/>
    <rect x="3" y="15.5" width="18" height="5" rx="1.5"/>
  </svg>`,
  description: msg('check.idb.desc'),
  async detect(): Promise<CheckResult> {
    if (!('indexedDB' in window) || !indexedDB) {
      return {
        status: 'unsupported',
        detail: msg('check.idb.noApi'),
      };
    }
    const meta: MetaItem[] = [
      {
        label: msg('check.idb.meta.dbList'),
        value:
          typeof indexedDB.databases === 'function'
            ? msg('meta.available')
            : msg('meta.unavailable'),
        ok:
          typeof indexedDB.databases === 'function' ? true : null,
      },
    ];
    const est = await tryProbe(navigator.storage?.estimate?.());
    if (est?.quota) {
      meta.push({ label: msg('meta.quota'), value: formatBytes(est.quota) });
    }

    const t0 = performance.now();
    const ok = await tryProbe(roundtrip());
    meta.push({
      label: msg('check.idb.meta.writeRead'),
      value: ok ? msg('check.idb.meta.writeReadOk') : msg('meta.failed'),
      ok: ok === true,
    });
    const ms = Math.max(1, Math.round(performance.now() - t0));
    meta.push({ label: msg('meta.roundtrip'), value: ms + ' ms' });

    return {
      status: ok ? 'supported' : 'partial',
      detail: ok
        ? msg('check.idb.ok')
        : msg('check.idb.partial'),
      meta,
    };
  },
};
