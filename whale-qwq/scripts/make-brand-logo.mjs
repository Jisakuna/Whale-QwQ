/**
 * 把一张 logo 图裁掉透明边、按 2× 目标高度缩好，导出成 WebP data URI，
 * 写进 whale-qwq/src/client/brand-logo.ts。
 *
 * 为什么要裁：logo.png 是 1254×1254 的画布，字本身只占中间一条 (~1190×300)。
 * 直接当 background-size: auto 46px 用，46px 是整个画布的高度，字只剩 11px。
 * 裁到内容包围盒之后，「auto 46px」才是字高。
 *
 * 为什么走 Chrome：CSP 不让外链，插件的图必须内联；仓库里又没有 sharp/canvas，
 * 而 Chrome 的 2D canvas 既能取包围盒又能导 WebP。file:// 页面 + 同文档的 <img>
 * 需要 --allow-file-access-from-files 才不会被 canvas 污染。
 *
 * 用法：node scripts/make-brand-logo.mjs <logo.png 的绝对路径> [目标高度px]
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const source = resolve(process.argv[2] ?? join(ROOT, 'stuff/Stuff for Use/DeepSeek Logo - Candy.png'))
const displayHeight = Number(process.argv[3] ?? 40)
const OUT = join(ROOT, 'src/client/brand-logo.ts')

const PORT = 9500 + Math.floor(Math.random() * 300)
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'dsh-logo-'))}`,
  '--allow-file-access-from-files',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu',
  'about:blank',
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
if (!ws) throw new Error('chrome devtools not reachable')

const browser = new WebSocket(ws)
await new Promise((res, rej) => { browser.onopen = res; browser.onerror = rej })
let nextId = 1
const pending = new Map()
browser.onmessage = (msg) => {
  const d = JSON.parse(msg.data)
  if (d.id !== undefined) {
    const p = pending.get(d.id)
    pending.delete(d.id)
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

const { targetId } = await send('Target.createTarget', { url: pathToFileURL(source).href })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const S = (m, p) => send(m, p, sessionId)
await S('Runtime.enable')
await sleep(1500)

const expression = `(() => {
  const img = document.querySelector('img')
  if (!img || !img.complete || img.naturalWidth === 0) return { error: 'image not loaded' }
  const w = img.naturalWidth, h = img.naturalHeight
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })
  g.drawImage(img, 0, 0)
  const data = g.getImageData(0, 0, w, h).data
  let minX = w, minY = h, maxX = -1, maxY = -1
  let opaque = false
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const a = data[i + 3]
      if (a < 250) opaque = true
      // 判定「有内容」：不透明且不是纯白（很多导出图把透明区烤成了白底）
      const r = data[i], gg = data[i + 1], b = data[i + 2]
      const inked = a > 8 && (a < 250 || r < 245 || gg < 245 || b < 245)
      if (!inked) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  if (maxX < 0) return { error: 'no ink found' }
  const boxW = maxX - minX + 1
  const boxH = maxY - minY + 1
  const scale = ${displayHeight} * 2 / boxH
  const out = document.createElement('canvas')
  out.width = Math.round(boxW * scale)
  out.height = Math.round(boxH * scale)
  const og = out.getContext('2d')
  og.imageSmoothingQuality = 'high'
  og.drawImage(img, minX, minY, boxW, boxH, 0, 0, out.width, out.height)
  return {
    natural: [w, h],
    box: [minX, minY, boxW, boxH],
    hasAlpha: opaque,
    out: [out.width, out.height],
    dataUrl: out.toDataURL('image/webp', 0.92),
  }
})()`

const result = await S('Runtime.evaluate', { expression, returnByValue: true })
const value = result.result.value
if (!value || value.error) throw new Error(`logo processing failed: ${JSON.stringify(value)}`)
if (!value.dataUrl.startsWith('data:image/webp')) throw new Error(`unexpected data URL: ${value.dataUrl.slice(0, 40)}`)

const bytes = Math.round(value.dataUrl.length * 0.75)
// 仓库内的图记相对路径，换台机器重新生成时注释也仍然成立。
const rel = relative(ROOT, source).split('\\').join('/')
const sourceLabel = rel.startsWith('..') ? source : rel
const file = `/* 由 scripts/make-brand-logo.mjs 生成，请勿手改。
 *
 * 源图：${sourceLabel}
 * 原图 ${value.natural[0]}×${value.natural[1]}，内容包围盒 ${value.box[2]}×${value.box[3]} @ (${value.box[0]}, ${value.box[1]})
 * 导出 ${value.out[0]}×${value.out[1]}（WebP q92，约 ${(bytes / 1024).toFixed(1)} KB）
 * 用途：侧栏左上角字标的 --joi-brand-logo（见 client/tokens.ts）。
 */

/** 侧栏字标图（data URI）。 */
export const BRAND_LOGO = '${value.dataUrl}'
`

writeFileSync(OUT, file, 'utf8')
console.log(JSON.stringify({
  source,
  natural: value.natural,
  contentBox: value.box,
  output: value.out,
  kb: Number((bytes / 1024).toFixed(1)),
  hasTransparency: value.hasAlpha,
  file: OUT,
}, null, 2))

await send('Target.closeTarget', { targetId })
browser.close()
chrome.kill()
process.exit(0)
