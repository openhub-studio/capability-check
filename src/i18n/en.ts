/* English dictionary — the canonical key space. zh.ts must implement
   every key here (compile-time enforced via Record<I18nKey, string>).
   Placeholders use {name} syntax. */

export const en = {
  /* meta + chrome */
  'meta.title': 'Capabilities — What can your browser do?',
  'meta.description':
    'A live report of the web platform features available in your browser. Checked locally — nothing leaves this device.',
  'nav.wordmark': 'Capabilities',
  'nav.rerun': 'Re-run',
  'nav.copyReport': 'Copy report',
  'nav.langToggle': 'Switch language to 中文',
  'nav.filterAria': 'Filter features by status',

  /* hero */
  'hero.title': 'What can your<br />browser do?',
  'hero.sub':
    'A live report of the web platform features available in this browser — checked locally. Nothing leaves your device.',

  /* summary */
  'summary.label': 'features fully supported',
  'summary.barAria': 'Share of supported features',
  'legend.supported': 'supported',
  'legend.partial': 'partial',
  'legend.unavailable': 'unavailable',
  'cta.run': 'Run the checks',
  'cta.progress': 'Checking… {done}/{total}',
  'cta.sub':
    '<b>{count}</b> checks run entirely on your device — nothing is uploaded.',
  'note.checking': 'Checking…',
  'note.allGood':
    'Everything on this list works here — no fallbacks needed.',
  'note.noneGood': 'None of these features are available in this browser.',
  'note.missingOne':
    '{missing} of {total} features is unavailable or limited — apps may need a fallback.',
  'note.missingMany':
    '{missing} of {total} features are unavailable or limited — apps may need fallbacks.',

  /* filters */
  'filter.all': 'All',
  'filter.supported': 'Supported',
  'filter.missing': 'Needs fallback',

  /* statuses */
  'status.pending': 'Pending',
  'status.checking': 'Checking',
  'status.supported': 'Supported',
  'status.partial': 'Partial',
  'status.unsupported': 'Not supported',

  /* groups */
  'group.compute.title': 'Compute',
  'group.compute.sub': 'Near-native performance, compiled and vectorised.',
  'group.graphics.title': 'Graphics',
  'group.graphics.sub': 'Modern GPU access for rendering and compute.',
  'group.storage.title': 'Storage',
  'group.storage.sub': 'Persistent data — caches, structured records, and files.',
  'group.pwa.title': 'Progressive Web App',
  'group.pwa.sub': 'What it takes to be installable and work offline.',
  'group.engagement.title': 'Engagement',
  'group.engagement.sub': 'OS-level touchpoints that keep users connected.',
  'group.other.title': 'Other',
  'group.count': '{ok}/{total} supported',

  /* update banner + toast + env */
  'update.text': 'A new version of this app is ready.',
  'update.reload': 'Reload',
  'update.later': 'Later',
  'toast.copied': 'Report copied to clipboard',
  'toast.copyFailed': 'Copy failed — check browser permissions',
  'env.insecure': 'insecure context',
  'footer.line1':
    'Runs entirely in your browser. No network requests, no telemetry.',
  'footer.line2': 'Open source under the MIT License.',
  'card.learnMore': 'Learn more',
  'run.error': 'Check error: {msg}',
  'run.noResult': 'Check returned no result.',

  /* shared meta labels / values */
  'meta.available': 'Available',
  'meta.unavailable': 'Unavailable',
  'meta.passed': 'Passed',
  'meta.failed': 'Failed',
  'meta.yes': 'Yes',
  'meta.no': 'No',
  'meta.none': 'None',
  'meta.missing': 'Missing',
  'meta.unknown': 'Unknown',
  'meta.quota': 'Storage quota',
  'meta.roundtrip': 'Roundtrip latency',

  /* wasm */
  'check.wasm.desc':
    'A binary instruction format that runs code at near-native speed inside the browser.',
  'check.wasm.noApi':
    'The WebAssembly object is not exposed by this browser.',
  'check.wasm.badValidation':
    'WebAssembly exists but failed binary validation.',
  'check.wasm.ok': 'Modules validate and instantiate correctly.',
  'check.wasm.partial':
    'Modules validate but could not be instantiated.',
  'check.wasm.meta.streaming': 'Streaming compilation',
  'check.wasm.meta.streamingOk': 'Passed (real compile)',
  'check.wasm.meta.threads': 'Threads (shared memory)',
  'check.wasm.meta.threadsReady': 'Ready',
  'check.wasm.meta.threadsNeedsIsolation':
    'Shared memory OK — needs COOP/COEP isolation',
  'check.wasm.meta.latency': 'Probe latency',

  /* wasm-simd */
  'check.simd.name': 'SIMD',
  'check.simd.tag': 'WASM SIMD128',
  'check.simd.desc':
    'Fixed-width 128-bit vector instructions for parallel data processing in WebAssembly.',
  'check.simd.noWasm': 'Requires WebAssembly, which is unavailable.',
  'check.simd.ok': 'v128 vector operations validate and instantiate.',
  'check.simd.partial':
    'SIMD binaries validate but fail to instantiate on this engine.',
  'check.simd.no': 'This engine rejects SIMD128 vector instructions.',
  'check.simd.meta.width': 'Vector width',
  'check.simd.meta.validation': 'Binary validation',
  'check.simd.meta.rejected': 'Rejected',
  'check.simd.meta.instantiate': 'Instantiation',

  /* webgpu */
  'check.webgpu.name': 'WebGPU',
  'check.webgpu.tag': 'GPU for the web',
  'check.webgpu.desc':
    'A modern low-level API for GPU rendering and general-purpose compute on the web.',
  'check.webgpu.insecure':
    'WebGPU requires a secure context (HTTPS or localhost).',
  'check.webgpu.noApi': 'navigator.gpu is not exposed by this browser.',
  'check.webgpu.noAdapter':
    'The API is present, but requestAdapter() returned no adapter — no usable GPU was found.',
  'check.webgpu.fallback':
    'Only a software fallback adapter is available — hardware acceleration may be off.',
  'check.webgpu.deviceFail':
    'An adapter exists but requestDevice() failed — GPU access is blocked.',
  'check.webgpu.ok':
    'A hardware GPU adapter was returned and a device was created.',
  'check.webgpu.meta.vendor': 'Vendor',
  'check.webgpu.meta.arch': 'Architecture',
  'check.webgpu.meta.device': 'Device',
  'check.webgpu.meta.features': 'Optional features',
  'check.webgpu.meta.featuresValue': '{n} exposed',
  'check.webgpu.meta.canvasFormat': 'Canvas format',
  'check.webgpu.meta.maxTex': 'Max 2D texture',
  'check.webgpu.meta.workgroup': 'Workgroup size',
  'check.webgpu.meta.workgroupValue': '{n} invocations',
  'check.webgpu.meta.deviceAcq': 'Device acquisition',

  /* cache-storage */
  'check.cache.name': 'Cache Storage',
  'check.cache.tag': 'Offline assets',
  'check.cache.desc':
    'Programmatic request/response storage — what service workers use to keep apps working offline.',
  'check.cache.noApi': 'window.caches is absent (API missing or insecure context).',
  'check.cache.ok': 'Write/read/delete roundtrip succeeded.',
  'check.cache.writeFail': 'Cache opened but the readback came up empty.',
  'check.cache.fail':
    'API exists but a real write failed — storage may be disabled.',

  /* indexeddb */
  'check.idb.name': 'IndexedDB',
  'check.idb.tag': 'Structured storage',
  'check.idb.desc':
    'Transactional client-side database for structured data — the backbone of offline-first apps.',
  'check.idb.noApi': 'indexedDB is not exposed by this browser.',
  'check.idb.ok':
    'A record was written and read back inside a real object store.',
  'check.idb.partial':
    'API exists but open/write failed — private mode or storage is blocked.',
  'check.idb.meta.dbList': 'Database listing',
  'check.idb.meta.writeRead': 'Write/read probe',
  'check.idb.meta.writeReadOk': 'Record stored and read back',

  /* opfs */
  'check.opfs.name': 'OPFS',
  'check.opfs.tag': 'File system storage',
  'check.opfs.desc':
    'Origin Private File System — a fast, origin-scoped virtual filesystem for persistent binary data.',
  'check.opfs.noApi':
    'navigator.storage.getDirectory is absent — OPFS is not implemented (or the context is insecure).',
  'check.opfs.ok':
    'A file was written to and read back from a directory inside the origin-private filesystem.',
  'check.opfs.partial':
    'API exists but a real write failed — private mode or blocked storage.',
  'check.opfs.meta.sync': 'Sync access handles',
  'check.opfs.meta.syncOk': 'Verified in a worker',
  'check.opfs.meta.syncFail': 'Worker write failed',
  'check.opfs.meta.syncUnknown': 'Probe inconclusive',
  'check.opfs.meta.persist': 'Persistent storage',
  'check.opfs.meta.granted': 'Granted',
  'check.opfs.meta.notGranted': 'Not granted',
  'check.opfs.meta.fileDir': 'File + directory probe',
  'check.opfs.meta.fileDirOk': 'Write/read/remove passed',

  /* secure-context */
  'check.secure.name': 'Secure Context',
  'check.secure.tag': 'HTTPS',
  'check.secure.desc':
    'Service workers, install prompts, and most PWA APIs require the page to be served over HTTPS or localhost.',
  'check.secure.ok':
    'This page is running in a secure context — powerful APIs are unlocked.',
  'check.secure.no':
    'Not a secure context — service workers, WebGPU, and install prompts are blocked.',
  'check.secure.meta.protocol': 'Protocol',
  'check.secure.meta.host': 'Host',
  'check.secure.meta.trust': 'Potentially trustworthy',
  'check.secure.meta.trustLocal': 'Localhost should qualify',
  'check.secure.meta.coep': 'Cross-origin isolated',
  'check.secure.meta.coepOn': 'Enabled (COOP/COEP set)',
  'check.secure.meta.coepOff': 'Off',

  /* service-worker */
  'check.sw.name': 'Service Worker',
  'check.sw.tag': 'Offline core',
  'check.sw.desc':
    'A scriptable network proxy that enables offline support, caching strategies, and push delivery.',
  'check.sw.noApi': 'navigator.serviceWorker is not exposed by this browser.',
  'check.sw.insecure':
    'Service workers require a secure context (HTTPS or localhost).',
  'check.sw.regFail':
    'API is present but a real registration failed or timed out.',
  'check.sw.ok':
    'A test worker registered, activated, and released successfully.',
  'check.sw.partial':
    'Registration worked but activation could not be confirmed.',
  'check.sw.meta.scope': 'Probe scope',
  'check.sw.meta.activation': 'Activation',
  'check.sw.meta.activationOk': 'Worker reached activated state',
  'check.sw.meta.activationUnknown': 'Not confirmed',
  'check.sw.meta.controlled': 'Page controlled',
  'check.sw.meta.regCount': 'Registrations on origin',

  /* installability */
  'check.install.name': 'App Install',
  'check.install.tag': 'Manifest + prompt',
  'check.install.desc':
    'Whether the browser exposes an install surface — the beforeinstallprompt event or a manual Add-to-Home-Screen flow.',
  'check.install.okPrompt':
    'This browser can fire an install prompt for eligible apps.',
  'check.install.okNoManifest':
    'Prompt API exists — note this page links no manifest, so no prompt would fire here.',
  'check.install.apple':
    'No install-prompt API — this platform installs via the manual “Add to Home Screen” flow.',
  'check.install.no': 'No install surface detected for web apps.',
  'check.install.meta.promptApi': 'Prompt API',
  'check.install.meta.installed': 'Running installed',
  'check.install.meta.manifest': 'Manifest',
  'check.install.meta.manifestOk': 'Parsed',
  'check.install.meta.manifestFail': 'Linked but failed to load',
  'check.install.meta.manifestInvalid': 'Linked but invalid JSON',
  'check.install.meta.manifestNone': 'None linked on this page',
  'check.install.meta.appName': 'App name',
  'check.install.meta.icons': 'Icons',
  'check.install.meta.iconsCount': '{n} declared',
  'check.install.meta.iconsCountLarge': '{n} declared (≥192px)',
  'check.install.meta.display': 'Display mode',

  /* background-sync */
  'check.bgsync.name': 'Background Sync',
  'check.bgsync.tag': 'Deferred work',
  'check.bgsync.desc':
    'Lets a service worker retry failed requests and run periodic work in the background.',
  'check.bgsync.noSw':
    'No service worker support — background sync cannot exist here.',
  'check.bgsync.both':
    'One-off and periodic background sync are both available.',
  'check.bgsync.partial':
    'Basic sync works; periodic background sync is missing.',
  'check.bgsync.no': 'This browser does not implement background sync.',
  'check.bgsync.meta.swApi': 'Service Worker API',
  'check.bgsync.meta.swApiPresent': 'Present',
  'check.bgsync.meta.swApiLimited': 'Present (limited)',
  'check.bgsync.meta.sync': 'One-off sync',
  'check.bgsync.meta.syncValue': 'SyncManager on registrations',
  'check.bgsync.meta.periodic': 'Periodic sync',
  'check.bgsync.meta.periodicValue': 'PeriodicSyncManager on registrations',

  /* notifications-push */
  'check.push.name': 'Notifications & Push',
  'check.push.tag': 'Re-engagement',
  'check.push.desc':
    'Local notifications plus push messages delivered to the service worker while the app is closed.',
  'check.push.denied':
    'Both APIs exist, but notifications are blocked in browser settings — prompts will never show.',
  'check.push.ok':
    'Both notification display and push delivery are available.',
  'check.push.okGranted':
    'Both notification display and push delivery are available. Permission is already granted.',
  'check.push.notifOnly':
    'Notifications work but the Push API (or its service worker plumbing) is missing.',
  'check.push.pushOnly':
    'Push plumbing exists but notifications are unavailable.',
  'check.push.no': 'Neither notifications nor push messaging is available.',
  'check.push.meta.notifApi': 'Notification API',
  'check.push.meta.pushApi': 'Push API',
  'check.push.meta.path': 'Delivery path',
  'check.push.meta.pathOk':
    'Service worker present — push can reach a closed app',
  'check.push.meta.pathNo': 'No service worker — push cannot be delivered',
  'check.push.meta.encodings': 'Push encodings',
  'check.push.meta.permission': 'Permission',
  'perm.granted': 'Granted',
  'perm.default': 'Default',
  'perm.denied': 'Denied',

  /* web-share */
  'check.share.name': 'Web Share',
  'check.share.tag': 'OS share sheet',
  'check.share.desc':
    'Hands text, links, and files to the operating system share sheet — the native sharing path for installed apps.',
  'check.share.ok':
    'navigator.share is available — the OS share sheet can be invoked.',
  'check.share.noFiles':
    'navigator.share works for text/links, but this browser rejects file payloads.',
  'check.share.noApi':
    'navigator.share is not exposed (may require HTTPS on this platform).',
  'check.share.meta.url': 'URL payload',
  'check.share.meta.file': 'File payload',
  'check.share.meta.accepted': 'Accepted',
  'check.share.meta.rejected': 'Rejected',
  'check.share.meta.unverifiable': 'Not verifiable',
} as const;

export type I18nKey = keyof typeof en;
