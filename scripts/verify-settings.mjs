/**
 * 端到端验证 2：账号菜单 → 设置 → 通用，确认「换装」「自定义背景」两行在册，
 * 点一次 Joi · Library，确认 token 层跟着换。
 *
 * 用法：node scripts/verify-settings.mjs <url>
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const url = process.argv[2]
const PORT = 9225
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'dsh-cdp2-'))}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=1520,960', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let ws
for (let i = 0; i < 60 && !ws; i++) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl } catch {}
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
await S('Page.navigate', { url })
await sleep(11000)

async function ev(expression) {
  const r = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) return { __error: r.exceptionDetails.exception?.description ?? r.exceptionDetails.text }
  return r.result.value
}

const out = {}
out.before = await ev('window.__joi ? window.__joi() : null')
out.menu = await ev(`(async () => {
  const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label') || '') === '账号菜单')
  if (!b) return 'no-account'
  b.click()
  await new Promise(r => setTimeout(r, 900))
  const item = [...document.querySelectorAll('button[role=menuitem]')]
    .find(el => (el.innerText || '').trim().startsWith('设置'))
  if (!item) return 'no-settings-item'
  item.click()
  return 'opened'
})()`)
await sleep(2500)
out.general = await ev(`(async () => {
  const nav = [...document.querySelectorAll('button,[role=tab],a,li')]
    .find(el => (el.innerText || '').trim() === '通用设置')
  if (!nav) return 'no-general-nav'
  nav.click()
  await new Promise(r => setTimeout(r, 1500))
  return 'clicked'
})()`)
await sleep(1500)
out.dialog = await ev(`(() => {
  const d = document.querySelector('[role=dialog]')
  return d ? d.innerText.slice(0, 900) : (document.body.innerText.includes('通用') ? 'no-role-dialog-but-general-present' : 'no-dialog')
})()`)
out.outfitRow = await ev("document.body.innerText.includes('换装')")
out.bgRow = await ev("document.body.innerText.includes('自定义背景')")
out.cards = await ev(`[...document.querySelectorAll('button')].filter(b => (b.innerText || '').includes('Joi · ')).map(b => (b.innerText || '').split('\\n')[0])`)
out.click = await ev(`(async () => {
  const b = [...document.querySelectorAll('button')].find(el => (el.innerText || '').includes('Joi · Library'))
  if (!b) return 'no-card'
  b.click()
  await new Promise(r => setTimeout(r, 1200))
  return 'clicked'
})()`)
await sleep(2000)
out.after = await ev('window.__joi()')
out.bodyBg = await ev("getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim()")

console.log(JSON.stringify(out, null, 2))
await send('Target.closeTarget', { targetId }); browser.close(); chrome.kill(); process.exit(0)
