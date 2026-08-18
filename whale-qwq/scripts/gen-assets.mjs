/**
 * stuff/Stuff for Use/*.png â†’ src/generated/assets.tsï¼ˆdata URIï¼‰
 *
 * CSP ä¸æ”¾å¤–é“¾ï¼Œæ’ä»¶ bundle é‡Œçš„å›¾å¿…é¡»å†…è”ã€‚åŽŸå›¾ 14.4 MBï¼Œç›´æŽ¥ base64 çº¦ 19 MBï¼Œ
 * å¤§åˆ°æ²¡æ³•ç”¨ï¼Œæ‰€ä»¥ä¸¤æ­¥åŽ‹ï¼š
 *   â‘  æŒ‰å®žé™…æ¸²æŸ“å°ºå¯¸ Ã—2ï¼ˆè§†ç½‘è†œï¼‰é™é‡‡æ · â€”â€” 20px çš„å°é²¸é±¼æ²¡ç†ç”±å¸¦ 724px åŽŸå›¾ï¼›
 *   â‘¡ è½¬ WebPï¼Œé€ä»¶åœ¨ã€Œæ— æŸã€ä¸Žã€Œq95ã€ä¹‹é—´å–è¾ƒå°è€…ã€‚
 *
 * ä¸ºä»€ä¹ˆä¸æ˜¯ PNG è°ƒè‰²æ¿é‡åŒ–ï¼ˆç¬¬ä¸€ç‰ˆåšæ³•ï¼Œå·²å¦å†³ï¼‰ï¼šè¿™åä»¶å…¨æ˜¯ die-cut å›¾ï¼Œ
 * ç™½æè¾¹é  alpha è¾¹ç¼˜è¡¨è¾¾ã€‚FASTOCTREE é‡åŒ–åœ¨ alpha ä¸Šçš„å³°å€¼åå·®å®žæµ‹ 58/255ï¼ˆ23%ï¼‰ï¼Œ
 * æè¾¹ä¼šå‘æ¯›ï¼›WebP çš„ alpha æ˜¯é›¶åå·®ã€‚åŒå°ºå¯¸ä¸‹å¯è§ PSNR 43.8dB å¯¹ 33.9dBï¼Œ
 * ä»£ä»·åªæœ‰ 28% ä½“ç§¯â€”â€”åœ¨ 8 MB é¢„ç®—ä¸‹ä¸å€¼å¾—ä¸ºè¿™ç‚¹ä½“ç§¯ç‰ºç‰²æè¾¹ã€‚
 *
 * é—¨æ§›ï¼šå¯è§ PSNRï¼ˆæŒ‰ alpha åˆæˆåŽæµ‹ï¼Œé€æ˜ŽåŒºä¸è®¡ï¼‰â‰¥ 40dB ä¸” alpha å³°å€¼åå·® = 0ã€‚
 * ä¸è¾¾æ ‡å°±åœï¼Œä¸é™é»˜æ”¾è¡Œã€‚
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/generated/assets.ts')
const BUDGET_MB = 8
const MIN_PSNR = 40

/**
 * æ¯ä»¶ç´ æçš„é…æ–¹ã€‚`w` = æ¸²æŸ“å®½ Ã— 2ï¼ˆè§†ç½‘è†œä¸Šé™ï¼‰ï¼Œæ¸²æŸ“å®½å–è‡ª
 * design/baseline-4q.json geometry ä¸Žå„ Story çš„å®šç¨¿å°ºå¯¸ã€‚
 */
