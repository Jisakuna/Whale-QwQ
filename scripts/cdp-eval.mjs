/**
 * 通用 CDP 探针：打开 Web GUI，等模块图与插件就绪，执行一段表达式并打印结果。
 * 用法：node scripts/cdp-eval.mjs <url> "<expression>"
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [url, expression] = process.argv.slice(2)
const PORT = 9300 + Math.floor(Math.random() * 300)
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'dsh-cdp3-'))}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=1520,960', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let ws
for (let i = 0; i < 60 && !ws; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
    if (r.ok) ws = (await r.json()).webSocketDebuggerUrl
  } catch {}
  if (!ws) await sleep(300)
}
const browser = new WebSocket(ws)
await new Promise((res, rej) => { browser.onopen = res; browser.onerror = rej })
let nextId = 1
const pending = new Map()
browser.onmessage = (msg) => {
  const d = JSON.parse(msg.data)
  if (d.id !== undefined) {
    const p = pending.get(d.id); pending.delete(d.id)
    d.error ? p.reject(new Error(d.error.message)) : p.resolve(d.result)
  }
}
const send = (method, params = {}, sessionId) => {
  const id = nextId++
  const payload = { id, method, params }
  if (sessionId) payload.sessionId = sessionId
  browser.send(JSON.stringify(payload))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const S = (m, p) => send(m, p, sessionId)
await S('Runtime.enable'); await S('Page.enable')
if (process.env.DARK) {
  await S('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  })
}
await S('Page.navigate', { url })
await sleep(Number(process.env.WAIT ?? 11000))
const r = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
console.log(JSON.stringify(r.exceptionDetails ? { __error: r.exceptionDetails.exception?.description ?? r.exceptionDetails.text } : r.result.value, null, 2))
await send('Target.closeTarget', { targetId }); browser.close(); chrome.kill(); process.exit(0)
