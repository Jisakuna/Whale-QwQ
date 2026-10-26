import type { Context } from '@deepseek-ai/cordis'
import { PET_ART } from './pet-art.ts'

const MASCOT_WIDTH = 148
const WIDE_QUERY = '(min-width: 960px)'
const MASCOT_CLASS = 'dsh-mwp-mascot'
const STYLE_ID = 'dsh-maid-whale-pet-css'
/** 缩小下限：再小就认不出是谁了，不如不出现。 */
const MASCOT_MIN_SCALE = 0.55

function stylesheet(): string {
  return `
body .${MASCOT_CLASS} {
  position: fixed;
  bottom: max(20px, env(safe-area-inset-bottom));
  left: max(18px, env(safe-area-inset-left));
  z-index: 8;
  width: 148px;
  height: 160px;
  opacity: 0.96;
  pointer-events: none;
}
body .${MASCOT_CLASS} img {
  display: block;
  width: 148px;
  height: 160px;
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 8px 10px rgba(49, 93, 120, 0.16));
}
@media (max-width: 959px), print {
  body .${MASCOT_CLASS} { display: none; }
}
`
}

export function apply(ctx: Context): void {
  const body = document.body

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = stylesheet()
  document.head.append(style)

  const mascot = document.createElement('div')
  mascot.className = MASCOT_CLASS
  const image = document.createElement('img')
  image.src = PET_ART
  image.alt = ''
  image.setAttribute('aria-hidden', 'true')
  mascot.append(image)

  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.type = 'image/webp'
  favicon.href = PET_ART
  document.head.append(favicon)

  const media = typeof window.matchMedia === 'function' ? window.matchMedia(WIDE_QUERY) : undefined

  /**
   * 把角色放进「侧栏与输入卡片之间的空档」，站在地板上。
   *
   * 为什么不再贴着侧栏右缘：0.2.x 的侧栏底部是「今日消费卡片 + 账号行 + 两个
   * 图标」，角色高 160px，无论贴底还是上移都会压住其中一段（原来压的是账号行）。
   * 侧栏里没有一块 148×160 的空地，所以改成向右站到对话区——输入卡片是居中的，
   * 它左边那条空档在 1504 宽下约 210px，足够放下，而且不覆盖任何控件。
   *
   * 空档不够宽时（窄窗口、输入框变宽、或页面没有输入卡片）直接隐藏：
   * 「不出现」永远好过「压住可点的东西」。
   */
  const syncPosition = (): void => {
    if (!mascot.isConnected) return
    const sidebar = body.querySelector<HTMLElement>('[role="tree"]')
    const card = body.querySelector<HTMLElement>('[data-composer-card]')
    const cardBox = card?.getBoundingClientRect()
    // 设置/会话详情这类模态打开时，底下的空档被 backdrop 盖住，
    // 角色会从面板边缘露出半张脸。跟着一起退场。
    if (body.querySelector('[role="dialog"]') !== null) {
      mascot.style.display = 'none'
      return
    }
    // 没有侧栏（窄窗收起成 rail）或没有输入卡片（设置页等）时一律不出现：
    // 这两种情况下都没有「侧栏与输入框之间」那块空地可站。
    if (sidebar === null || cardBox === undefined || cardBox.width <= 0) {
      mascot.style.display = 'none'
      return
    }
    const gutterLeft = sidebar.getBoundingClientRect().right
    const gutter = cardBox.left - gutterLeft
    // 空档不够 148：先等比缩小（下限 0.55，再小就认不出来了），
    // 缩到装不下就隐藏——「不出现」好过「压住可点的东西」。
    const scale = Math.min(1, (gutter - 16) / MASCOT_WIDTH)
    if (scale < MASCOT_MIN_SCALE) {
      mascot.style.display = 'none'
      return
    }
    mascot.style.display = ''
    mascot.style.transformOrigin = 'left bottom'
    mascot.style.transform = scale >= 1 ? '' : `scale(${scale.toFixed(3)})`
    // 原尺寸时在空档里居中；缩小时贴住侧栏右缘，把剩下的宽度留给输入框。
    const left = Math.round(scale >= 1
      ? Math.max(gutterLeft + 8, gutterLeft + (gutter - MASCOT_WIDTH) / 2)
      : gutterLeft + 8)
    if (mascot.style.left !== `${left}px`) mascot.style.left = `${left}px`
  }

  /** 宽屏挂载 / 窄屏隐藏。 */
  const syncMount = (): void => {
    if (media?.matches ?? true) {
      if (!mascot.isConnected) body.append(mascot)
      syncPosition()
    } else {
      mascot.remove()
    }
  }

  syncMount()

  // 侧栏/输入卡片变化（切会话、切页、窗口尺寸）时重新找位置。
  const observer = new MutationObserver(syncPosition)
  observer.observe(body, { childList: true, subtree: true })
  window.addEventListener('resize', syncPosition)
  media?.addEventListener('change', syncMount)

  ctx.effect(() => () => {
    observer.disconnect()
    media?.removeEventListener('change', syncMount)
    window.removeEventListener('resize', syncPosition)
    mascot.remove()
    favicon.remove()
    style.remove()
  }, 'dsh-maid-whale-pet: mascot cleanup')
}
