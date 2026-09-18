import type { Context } from '@deepseek-ai/cordis'
import { PET_ART } from './pet-art.ts'

const MASCOT_WIDTH = 148
const MASCOT_EDGE_GAP = 12
const WIDE_QUERY = '(min-width: 960px)'
const MASCOT_CLASS = 'dsh-mwp-mascot'
const STYLE_ID = 'dsh-maid-whale-pet-css'

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

  /** 让 mascot 贴在工作区右缘（与原项目一致：右缘靠 12px）。 */
  const syncPosition = (): void => {
    const workspace = body.querySelector<HTMLElement>('[role="tree"]')
    if (!workspace || !mascot.isConnected) return
    const bounds = workspace.getBoundingClientRect()
    if (bounds.width <= 0) return
    const left = Math.round(Math.max(
      bounds.left + MASCOT_EDGE_GAP,
      bounds.right - MASCOT_WIDTH - MASCOT_EDGE_GAP,
    ))
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

  // 工作区树变化 / 窗口尺寸变化时保持贴边。
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
