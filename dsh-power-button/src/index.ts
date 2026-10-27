/**
 * 电源键 · 宿主半边。
 *
 * 浏览器没法直接杀进程——`window.close()` 只对脚本打开的窗口有效，
 * 也碰不到宿主。所以这里在 webServer 上注册一条 loopback-only 的
 * `POST /api/dsh-power/shutdown`，浏览器按下电源键就打它，宿主自己退。
 *
 * 退的方式与上游 dsh-desktop-launcher 一致：
 *   ① 有 `ctx.appExit`（launcher 提供的「有界退出」）就走它——先回收插件树
 *      再退出，cloudflared / pty 这类子进程会被各自的 disposer 收掉；
 *   ② 没有就退回 `process.exit(0)`（`dsh web` 目前不提供 appExit）。
 * 先回 200 再延迟 400ms 动手，让浏览器先把「已退出」画出来，不至于只看到
 * 一个断连错误页。
 *
 * 安全边界（与上游同款）：socket 必须来自 loopback、Host 头必须是 loopback、
 * 且浏览器同源标记不能是 cross-site。换句话说，局域网/公网访问者打不到这条
 * 路由——哪怕他们拿到了 UI。
 */
import type { Context } from '@deepseek-ai/cordis'
// 仅类型：把 ctx.webServer 的 Context 合并进来。
import type {} from '@deepseek-ai/dsh-host-webserver'
import type { IncomingMessage, ServerResponse } from 'node:http'

/** 浏览器半边写死同一串路径。 */
export const SHUTDOWN_PATH = '/api/dsh-power/shutdown'

/**
 * 关机路由需要 webServer 在场：没有 Web 服务就没有「网页上的电源键」。
 */
export const inject = ['webServer']

/** IPv4 127/8 判定（四段十进制，首段 127）。 */
function isIPv4Loopback(v4: string): boolean {
  const parts = v4.split('.')
  return parts.length === 4 && parts[0] === '127'
    && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

/** socket 远端地址是否落在 loopback（127/8、::1、IPv4-mapped）。 */
function isLoopbackAddress(address: string | undefined): boolean {
  if (address === undefined) return false
  const normalized = address.toLowerCase()
  if (normalized === '::1') return true
  if (normalized.startsWith('::ffff:')) return isIPv4Loopback(normalized.slice(7))
  return isIPv4Loopback(normalized)
}

/** Host 头里的主机名是否 loopback（localhost、[::1]、127/8）。 */
function isLoopbackHostname(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  return isIPv4Loopback(hostname)
}

/**
 * 请求级信任栅栏：socket 是 loopback + Host 头是 loopback + 浏览器同源标记。
 * socket 地址是权威——`X-Forwarded-For` 一概不信。
 * @param request - 待检查的请求。
 * @returns 是否允许执行关机。
 */
function isLoopbackRequest(request: IncomingMessage): boolean {
  if (!isLoopbackAddress(request.socket.remoteAddress)) return false
  const host = request.headers.host
  if (typeof host !== 'string') return false
  let hostUrl: URL
  try {
    hostUrl = new URL(`http://${host}`)
  } catch {
    return false
  }
  if (!isLoopbackHostname(hostUrl.hostname)) return false
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

/** 写一个 JSON 响应。 */
function writeJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'cache-control': 'no-store',
  })
  res.end(text)
}

/**
 * 宿主插件体：注册关机路由。
 * @param ctx - 宿主上下文。
 */
export function apply(ctx: Context): void {
  /** 只认第一次请求：退出一旦开始，重复点击不再叠加退出流程。 */
  let requested = false

  const requestExit = (code: number): void => {
    if (requested) return
    requested = true
    const exit = ctx.get('appExit')
    if (exit !== undefined) {
      exit(code)
      return
    }
    process.exit(code)
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: SHUTDOWN_PATH,
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
        res.end('method not allowed')
        return
      }
      if (!isLoopbackRequest(req)) {
        writeJson(res, 403, { ok: false, code: 'forbidden' })
        return
      }
      writeJson(res, 200, { ok: true })
      setTimeout(() => { requestExit(0) }, 400)
    },
  }), 'dsh-power: 关机路由')
}
