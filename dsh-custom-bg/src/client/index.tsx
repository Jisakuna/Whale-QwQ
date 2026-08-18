/**
 * 浏览器半边：自定义对话背景。
 *
 * 三件事，边界分明：
 *   ① 绘制 —— 给「真正画着底色的大容器」打类并注入 background-image
 *      （cover + fixed 壁纸效果），不透明度走 color-mix 叠加层，引用实时
 *      token，主题换装/切明暗自动跟随。
 *   ② 设置 —— 在 General 区附加一行「自定义背景」：导入图片 / 启用 /
 *      清除 / 不透明度滑杆。图片按明暗模式分别记忆（localStorage）。
 *   ③ 监听 —— MutationObserver 跟随 app 重渲染与明暗切换，随时重扫表面。
 *
 * 全程 fail-soft：选择器失配、素材缺失、canvas 不可用一律静默降级，
 * 不把原生界面弄坏。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import { createBgStore } from './store.ts'
import { BgRow, type BgRowInjected } from './row.tsx'
import { applyBackground, findSurfaces, STYLE_ID, stylesheet, SURFACE_CLASS, VAR_IMAGE } from './background.ts'
import { fileToDataUrl, isDark, loadState, saveState, type BgState } from './storage.ts'

/** 需要的服务：slots 提供设置行的注册位。 */
export const inject = ['slots']

declare global {
  interface Window {
    /** 诊断读数入口：window.__cbg()。 */
    __cbg?: () => unknown
  }
}

/**
 * 浏览器插件体。
 * @param ctx - 客户端 cordis 上下文。
 */
export function apply(ctx: ClientContext): void {
  let state: BgState = loadState()
  const store = createBgStore()
  let bound: BoundActions<ReturnType<typeof createBgStore>> | undefined
  let disposed = false
  /** 最近一次绘制错误（诊断用）。 */
  let lastError: string | undefined

  /** 当前外观模式。 */
  const mode = (): 'light' | 'dark' => (isDark() ? 'dark' : 'light')

  /** 把状态写进 store（驱动设置行 UI）。 */
  const syncStore = (importing = false): void => {
    const m = mode()
    bound?.sync({
      mode: m,
      enabled: state[m].enabled,
      opacity: state[m].opacity,
      hasImage: typeof state[m].image === 'string' && state[m].image!.length > 0,
      importing,
    })
  }

  /** 重绘背景 + 同步 UI。 */
  const refresh = (): void => {
    if (disposed) return
    try {
      applyBackground(state, mode())
      lastError = undefined
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      console.warn('[dsh-custom-bg] 绘制失败：', error)
    }
    syncStore()
  }

  // ① 注入样式表（放在 head 末尾，晚于主题的样式 → 同等 !important 时胜出）。
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = stylesheet()
  document.head.append(style)

  // ③ 跟随 app 重渲染与明暗切换。React 每次重渲染都可能换容器节点，
  // presenter 切明暗会动 body 属性——两者都要重扫。rAF 合并，避免高频抖动。
  let raf = 0
  const schedule = (): void => {
    if (disposed || raf !== 0) return
    raf = requestAnimationFrame(() => {
      raf = 0
      refresh()
    })
  }
  const observer = new MutationObserver(schedule)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'data-ds-dark-theme'],
  })
  window.addEventListener('resize', schedule)

  // 诊断钩子：浏览器控制台跑 window.__cbg() 看当前状态。
  const cbg = (): unknown => {
    const m = mode()
    const els = Array.from(document.querySelectorAll('.' + SURFACE_CLASS)) as HTMLElement[]
    return {
      mode: m,
      enabled: state[m].enabled,
      opacity: state[m].opacity,
      hasImage: typeof state[m].image === 'string',
      imageLen: state[m].image?.length ?? 0,
      surfaces: els.length,
      surfaceList: els.map((el) => {
        const cs = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          cls: (el.className as string).toString().slice(0, 60),
          pos: cs.position,
          z: cs.zIndex,
          size: `${Math.round(r.width)}x${Math.round(r.height)}`,
          interactive: el.querySelector('button,input,textarea,select,a') !== null,
          bg: cs.backgroundColor,
        }
      }),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      varImage: getComputedStyle(document.documentElement).getPropertyValue(VAR_IMAGE).slice(0, 120),
      lastError,
    }
  }
  window.__cbg = cbg
  console.info('[dsh-custom-bg] 插件激活；初始表面数：', findSurfaces().length)

  // ② 设置行。
  const injected = (actions: BoundActions<ReturnType<typeof createBgStore>>): BgRowInjected => {
    bound = actions
    syncStore()
    return {
      onToggle: (on: boolean): void => {
        state[mode()].enabled = on
        saveState(state)
        refresh()
      },
      onOpacity: (value: number): void => {
        state[mode()].opacity = Math.min(100, Math.max(0, Math.round(value)))
        saveState(state)
        refresh()
      },
      onFile: (file: File): void => {
        syncStore(true)
        fileToDataUrl(file)
          .then((url: string) => {
            const m = mode()
            state[m].image = url
            state[m].enabled = true
            saveState(state)
            refresh()
          })
          .catch((error: unknown) => {
            console.warn('[dsh-custom-bg] 图片处理失败：', error)
            syncStore()
          })
      },
      onClear: (): void => {
        const m = mode()
        delete state[m].image
        state[m].enabled = false
        saveState(state)
        refresh()
      },
    }
  }

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'custom-background',
    order: 20,
    store,
    inject: injected,
  }, BgRow))

  // 首帧绘制。
  refresh()

  // 清理。
  ctx.effect(() => () => {
    disposed = true
    observer.disconnect()
    window.removeEventListener('resize', schedule)
    if (raf !== 0) cancelAnimationFrame(raf)
    style.remove()
    document.documentElement.style.removeProperty('--dsh-cbg-image')
    for (const el of Array.from(document.querySelectorAll('.' + SURFACE_CLASS))) {
      el.classList.remove(SURFACE_CLASS)
    }
    delete window.__cbg
  }, 'dsh-custom-bg: 清理')
}
