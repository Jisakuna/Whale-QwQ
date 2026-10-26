import type { Context } from '@deepseek-ai/cordis'
import { PET_ART } from './pet-art.ts'

const MASCOT_WIDTH = 148
const WIDE_QUERY = '(min-width: 960px)'
const MASCOT_CLASS = 'dsh-mwp-mascot'
const STYLE_ID = 'dsh-maid-whale-pet-css'
/** 缩小下限：再小就认不出是谁了，不如不出现。 */
const MASCOT_MIN_SCALE = 0.55
/** 角色左缘与侧栏右边缘（那条分隔线）之间留的空隙。 */
const MASCOT_BORDER_GAP = 6
/** 角色右缘与输入卡片左缘之间至少留的空隙。 */
const MASCOT_CARD_GAP = 8

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
  /* 位置由脚本逐帧贴着侧栏边缘写；只有缩放走过渡，免得拖侧栏时角色
     慢半拍、看着像飘在边框旁边。 */
  transition: transform 160ms ease;
  will-change: transform, left;
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

  /** 侧栏（会话树）—— 角色贴着它的右边缘站。 */
  const sidebarOf = (): HTMLElement | null => body.querySelector<HTMLElement>('[role="tree"]')
  /** 输入卡片 —— 只用它来确定「右边还有多少空档」。 */
  const cardOf = (): HTMLElement | null => body.querySelector<HTMLElement>('[data-composer-card]')

  /**
   * 边框随动：角色左缘永远钉在侧栏右边缘 + 6px 上。
   *
   * 为什么锚侧栏而不是锚输入卡片：侧栏是唯一会被人手拖动的边界
   * （ui-layout 的 col-resize 手柄、收起/展开动画），钉在它上面，「随动」
   * 才有东西可随。输入卡片只用来判断右边还剩多少空档：
   *   · 空档够 → 原尺寸；
   *   · 不够 → 等比缩小（下限 0.55），仍然贴着侧栏边；
   *   · 再窄 / 没有侧栏（收起成 rail）/ 没有输入卡片（设置页）/ 模态打开 → 隐藏。
   *
   * 位置不写死任何像素：拖宽、收起、切会话、改窗口都重新量一次。
   */
  const syncPosition = (): void => {
    if (!mascot.isConnected) return
    const sidebar = sidebarOf()
    const card = cardOf()
    const cardBox = card?.getBoundingClientRect()
    // 设置/会话详情这类模态打开时，底下的空档被 backdrop 盖住，
    // 角色会从面板边缘露出半张脸。跟着一起退场。
    if (
      sidebar === null || cardBox === undefined || cardBox.width <= 0
      || body.querySelector('[role="dialog"]') !== null
    ) {
      mascot.style.display = 'none'
      return
    }
    const border = sidebar.getBoundingClientRect().right
    const gutter = cardBox.left - border
    const scale = Math.min(1, (gutter - MASCOT_BORDER_GAP - MASCOT_CARD_GAP) / MASCOT_WIDTH)
    if (scale < MASCOT_MIN_SCALE) {
      mascot.style.display = 'none'
      return
    }
    mascot.style.display = ''
    mascot.style.transformOrigin = 'left bottom'
    mascot.style.transform = scale >= 1 ? '' : `scale(${scale.toFixed(3)})`
    const left = Math.round(border + MASCOT_BORDER_GAP)
    if (mascot.style.left !== `${left}px`) mascot.style.left = `${left}px`
  }

  /**
   * 只观察「会动的两条边」，而不是整棵 DOM：
   * ResizeObserver 在拖动侧栏手柄、收起动画里逐帧回调，角色因此是真的跟着边框走；
   * MutationObserver 只负责节点被 React 换掉时重新挂观察（重渲染会换元素身份）。
   */
  let trackedSidebar: Element | null = null
  let trackedCard: Element | null = null
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { syncPosition() }) : undefined

  const retrack = (): void => {
    if (resize === undefined) return
    const sidebar = sidebarOf()
    if (sidebar !== trackedSidebar) {
      if (trackedSidebar !== null) resize.unobserve(trackedSidebar)
      trackedSidebar = sidebar
      if (sidebar !== null) resize.observe(sidebar)
    }
    const card = cardOf()
    if (card !== trackedCard) {
      if (trackedCard !== null) resize.unobserve(trackedCard)
      trackedCard = card
      if (card !== null) resize.observe(card)
    }
  }

  /** 宽屏挂载 / 窄屏隐藏。 */
  const syncMount = (): void => {
    if (media?.matches ?? true) {
      if (!mascot.isConnected) body.append(mascot)
      retrack()
      syncPosition()
    } else {
      mascot.remove()
    }
  }

  syncMount()

  const observer = new MutationObserver(() => {
    if (!mascot.isConnected) return
    retrack()
    syncPosition()
  })
  observer.observe(body, { childList: true, subtree: true })
  window.addEventListener('resize', syncPosition)
  media?.addEventListener('change', syncMount)

  ctx.effect(() => () => {
    observer.disconnect()
    resize?.disconnect()
    media?.removeEventListener('change', syncMount)
    window.removeEventListener('resize', syncPosition)
    mascot.remove()
    favicon.remove()
    style.remove()
  }, 'dsh-maid-whale-pet: mascot cleanup')
}
