// src/index.ts
/** 浏览器半边写死同一串路径。 */
const SHUTDOWN_PATH = "/api/dsh-power/shutdown";
/**
* 关机路由需要 webServer 在场：没有 Web 服务就没有「网页上的电源键」。
*/
const inject = ["webServer"];
/** IPv4 127/8 判定（四段十进制，首段 127）。 */
function isIPv4Loopback(v4) {
	const parts = v4.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/** socket 远端地址是否落在 loopback（127/8、::1、IPv4-mapped）。 */
function isLoopbackAddress(address) {
	if (address === void 0) return false;
	const normalized = address.toLowerCase();
	if (normalized === "::1") return true;
	if (normalized.startsWith("::ffff:")) return isIPv4Loopback(normalized.slice(7));
	return isIPv4Loopback(normalized);
}
/** Host 头里的主机名是否 loopback（localhost、[::1]、127/8）。 */
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	return isIPv4Loopback(hostname);
}
/**
* 请求级信任栅栏：socket 是 loopback + Host 头是 loopback + 浏览器同源标记。
* socket 地址是权威——`X-Forwarded-For` 一概不信。
* @param request - 待检查的请求。
* @returns 是否允许执行关机。
*/
function isLoopbackRequest(request) {
	if (!isLoopbackAddress(request.socket.remoteAddress)) return false;
	const host = request.headers.host;
	if (typeof host !== "string") return false;
	let hostUrl;
	try {
		hostUrl = new URL(`http://${host}`);
	} catch {
		return false;
	}
	if (!isLoopbackHostname(hostUrl.hostname)) return false;
	if (request.headers["sec-fetch-site"] === "cross-site") return false;
	const origin = request.headers.origin;
	if (origin === void 0) return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
/** 写一个 JSON 响应。 */
function writeJson(res, status, body) {
	const text = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(text),
		"cache-control": "no-store"
	});
	res.end(text);
}
/**
* 宿主插件体：注册关机路由。
* @param ctx - 宿主上下文。
*/
function apply(ctx) {
	/** 只认第一次请求：退出一旦开始，重复点击不再叠加退出流程。 */
	let requested = false;
	const requestExit = (code) => {
		if (requested) return;
		requested = true;
		const exit = ctx.get("appExit");
		if (exit !== void 0) {
			exit(code);
			return;
		}
		process.exit(code);
	};
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: SHUTDOWN_PATH,
		handler: async (req, res) => {
			if (req.method !== "POST") {
				res.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
				res.end("method not allowed");
				return;
			}
			if (!isLoopbackRequest(req)) {
				writeJson(res, 403, {
					ok: false,
					code: "forbidden"
				});
				return;
			}
			writeJson(res, 200, { ok: true });
			setTimeout(() => {
				requestExit(0);
			}, 400);
		}
	}), "dsh-power: 关机路由");
}
export { SHUTDOWN_PATH, apply, inject };
