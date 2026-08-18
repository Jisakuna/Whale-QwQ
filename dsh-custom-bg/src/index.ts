/**
 * 宿主半边：纯 UI 插件，宿主侧不做任何事。
 * 包出现在 Loader 的 entries 里，client-modules 才能扫描到
 * package.json 的 dsh.client 声明并挂载浏览器半边。
 */
import type { Context } from '@deepseek-ai/cordis'

/** 空 apply：本插件没有宿主侧行为。 */
export function apply(_ctx: Context): void {
  // 无操作。换装偏好等全部数据都在浏览器侧（localStorage）。
}
