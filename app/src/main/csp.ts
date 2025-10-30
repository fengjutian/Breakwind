import { getWebRequestManager } from './webRequestManager'

/**
 * 定义需要在CSP中允许的API端点列表
 * 包含主要API基础URL和遥测数据URL
 */
const CSP_API_ENDPOINTS = [
  import.meta.env.P_VITE_API_BASE ?? 'https://deta.space',
  'https://telemetry.deta.surf'
]

/**
 * 定义内容安全策略(CSP)指令数组
 * CSP是一种安全机制，用于减轻XSS等攻击
 */
const CSP_DIRECTIVES = [
  // 只允许从同一来源（域名）加载资源
  "default-src 'self' surf-internal:",

  // 允许从同一来源、内联脚本、eval()和blob: URL加载脚本
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: surf-internal:",

  // 允许从同一来源和内联样式加载样式
  "style-src 'self' 'unsafe-inline' surf-internal:",

  // 允许从同一来源、data: URL和任何HTTPS源加载图片（用于标签图标和资源预览）
  "img-src 'self' surf-internal: surf: data: blob: https: crx:",

  // 允许从同一来源和blob: URL加载对象（用于PDF预览）
  "object-src 'self' blob: surf-internal:",

  // 允许从同一来源和blob: URL加载框架（用于PDF预览）
  "frame-src 'self' blob: surf-internal: surf-internal://*",

  // 允许从同一来源和blob: URL加载媒体内容（用于视频预览）
  "media-src 'self' blob: surf-internal:",

  // 允许访问跨域窗口（用于覆盖层通信）
  "frame-ancestors 'self' surf-internal://*",

  // 允许连接到同一来源、localhost（HTTP/WS）和特定API
  `connect-src 'self' surf-internal: surf: http://localhost:* ws://localhost:* ws://core:* https://*.sentry.io ${CSP_API_ENDPOINTS.join(' ')}`,

  // 允许从同一来源和blob: URL加载Web Worker
  "worker-src 'self' blob: surf-internal:"
]

/**
 * 为Electron会话应用内容安全策略
 * @param session 要应用CSP的Electron会话对象
 * 通过拦截HTTP响应并添加Content-Security-Policy头部来实现
 */
export const applyCSPToSession = (session: Electron.Session) => {
  getWebRequestManager().addHeadersReceived(session, (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CSP_DIRECTIVES.join('; ')]
      }
    })
  })
}