const PLAN = [
  // key                æ–‡ä»¶å                                         ç›®æ ‡å®½   æ¸²æŸ“å®½ä¾æ®
  ['portraitFlowers', 'New Chat - Flowers.png', 1086], // 540 ç«‹ç»˜
  ['portraitLibrary', 'New Chat - Library.png', 1086], // 540 ç«‹ç»˜
  ['logoFlowers', 'App Logo - Flowers.png', 420], // å“ç‰ŒåŒº 46px é«˜
  ['logoLibrary', 'App Logo - Library.png', 420], //
  ['whaleLay', 'Kanban in Lay - Deepseek Whale Musume.png', 424], // 184 è¶´å§¿
  ['whaleStand', 'Kanban - Deepseek Whale Musume.png', 384], // 160 å¼•å¯¼ç«™å§¿
  // å¯¹é½ç‰ˆï¼šç”Ÿæˆæ¨¡åž‹ç»™ä¸å‡ºåƒç´ çº§ä¸€è‡´çš„æž„å›¾ï¼Œå››æ ¼åº•ç¼˜ä¸Žä¸­å¿ƒç”±
  // scripts/align-sprite.mjs çº¯å¹³ç§»å½’ä¸€ï¼ˆåº•ç¼˜æžå·® 0.0000ã€ä¸­å¿ƒåç§» 0.0008ï¼‰ã€‚
  ['joiFlowers', 'In a Chat - tulip 4.png', 512], // 112 ç²¾çµ 2Ã—2
  ['joiLibrary', 'In a Chat - Library 2-aligned.png', 512], //
  ['zhouxin', '-01.png', 512], //
  // ç¬¬å››é¡¹ = æºå›¾çƒ¤æ­»ç™½è¾¹çš„å®½åº¦ï¼ˆpxï¼‰ã€‚ç»™äº†å°±èµ°ã€Œå‰¥è¾¹ â†’ ç¼©æ”¾ â†’ æŒ‰è¾“å‡ºå°ºå¯¸é‡ç”» 1px è¾¹ã€ï¼Œ
  // è§ä¸‹æ–¹ PY çš„ strip_rim / draw_rimã€‚åªæœ‰ç¼©æ”¾æ¯”æžå¤§çš„å°å›¾æ‰éœ€è¦ï¼Œç†ç”±ï¼š
  //   æºå›¾ç™½è¾¹ 11pxï¼ˆå  724 çš„ 1.5%ï¼‰ï¼Œç¼©åˆ° 20 CSS px åŽä»…å‰© 0.61 è®¾å¤‡åƒç´ â€”â€”
  //   äºšåƒç´ çš„è¾¹æ²¿æ¯æ¡è¾¹è½åœ¨åƒç´ ç½‘æ ¼çš„ä½ç½®ä¸åŒï¼ŒæŠ—é”¯é½¿æŠŠå®ƒæŠ¹æˆæ·±æµ…ä¸ä¸€çš„ç°è¾¹ï¼Œ
  //   äºŽæ˜¯ã€Œç™½è¾¹ä¸åŒ€ã€å¹¶ä¸”æ•´ä½“å‘ç³Šã€‚è¿™ä¸æ˜¯åˆ†è¾¨çŽ‡ä¸å¤Ÿï¼Œæ˜¯çƒ¤æ­»çš„è¾¹æ‰›ä¸ä½è¿™ä¸ªæ¯”ä¾‹ã€‚
  // ç›®æ ‡å®½ 120 = 3 æ ¼ Ã— 40ï¼Œæ­£å¥½æ˜¯ 20 CSS px åœ¨ DPR2 ä¸‹çš„è®¾å¤‡åƒç´ ï¼Œæµè§ˆå™¨ä¸å†äºŒæ¬¡ç¼©æ”¾
  //ï¼ˆæ­¤å‰æ˜¯ 360ï¼Œæµè§ˆå™¨è¿˜è¦åšä¸€æ¬¡ 3:1 å»‰ä»·ç¼©å°ï¼Œå®žæµ‹æ˜Žæ˜¾æ›´ç³Šï¼‰ã€‚
  ['subWhales', 'Sub Agent Whales.png', 120, 11], // 20 ç²¾çµ 1Ã—3
]

const PY = `
import sys, json, io, base64, math
from PIL import Image, ImageChops, ImageFilter

plan = json.loads(sys.argv[1]); src_dir = sys.argv[2]

def strip_rim(im, r):
    """å‰¥æŽ‰çƒ¤æ­»çš„ç™½è¾¹ï¼šalpha å‘å†…ä¾µèš€ r æ¬¡ï¼Œå‰©ä¸‹çš„å°±æ˜¯å›¾å½¢æœ¬ä½“ã€‚
    ç²¾çµè¡¨çš„æ ¼ä¸Žæ ¼ä¹‹é—´æœ‰é€æ˜Žé—´éš™ï¼Œæ‰€ä»¥æ•´è¡¨ä¸€èµ·åšä¸ä¼šä¸²å‘³ï¼ˆgen å‰å·²éªŒï¼‰ã€‚"""
    a = im.split()[3]
    for _ in range(r): a = a.filter(ImageFilter.MinFilter(3))
    o = im.copy(); o.putalpha(a); return o

def draw_rim(im, r):
    """æŒ‰å½“å‰å°ºå¯¸é‡ç”» r åƒç´ ç™½è¾¹ï¼šè†¨èƒ€ alpha å¾—å¤–çŽ¯ï¼Œå¡«ç™½ï¼Œå†æŠŠå›¾å½¢å å›žåŽ»ã€‚
    è¾¹å®½æ˜¯æ•´åƒç´ ï¼Œå› æ­¤æ¯æ¡è¾¹ä¸€æ ·åŽšâ€”â€”è¿™æ­£æ˜¯çƒ¤æ­»çš„è¾¹åšä¸åˆ°çš„ã€‚"""
    a = im.split()[3]
    for _ in range(r): a = a.filter(ImageFilter.MaxFilter(3))
    out = Image.new("RGBA", im.size, (255, 255, 255, 255)); out.putalpha(a)
    out.alpha_composite(im); return out

def flatten(im, bg=(128,128,128)):
    """æŒ‰ alpha åˆæˆåˆ°ä¸­æ€§åº•ï¼šåªæœ‰å¯è§éƒ¨åˆ†å‚ä¸Žä¿çœŸåº¦æ¯”è¾ƒã€‚"""
    b = Image.new("RGB", im.size, bg); b.paste(im, (0,0), im); return b

def score(a, q):
    d = ImageChops.difference(flatten(a), flatten(q)); h = d.histogram()
    rm = []
    for ch in range(3):
        band = h[ch*256:(ch+1)*256]; n = max(1, sum(band))
        rm.append(math.sqrt(sum(i*i*c for i, c in enumerate(band)) / n))
    peak = max(rm)
    psnr = 999.0 if peak < 1e-9 else 20*math.log10(255/peak)
    da = ImageChops.difference(a.getchannel("A"), q.getchannel("A"))
    amax = max(i for i, c in enumerate(da.histogram()) if c)
    return psnr, amax

out, report = {}, []
for entry in plan:
    key, name, width = entry[0], entry[1], entry[2]
    rim = entry[3] if len(entry) > 3 else 0
    a = Image.open(src_dir + "/" + name).convert("RGBA")
    w0, h0 = a.size
    if rim:
        a = strip_rim(a, rim)
    if w0 > width:
        a = a.resize((width, round(h0 * width / w0)), Image.LANCZOS)
    if rim:
        a = draw_rim(a, 1)
    best = None
    for tag, kw in (("lossless", dict(lossless=True, method=6)),
                    ("q95", dict(quality=95, method=6))):
        buf = io.BytesIO(); a.save(buf, format="WEBP", **kw); data = buf.getvalue()
        q = Image.open(io.BytesIO(data)).convert("RGBA")
        psnr, amax = score(a, q)
        if psnr < ${MIN_PSNR} or amax != 0:
            continue
        if best is None or len(data) < len(best[1]):
            best = (tag, data, psnr, amax)
    if best is None:
        raise SystemExit("FIDELITY_FLOOR:" + key)
    tag, data, psnr, amax = best
    out[key] = "data:image/webp;base64," + base64.b64encode(data).decode()
    report.append([key, name, w0, h0, a.size[0], a.size[1], len(data), tag, round(psnr, 1), amax])

print(json.dumps({"assets": out, "report": report}))
`

