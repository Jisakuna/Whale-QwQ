/**
 * 设置行的 slot store：插件世界到组件世界的单向镜像。
 * 组件只经由 props.useStore 读，写入口只有插件 apply 里的同步回调。
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'

/** 设置行展示态。 */
export interface BgRowState {
  /** 当前正在编辑的外观模式（浅/深）。 */
  mode: 'light' | 'dark'
  /** 该模式是否启用自定义背景。 */
  enabled: boolean
  /** 该模式的不透明度 0–100。 */
  opacity: number
  /** 该模式是否已导入图片。 */
  hasImage: boolean
  /** 是否正在处理用户刚选的图片。 */
  importing: boolean
}

/** 写入面。 */
type BgRowActions = {
  sync: (patch: Partial<BgRowState>) => void
}

/**
 * 声明设置行的状态与写入面。
 * @returns store 句柄。
 */
export function createBgStore(): EngineStoreHandle<BgRowState, BgRowActions> {
  return defineStore({
    init: (): BgRowState => ({ mode: 'light', enabled: false, opacity: 100, hasImage: false, importing: false }),
    actions: {
      sync: (d, patch: Partial<BgRowState>) => {
        Object.assign(d, patch)
      },
    },
  })
}
