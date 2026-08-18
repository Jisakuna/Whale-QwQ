/**
 * 持久化与图像处理。
 *
 * 数据全部在浏览器侧：图片以 data URI（WebP）存入 localStorage，
 * 按明暗模式分开记忆。官方设置文档（$DSH_HOME/settings.yaml）走的是
 * 宿主白名单，第三方插件的命名空间默认到不了浏览器——localStorage
 * 是本插件唯一可靠且跨重启生效的通道（与 Joi 主题的兜底同款取舍）。
 */

/** 一种外观模式（浅/深）的配置。 */
export interface BgModeState {
  /** 压缩后的背景图 data URI（WebP/PNG）。undefined = 未导入。 */
  image?: string
  /** 图片不透明度 0–100（100 = 完全显示，0 = 完全隐入主题底色）。 */
  opacity: number
  /** 是否启用自定义背景。 */
  enabled: boolean
}

/** 明暗两态的配置。 */
export interface BgState {
  light: BgModeState
  dark: BgModeState
}

const KEY = 'dsh-custom-bg'

const DEFAULT_MODE: BgModeState = { opacity: 100, enabled: false }

function defaults(): BgState {
  return { light: { ...DEFAULT_MODE }, dark: { ...DEFAULT_MODE } }
}

/** 读回持久配置；缺失或损坏时回落到默认。 */
export function loadState(): BgState {
  const s = defaults()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return s
    const parsed = JSON.parse(raw) as Partial<Record<'light' | 'dark', Partial<BgModeState>>>
    for (const mode of ['light', 'dark'] as const) {
      const m = parsed[mode]
      if (m === undefined || typeof m !== 'object') continue
      if (typeof m.image === 'string' && m.image.length > 0) s[mode].image = m.image
      if (typeof m.opacity === 'number') {
        s[mode].opacity = Math.min(100, Math.max(0, Math.round(m.opacity)))
      }
      s[mode].enabled = m.enabled === true
    }
  } catch {
    // 隐私模式 / 损坏数据：按默认处理，不是错误。
  }
  return s
}

/** 写回持久配置。写失败只影响下次启动，不回滚界面。 */
export function saveState(s: BgState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // 配额不足（图片过大）等：仅当前进程生效。
  }
}

/** 当前外观模式。与 ui-layout presenter 的判据一致（body 属性）。 */
export function isDark(): boolean {
  return document.body.hasAttribute('data-ds-dark-theme')
}

/**
 * 把用户选的图片文件压缩成可存储的 data URI。
 *
 * 两件事：① 限制最长边（浏览器 canvas 有 16384 上限，且 localStorage
 * 有 ~5MB 配额，base64 再膨胀 33%）；② 转 WebP（浏览器原生支持时）。
 * 失败（非图片、无 canvas）时抛错，由调用方兜住。
 * @param file - 用户选择的图片文件。
 * @param maxDim - 最长边像素上限。
 * @returns WebP（或回退 PNG）的 data URI。
 */
export function fileToDataUrl(file: File, maxDim = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('读取文件失败'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('文件不是可解码的图片'))
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (ctx === null) {
          reject(new Error('浏览器不支持 canvas'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        try {
          const webp = canvas.toDataURL('image/webp', 0.85)
          resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png'))
        } catch {
          resolve(canvas.toDataURL('image/png'))
        }
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
