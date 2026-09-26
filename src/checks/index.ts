/* ============================================================
   checks/index.ts — the capability registry (extension point)
   ------------------------------------------------------------
   HOW TO ADD A NEW CHECK
   1. Create src/checks/my-check.ts exporting a Feature object:

        import type { Feature } from '../types.js';
        import { msg } from '../i18n/index.js';

        export const myCheck: Feature = {
          id: 'my-check',                    // unique key
          name: msg('check.myCheck.name'),   // add keys to i18n/en.ts + zh.ts
          tag: msg('check.myCheck.tag'),     // small line under the name
          group: 'compute',                  // key of an entry in groups.ts
          docs: 'https://…',                 // "Learn more" link
          icon: '<svg …></svg>',             // 24×24, stroke-based
          description: msg('check.myCheck.desc'),
          async detect(): Promise<CheckResult> {
            // status: 'supported' | 'partial' | 'unsupported'
            // meta:   optional [{ label, value, ok }] rows — msg() or literal
            return { status: 'supported', detail: msg('check.myCheck.ok') };
          },
        };

   2. Import it here and add it to FEATURES.
   3. If `group` doesn't exist yet, add it to src/groups.ts.
   That's it — cards, badges, summary score and the report pick it up.
   Throwing from detect() is safe: the runner reports it as unsupported.
   ============================================================ */

import type { Feature } from '../types.js';
import { wasm } from './wasm.js';
import { wasmSimd } from './wasm-simd.js';
import { webgpu } from './webgpu.js';
import { secureContext } from './secure-context.js';
import { serviceWorker } from './service-worker.js';
import { installability } from './installability.js';
import { cacheStorage } from './cache-storage.js';
import { indexeddb } from './indexeddb.js';
import { opfs } from './opfs.js';
import { notificationsPush } from './notifications-push.js';
import { webShare } from './web-share.js';
import { backgroundSync } from './background-sync.js';

/** Detection order = display order within each group. */
export const FEATURES: Feature[] = [
  wasm,
  wasmSimd,
  webgpu,
  cacheStorage,
  indexeddb,
  opfs,
  secureContext,
  serviceWorker,
  installability,
  backgroundSync,
  notificationsPush,
  webShare,
];
