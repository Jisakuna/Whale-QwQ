/**
 * 背景绘制器。
 *
 * 复制 Joi 主题的纹理贴法：app 把 --dsw-alias-bg-base 画成不透明底色的
 * 大容器（新会话页、对话根）才是真正看得见的背景面，body 上的图案会被
 * 它们整片盖住。所以运行期找出「尺寸接近视口 且 背景色恰好等于 body 底色」
 * 的容器，给它们打上本插件的类；样式表用 !important 把这些容器的
 * background-image 换成用户图片（cover + fixed，壁纸效果）。
 *
 * 不透明度用叠加层实现：background-image 第一层是 color-mix 出来的
 * `var(--dsw-alias-bg-base)` 半透明色。透明度滑块=图片可见度，
 * 100=完全显示，0=完全隐入主题底色。color-mix 引用的是实时 token，
 * 主题换装/切明暗时叠加层自动跟随，无需重建。
 */
import type { BgState } from './storage.ts'

/** 打在大背景容器上的类名。 */
export const SURFACE_CLASS = 'dsh-cbg-surface'

/** 样式表 id（便于销毁）。 */
export const STYLE_ID = 'dsh-custom-bg-css'

/** 背景相关 CSS 变量。 */
export const VAR_IMAGE = '--dsh-cbg-image'

/** 注入的样式表：只认打过类的表面。 */
export function stylesheet(): string {
  return `
body div.${SURFACE_CLASS} {
  background-image: var(${VAR_IMAGE}) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
}
`
}

/**
 * 找出真正画着底色的大容器。
 *
 * 三重匹配（任一命中即算）：
 *   ① 底色等于 body 计算底色（有主题给 body 上色时的经典判据）；
 *   ② 底色等于解析后的 --dsw-alias-bg-base token 值（无主题时 body 透明，
 *      AppFrame/ConversationRoot 仍画这个 token，直接按 token 比色）；
 *   ③ 兜底：不透明的大容器（≥45% 视口），防止 token 值格式差异漏判。
 * 同时排除 fixed/absolute 定位或显式 z-index 的覆盖层——给它们贴不透明
 * 背景会把下方界面盖住。
 * @returns 命中的表面元素。
 */
export function findSurfaces(max = 8): HTMLElement[] {
  const cs = getComputedStyle(document.body)
  const bodyBg = cs.backgroundColor
  const token = cs.getPropertyValue('--dsw-alias-bg-base').trim()
  const out: HTMLElement[] = []
  for (const el of Array.from(document.querySelectorAll('body div')) as HTMLElement[]) {
    if (out.length >= max) break
    // 排除覆盖层：fixed/absolute 定位或显式 z-index 的通常是弹层/遮罩。
    const ecs = getComputedStyle(el)
    if (ecs.position === 'fixed' || ecs.position === 'absolute') continue
    if (ecs.zIndex !== 'auto') continue
    const r = el.getBoundingClientRect()
    if (r.width < window.innerWidth * 0.45 || r.height < window.innerHeight * 0.45) continue
    const bg = ecs.backgroundColor
    if (bg === bodyBg) { out.push(el); continue }
    if (token !== '' && sameRgb(bg, token)) { out.push(el); continue }
    // 兜底：不透明的大容器（面板底色通常不是不透明全幅，命中率低但能保底）
    if (!isTransparent(bg) && out.length === 0) out.push(el)
  }
  return out
}

/** "rgb(r,g,b)" / "rgba(...)" / "#rrggbb" / "#rgb" 统一比较。 */
function sameRgb(a: string, b: string): boolean {
  const pa = parseRgb(a)
  const pb = parseRgb(b)
  if (pa === undefined || pb === undefined) return false
  return pa[0] === pb[0] && pa[1] === pb[1] && pa[2] === pb[2]
}

function isTransparent(bg: string): boolean {
  return bg === 'transparent' || bg === '' || /^rgba\(0,\s*0,\s*0,\s*0\)$/.test(bg)
}

/**
 * 按当前配置刷新背景：
 * 启用且有图 → 打类 + 设 CSS 变量；否则 → 摘类、清变量。
 * @param state - 持久配置。
 * @param mode - 当前外观模式。
 */
export function applyBackground(state: BgState, mode: 'light' | 'dark'): void {
  const cfg = state[mode]
  const root = document.documentElement
  if (cfg.enabled !== true || typeof cfg.image !== 'string' || cfg.image.length === 0) {
    root.style.removeProperty(VAR_IMAGE)
    for (const el of Array.from(document.querySelectorAll('.' + SURFACE_CLASS))) {
      el.classList.remove(SURFACE_CLASS)
    }
    return
  }
  const surfaces = findSurfaces()
  // 叠加层底色：取真实命中的表面计算色（不透明、与主题同步），解析成
  // 字面量烤进渐变——不再引用 var(--dsw-alias-bg-base)，避免解析失败时
  // 整条 background-image 在计算值阶段失效（表现就是只剩纯色）。
  let baseRgb: [number, number, number] | undefined
  if (surfaces.length > 0) {
    baseRgb = parseRgb(getComputedStyle(surfaces[0]).backgroundColor)
  } else {
    baseRgb = parseRgb(getComputedStyle(document.body).backgroundColor)
  }
  // 图片不透明度 → 叠加层的底色占比：(100-opacity)%。
  const pct = Math.round(100 - cfg.opacity)
  const tint = baseRgb === undefined
    ? 'transparent'
    : `rgba(${baseRgb[0]}, ${baseRgb[1]}, ${baseRgb[2]}, ${(pct / 100).toFixed(3)})`
  root.style.setProperty(VAR_IMAGE, `linear-gradient(${tint}, ${tint}), url("${cfg.image}")`)
  for (const el of surfaces) el.classList.add(SURFACE_CLASS)
}

/**
 * 把颜色字符串解析成 [r, g, b] 三元组。
 * 支持 "rgb(r,g,b)" / "rgba(r,g,b,a)" / "#rrggbb" / "#rgb"；失败返回 undefined。
 */
function parseRgb(value: string): [number, number, number] | undefined {
  const v = value.trim().toLowerCase()
  const m = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
  if (m !== null) return [Number(m[1]), Number(m[2]), Number(m[3])]
  const hex6 = v.match(/^#([0-9a-f]{6})$/)
  if (hex6 !== null) {
    const n = parseInt(hex6[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const hex3 = v.match(/^#([0-9a-f]{3})$/)
  if (hex3 !== null) {
    const h = hex3[1]
    return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
  }
  return undefined
}
