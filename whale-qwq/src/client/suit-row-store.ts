/**
 * 换装行的 slot store：插件世界的状态到组件世界的单向镜像。
 *
 * 组件只经由 props.useStore 读，写入口只有插件 apply 里的那一处同步回调。
 * 这条单向性是 slot store 的约定，也是这里不直接把 SuitRuntime 传进组件的原因。
 */
// 0.2.x 把快照 store 引擎从 dsh-client-runtime 升格成了平台模块
// @deepseek-ai/dsh-client-store（浏览器模块表里直接有它）。
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import { DEFAULT_SKIN, type Skin } from '../contract.ts'

/** app 的内置明暗偏好。 */
export type Preference = 'light' | 'dark' | 'system'

/** 换装行的状态。 */
export interface SuitRowState {
  /** 当前皮肤（含 native）。 */
  suit: Skin
  /** 当前明暗偏好（读的是持久偏好，不是解析后的活动主题）。 */
  preference: Preference
}

/** 写入面。 */
type SuitRowActions = {
  sync: (draft: SuitRowState, suit: Skin, preference: Preference) => void
}

/**
 * 声明换装行的状态与写入面。
 * @returns store 句柄。
 */
export function createSuitRowStore(): EngineStoreHandle<SuitRowState, SuitRowActions> {
  return defineStore({
    init: (): SuitRowState => ({ suit: DEFAULT_SKIN, preference: 'system' }),
    actions: {
      sync: (d, suit: Skin, preference: Preference) => {
        d.suit = suit
        d.preference = preference
      },
    },
  })
}
