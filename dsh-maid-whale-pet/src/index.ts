/** 宿主半边：纯 UI 插件，无宿主行为。 */
import type { Context } from '@deepseek-ai/cordis'

/** 空 apply：浏览器半边的常驻 pet 由 client 负责。 */
export function apply(_ctx: Context): void {
  // 无操作
}
