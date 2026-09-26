/* ============================================================
   checks/index.ts — the capability registry (extension point)
   ------------------------------------------------------------
   HOW TO ADD A NEW CHECK
   1. Create src/checks/my-check.ts exporting a Feature object:

        import type { Feature } from '../types.js';

        export const myCheck: Feature = {
          id: 'my-check',              // unique key
          name: 'My Check',            // display name
          tag: 'v1',                   // small line under the name
          group: 'compute',            // key of an entry in groups.ts
          docs: 'https://…',           // "Learn more" link
          icon: '<svg …></svg>',       // 24×24, stroke-based
          description: 'One sentence shown on the card.',
          async detect(): Promise<CheckResult> {
            // status: 'supported' | 'partial' | 'unsupported'
            // meta:   optional [{ label, value, ok }] rows
            return { status: 'supported', detail: '…' };
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

/** Detection order = display order within each group. */
export const FEATURES: Feature[] = [wasm, wasmSimd, webgpu];
