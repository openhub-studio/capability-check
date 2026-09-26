/* 简体中文 dictionary — every key in en.ts must be present here.
   TypeScript errors out on missing or extra keys. */

import type { I18nKey } from './en.js';

export const zh: Record<I18nKey, string> = {
  /* meta + chrome */
  'meta.title': '能力检测 — 你的浏览器能做什么？',
  'meta.description':
    '实时检测当前浏览器可用的 Web 平台能力。全部在本地完成——数据不会离开你的设备。',
  'nav.wordmark': '能力检测',
  'nav.rerun': '重新检测',
  'nav.copyReport': '复制报告',
  'nav.langToggle': 'Switch language to English',
  'nav.filterAria': '按状态筛选特性',

  /* hero */
  'hero.title': '你的浏览器<br />能做什么？',
  'hero.sub':
    '实时展示此浏览器支持的 Web 平台能力——检测在本地完成，数据不会离开你的设备。',

  /* summary */
  'summary.label': '项特性完全支持',
  'summary.barAria': '已支持特性的占比',
  'legend.supported': '支持',
  'legend.partial': '部分支持',
  'legend.unavailable': '不可用',
  'cta.run': '开始检测',
  'cta.progress': '检测中… {done}/{total}',
  'cta.sub':
    '共 <b>{count}</b> 项检测，全部在你的设备本地运行——不会上传任何数据。',
  'note.checking': '检测中…',
  'note.allGood': '此浏览器支持列表中的全部特性——无需任何降级方案。',
  'note.noneGood': '此浏览器不支持这些特性。',
  'note.missingOne': '{total} 项特性中有 {missing} 项不可用或受限——应用可能需要降级方案。',
  'note.missingMany': '{total} 项特性中有 {missing} 项不可用或受限——应用可能需要降级方案。',

  /* filters */
  'filter.all': '全部',
  'filter.supported': '支持',
  'filter.missing': '需降级',

  /* statuses */
  'status.pending': '待检测',
  'status.checking': '检测中',
  'status.supported': '支持',
  'status.partial': '部分支持',
  'status.unsupported': '不支持',

  /* groups */
  'group.compute.title': '计算',
  'group.compute.sub': '接近原生的性能，编译执行与向量化。',
  'group.graphics.title': '图形',
  'group.graphics.sub': '用于渲染与计算的现代 GPU 访问能力。',
  'group.storage.title': '存储',
  'group.storage.sub': '持久化数据——缓存、结构化记录与文件。',
  'group.pwa.title': '渐进式 Web 应用',
  'group.pwa.sub': '实现可安装与离线可用所需的能力。',
  'group.engagement.title': '用户触达',
  'group.engagement.sub': '让用户保持连接的系统级触点。',
  'group.other.title': '其他',
  'group.count': '{ok}/{total} 项支持',

  /* update banner + toast + env */
  'update.text': '有新版本可用。',
  'update.reload': '立即更新',
  'update.later': '稍后',
  'toast.copied': '报告已复制到剪贴板',
  'toast.copyFailed': '复制失败——请检查浏览器权限',
  'env.insecure': '非安全上下文',
  'footer.line1': '全部在你的浏览器内运行。不发送网络请求，不收集遥测数据。',
  'footer.line2': '基于 MIT 许可证开源。',
  'card.learnMore': '了解更多',
  'run.error': '检测出错：{msg}',
  'run.noResult': '检测未返回结果。',

  /* shared meta labels / values */
  'meta.available': '可用',
  'meta.unavailable': '不可用',
  'meta.passed': '通过',
  'meta.failed': '失败',
  'meta.yes': '是',
  'meta.no': '否',
  'meta.none': '无',
  'meta.missing': '缺失',
  'meta.unknown': '未知',
  'meta.quota': '存储配额',
  'meta.roundtrip': '往返耗时',

  /* wasm */
  'check.wasm.desc': '以接近原生的速度在浏览器中运行代码的二进制指令格式。',
  'check.wasm.noApi': '浏览器未暴露 WebAssembly 对象。',
  'check.wasm.badValidation': '存在 WebAssembly，但二进制校验失败。',
  'check.wasm.ok': '模块可正常校验并实例化。',
  'check.wasm.partial': '模块可校验，但无法实例化。',
  'check.wasm.meta.streaming': '流式编译',
  'check.wasm.meta.streamingOk': '通过（真实编译）',
  'check.wasm.meta.threads': '线程（共享内存）',
  'check.wasm.meta.threadsReady': '就绪',
  'check.wasm.meta.threadsNeedsIsolation': '共享内存可用——需 COOP/COEP 隔离',
  'check.wasm.meta.latency': '探测耗时',

  /* wasm-simd */
  'check.simd.name': 'SIMD',
  'check.simd.tag': 'WASM SIMD128',
  'check.simd.desc': 'WebAssembly 中用于并行数据处理的定长 128 位向量指令。',
  'check.simd.noWasm': '依赖 WebAssembly，但当前不可用。',
  'check.simd.ok': 'v128 向量运算可校验并实例化。',
  'check.simd.partial': 'SIMD 二进制可校验，但此引擎无法实例化。',
  'check.simd.no': '此引擎拒绝 SIMD128 向量指令。',
  'check.simd.meta.width': '向量位宽',
  'check.simd.meta.validation': '二进制校验',
  'check.simd.meta.rejected': '被拒绝',
  'check.simd.meta.instantiate': '实例化',

  /* webgpu */
  'check.webgpu.name': 'WebGPU',
  'check.webgpu.tag': 'Web 上的 GPU',
  'check.webgpu.desc': '用于 Web 图形渲染与通用计算的现代底层 API。',
  'check.webgpu.insecure': 'WebGPU 需要安全上下文（HTTPS 或 localhost）。',
  'check.webgpu.noApi': '浏览器未暴露 navigator.gpu。',
  'check.webgpu.noAdapter':
    'API 存在，但 requestAdapter() 未返回适配器——没有可用的 GPU。',
  'check.webgpu.fallback':
    '仅提供软件回退适配器——硬件加速可能已关闭。',
  'check.webgpu.deviceFail':
    '存在适配器但 requestDevice() 失败——GPU 访问被阻止。',
  'check.webgpu.ok': '已返回硬件 GPU 适配器并成功创建设备。',
  'check.webgpu.meta.vendor': '厂商',
  'check.webgpu.meta.arch': '架构',
  'check.webgpu.meta.device': '设备',
  'check.webgpu.meta.features': '可选特性',
  'check.webgpu.meta.featuresValue': '已暴露 {n} 项',
  'check.webgpu.meta.canvasFormat': '画布格式',
  'check.webgpu.meta.maxTex': '最大 2D 纹理',
  'check.webgpu.meta.workgroup': '工作组大小',
  'check.webgpu.meta.workgroupValue': '{n} 次调用',
  'check.webgpu.meta.deviceAcq': '设备获取',

  /* cache-storage */
  'check.cache.name': 'Cache Storage',
  'check.cache.tag': '离线资源',
  'check.cache.desc': '可编程的请求/响应存储——Service Worker 用它让应用离线可用。',
  'check.cache.noApi': 'window.caches 不存在（API 缺失或上下文不安全）。',
  'check.cache.ok': '写入/读取/删除往返成功。',
  'check.cache.writeFail': '缓存已打开，但读回结果为空。',
  'check.cache.fail': 'API 存在，但真实写入失败——存储可能已被禁用。',

  /* indexeddb */
  'check.idb.name': 'IndexedDB',
  'check.idb.tag': '结构化存储',
  'check.idb.desc': '用于结构化数据的事务型客户端数据库——离线优先应用的基石。',
  'check.idb.noApi': '浏览器未暴露 indexedDB。',
  'check.idb.ok': '已在真实对象仓库中写入并读回一条记录。',
  'check.idb.partial': 'API 存在，但打开/写入失败——可能是隐私模式或存储被阻止。',
  'check.idb.meta.dbList': '数据库列表',
  'check.idb.meta.writeRead': '读写探测',
  'check.idb.meta.writeReadOk': '记录已写入并读回',

  /* opfs */
  'check.opfs.name': 'OPFS',
  'check.opfs.tag': '文件系统存储',
  'check.opfs.desc': 'Origin Private File System——面向持久化二进制数据的高速源站私有虚拟文件系统。',
  'check.opfs.noApi':
    'navigator.storage.getDirectory 不存在——未实现 OPFS（或上下文不安全）。',
  'check.opfs.ok': '已在源站私有文件系统的目录中写入并读回文件。',
  'check.opfs.partial': 'API 存在，但真实写入失败——可能是隐私模式或存储被阻止。',
  'check.opfs.meta.sync': '同步访问句柄',
  'check.opfs.meta.syncOk': '已在 Worker 中验证',
  'check.opfs.meta.syncFail': 'Worker 写入失败',
  'check.opfs.meta.syncUnknown': '探测未得出结论',
  'check.opfs.meta.persist': '持久化存储',
  'check.opfs.meta.granted': '已授予',
  'check.opfs.meta.notGranted': '未授予',
  'check.opfs.meta.fileDir': '文件与目录探测',
  'check.opfs.meta.fileDirOk': '写入/读取/删除通过',

  /* secure-context */
  'check.secure.name': '安全上下文',
  'check.secure.tag': 'HTTPS',
  'check.secure.desc':
    'Service Worker、安装提示及大多数 PWA API 都要求页面通过 HTTPS 或 localhost 提供。',
  'check.secure.ok': '此页面运行于安全上下文——高权限 API 已解锁。',
  'check.secure.no': '非安全上下文——Service Worker、WebGPU 与安装提示均被阻止。',
  'check.secure.meta.protocol': '协议',
  'check.secure.meta.host': '主机',
  'check.secure.meta.trust': '潜在可信',
  'check.secure.meta.trustLocal': 'localhost 应视为可信',
  'check.secure.meta.coep': '跨源隔离',
  'check.secure.meta.coepOn': '已启用（已设置 COOP/COEP）',
  'check.secure.meta.coepOff': '关闭',

  /* service-worker */
  'check.sw.name': 'Service Worker',
  'check.sw.tag': '离线核心',
  'check.sw.desc': '可编程的网络代理，支持离线访问、缓存策略与推送投递。',
  'check.sw.noApi': '浏览器未暴露 navigator.serviceWorker。',
  'check.sw.insecure': 'Service Worker 需要安全上下文（HTTPS 或 localhost）。',
  'check.sw.regFail': 'API 存在，但真实注册失败或超时。',
  'check.sw.ok': '测试 Worker 已完成注册、激活并成功注销。',
  'check.sw.partial': '注册成功，但无法确认激活。',
  'check.sw.meta.scope': '探测作用域',
  'check.sw.meta.activation': '激活状态',
  'check.sw.meta.activationOk': 'Worker 已进入 activated 状态',
  'check.sw.meta.activationUnknown': '未确认',
  'check.sw.meta.controlled': '页面受控',
  'check.sw.meta.regCount': '源站注册数',

  /* installability */
  'check.install.name': '应用安装',
  'check.install.tag': '清单 + 提示',
  'check.install.desc':
    '浏览器是否提供安装入口——beforeinstallprompt 事件或手动的"添加到主屏幕"流程。',
  'check.install.okPrompt': '此浏览器可为符合条件的应用触发安装提示。',
  'check.install.okNoManifest':
    '提示 API 存在——但本页未链接清单，此处不会触发安装提示。',
  'check.install.apple':
    '无安装提示 API——此平台通过手动"添加到主屏幕"流程安装。',
  'check.install.no': '未检测到 Web 应用的安装入口。',
  'check.install.meta.promptApi': '提示 API',
  'check.install.meta.installed': '已安装运行',
  'check.install.meta.manifest': '清单',
  'check.install.meta.manifestOk': '已解析',
  'check.install.meta.manifestFail': '已链接但加载失败',
  'check.install.meta.manifestInvalid': '已链接但 JSON 无效',
  'check.install.meta.manifestNone': '本页未链接清单',
  'check.install.meta.appName': '应用名称',
  'check.install.meta.icons': '图标',
  'check.install.meta.iconsCount': '已声明 {n} 个',
  'check.install.meta.iconsCountLarge': '已声明 {n} 个（≥192px）',
  'check.install.meta.display': '显示模式',

  /* background-sync */
  'check.bgsync.name': '后台同步',
  'check.bgsync.tag': '延迟任务',
  'check.bgsync.desc': '让 Service Worker 重试失败请求，并在后台执行周期性任务。',
  'check.bgsync.noSw': '不支持 Service Worker——此处无法使用后台同步。',
  'check.bgsync.both': '单次与周期性后台同步均可用。',
  'check.bgsync.partial': '基础同步可用，但缺少周期性后台同步。',
  'check.bgsync.no': '此浏览器未实现后台同步。',
  'check.bgsync.meta.swApi': 'Service Worker API',
  'check.bgsync.meta.swApiPresent': '存在',
  'check.bgsync.meta.swApiLimited': '存在（受限）',
  'check.bgsync.meta.sync': '单次同步',
  'check.bgsync.meta.syncValue': '注册对象含 SyncManager',
  'check.bgsync.meta.periodic': '周期性同步',
  'check.bgsync.meta.periodicValue': '注册对象含 PeriodicSyncManager',

  /* notifications-push */
  'check.push.name': '通知与推送',
  'check.push.tag': '再触达',
  'check.push.desc': '本地通知，以及在应用关闭时向 Service Worker 投递的推送消息。',
  'check.push.denied':
    '两个 API 均存在，但通知已在浏览器设置中被阻止——提示将永远无法显示。',
  'check.push.ok': '通知展示与推送投递均可用。',
  'check.push.okGranted': '通知展示与推送投递均可用。权限已授予。',
  'check.push.notifOnly':
    '通知可用，但缺少 Push API（或其 Service Worker 链路）。',
  'check.push.pushOnly': '推送链路存在，但通知不可用。',
  'check.push.no': '通知与推送消息均不可用。',
  'check.push.meta.notifApi': '通知 API',
  'check.push.meta.pushApi': '推送 API',
  'check.push.meta.path': '投递路径',
  'check.push.meta.pathOk': '存在 Service Worker——应用关闭后推送仍可送达',
  'check.push.meta.pathNo': '无 Service Worker——推送无法送达',
  'check.push.meta.encodings': '推送加密编码',
  'check.push.meta.permission': '权限',
  'perm.granted': '已授予',
  'perm.default': '默认',
  'perm.denied': '已拒绝',

  /* web-share */
  'check.share.name': '网页分享',
  'check.share.tag': '系统分享面板',
  'check.share.desc': '将文本、链接和文件交给操作系统分享面板——已安装应用的原生分享路径。',
  'check.share.ok': 'navigator.share 可用——可以调起系统分享面板。',
  'check.share.noFiles':
    'navigator.share 支持文本/链接，但此浏览器拒绝文件载荷。',
  'check.share.noApi': 'navigator.share 未暴露（此平台可能需要 HTTPS）。',
  'check.share.meta.url': 'URL 载荷',
  'check.share.meta.file': '文件载荷',
  'check.share.meta.accepted': '接受',
  'check.share.meta.rejected': '拒绝',
  'check.share.meta.unverifiable': '无法验证',
};