const raw = execFileSync('python3', ['-c', PY, JSON.stringify(PLAN), resolve(ROOT, 'stuff/Stuff for Use')], {
  maxBuffer: 256 * 1024 * 1024,
  encoding: 'utf8',
})
const { assets, report } = JSON.parse(raw)

let originalTotal = 0
let inlineTotal = 0
console.log('ç´ æ            åŽŸå§‹å°ºå¯¸       ç›®æ ‡å°ºå¯¸     åŽŸå§‹KB  åŽ‹åŽKB   çœ   ç¼–ç       å¯è§PSNR Î±å·®')
for (const [key, name, w0, h0, w1, h1, bytes, tag, psnr, amax] of report) {
  const before = statSync(resolve(ROOT, 'stuff/Stuff for Use', name)).size
  originalTotal += before
  inlineTotal += assets[key].length
  console.log(
    `${key.padEnd(16)}${`${w0}Ã—${h0}`.padEnd(15)}${`${w1}Ã—${h1}`.padEnd(13)}`
    + `${String(Math.round(before / 1024)).padStart(6)}${String(Math.round(bytes / 1024)).padStart(8)}`
    + `${String(Math.round((1 - bytes / before) * 100)).padStart(5)}%  ${tag.padEnd(9)}`
    + `${String(psnr).padStart(7)}dB${String(amax).padStart(4)}`,
  )
}

const mb = inlineTotal / 1048576
console.log(
  `\nåŽŸå›¾åˆè®¡ ${(originalTotal / 1048576).toFixed(1)} MB`
  + ` â†’ å†…è” data URI åˆè®¡ ${mb.toFixed(2)} MBï¼ˆé¢„ç®— ${BUDGET_MB} MBï¼Œé—¨æ§› PSNRâ‰¥${MIN_PSNR}dB ä¸” Î± é›¶åå·®ï¼‰`,
)
if (mb > BUDGET_MB) throw new Error(`å†…è”ä½“ç§¯ ${mb.toFixed(2)} MB è¶…é¢„ç®— ${BUDGET_MB} MB â€”â€” åœä¸‹æ¥è®®æ¡£ä½ï¼Œä¸è¦é™é»˜æ”¾è¡Œ`)

mkdirSync(dirname(OUT), { recursive: true })
const entries = Object.entries(assets).map(([k, v]) => `  ${k}: ${JSON.stringify(v)},`).join('\n')
writeFileSync(OUT, `/* ç”± scripts/gen-assets.mjs ä»Ž stuff/Stuff for Use/ ç”Ÿæˆï¼Œè¯·å‹¿æ‰‹æ”¹ã€‚ */

/** å†…è”ç´ æï¼šWebP data URIï¼Œæ— å¤–é“¾ï¼ˆCSP ä¸æ”¾è¡Œï¼‰ã€‚ */
export const ASSETS = {
${entries}
} as const

/** ç´ æé”®ã€‚ */
export type AssetKey = keyof typeof ASSETS
`, 'utf8')
console.log(`assets â†’ ${OUT}`)


