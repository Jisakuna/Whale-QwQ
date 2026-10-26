/**
 * 用 Chrome DevTools Protocol 实测 Web GUI 里三个插件的运行时表现。
 * 不依赖 playwright/puppeteer：Node 24 自带全局 WebSocket。
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL_TO_OPEN = process.argv[2]
const PORT = 9223
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const profileDir = mkdtempSync(join(tmpdir(), 'dsh-cdp-'))

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profileDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--window-size=1520,960',
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function version() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (r.ok) return await r.json()
    } catch {}
    await sleep(300)
  }
  throw new Error('chrome devtools not reachable')
}

const info = await version()
const browser = new WebSocket(info.webSocketDebuggerUrl)
await new Promise((res, rej) => { browser.onopen = res; browser.onerror = rej })

let nextId = 1
const pending = new Map()
const events = []
browser.onmessage = (msg) => {
  const data = JSON.parse(msg.data)
  if (data.id !== undefined) {
    const p = pending.get(data.id)
    pending.delete(data.id)
    if (data.error) p.reject(new Error(`${data.error.message} ${JSON.stringify(data.error.data ?? '')}`))
    else p.resolve(data.result)
  } else {
    events.push(data)
  }
}
function send(method, params = {}, sessionId) {
  const id = nextId++
  const payload = { id, method, params }
  if (sessionId) payload.sessionId = sessionId
  browser.send(JSON.stringify(payload))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const S = (m, p) => send(m, p, sessionId)

await S('Runtime.enable')
await S('Log.enable')
await S('Page.enable')

const consoleErrors = []
const exceptions = []
browser.addEventListener('message', (msg) => {
  const d = JSON.parse(msg.data)
  if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') consoleErrors.push(d.params.entry.text)
  if (d.method === 'Runtime.exceptionThrown') exceptions.push(d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text)
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
    consoleErrors.push(d.params.args.map(a => a.value ?? a.description ?? '').join(' '))
  }
})

await S('Page.navigate', { url: URL_TO_OPEN })
await sleep(12000)

async function evalJs(expression) {
  const r = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) return { error: r.exceptionDetails.exception?.description ?? r.exceptionDetails.text }
  return r.result.value
}

const probes = {}
probes.title = await evalJs('document.title')
probes.bootReady = await evalJs('typeof window.__DSH_BOOT__')
probes.joi = await evalJs('typeof window.__joi')
probes.cbg = await evalJs('typeof window.__cbg')
probes.joiMetrics = await evalJs('window.__joi ? window.__joi() : null')
probes.bodyBg = await evalJs("getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim()")
probes.mascot = await evalJs("document.querySelectorAll('.dsh-mwp-mascot').length")
probes.brandSvg = await evalJs("document.querySelector('[class*=_brand] svg') ? 'yes' : 'no'")
probes.errors = consoleErrors
probes.exceptions = exceptions

// 打开设置：先看侧栏有哪些按钮
probes.sidebarButtons = await evalJs(`[...document.querySelectorAll('button')].slice(0, 60).map(b => (b.getAttribute('aria-label') || b.textContent || '').trim()).filter(Boolean).slice(0, 40)`)

const opened = await evalJs(`(() => {
  const b = [...document.querySelectorAll('button')].find(el => /设置|Settings/i.test(el.getAttribute('aria-label') || el.textContent || ''))
  if (!b) return 'no-button'
  b.click()
  return 'clicked'
})()`)
probes.settingsOpen = opened
await sleep(2500)
probes.settingsText = await evalJs(`(() => {
  const el = document.querySelector('[role=dialog]') || document.body
  return (el.innerText || '').slice(0, 600)
})()`)
probes.hasOutfitRow = await evalJs("document.body.innerText.includes('换装')")
probes.hasBgRow = await evalJs("document.body.innerText.includes('自定义背景')")

console.log(JSON.stringify(probes, null, 2))

await send('Target.closeTarget', { targetId })
browser.close()
chrome.kill()
process.exit(0)
