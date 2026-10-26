/**
 * 宿主半边。
 *
 * 这是一个纯 UI 插件，宿主侧只做两件真事：
 *   ① 用导出的 `Config` 声明衣装偏好的 schema —— 0.2.x 起，dsh 的设置不再由
 *      插件自己 `ctx.settings.register(namespace, schema)` 注册，而是**由
 *      Loader 行的 Config schema 驱动**：宿主读这里导出的 `Config`，把它投影
 *      成设置表单，命名空间就是 profile 里那一行的 id（见 cordis.patch.yml）。
 *   ② 关掉这个实例的自动设置页（`settings.configure({ auto: false })`）：
 *      外观偏好已经有本插件自己的「换装」行（见 client/SuitRow.tsx），
 *      再生成一个同字段的自动表单只会让用户看到两个入口。
 *
 * apply 不能省：包必须出现在 Loader 的 entries 里，client-modules 才会扫到
 * package.json 的 dsh.client 声明，进而把浏览器半边挂进 __DSH_BOOT__ 并在
 * /plugins/<id>/client.js 供应。
 */
import type { Context } from '@deepseek-ai/cordis'
// 仅类型：拉进 ctx.settings 的 Context 合并（0.2.x 的 SettingsForms 服务）。
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import { DEFAULT_SKIN, SETTINGS_NAMESPACE, SKINS, SUIT_FIELD } from './contract.ts'

export {
  DEFAULT_SKIN, DEFAULT_SUIT, SETTINGS_NAMESPACE, SKINS, SUITS, SUIT_FIELD,
  isSkin, isSuit, type JoiSettings, type Skin, type Suit,
} from './contract.ts'

/**
 * 衣装偏好的持久 schema。
 *
 * `.volatile()` 不是装饰：0.2.x 的 SettingsForms 只把 `volatile` 字段投影成
 * 可编辑表单（`volatileForm`），不加这个标记，SettingsForms.describe 里根本
 * 不会有这个条目，浏览器半边的 `ctx.configForms.get(...)` 会永远停在
 * `unavailable`，界面上的换装选择就落不了盘。
 *
 * 字段名与行 id 合起来构成设置文档里的定位：profile 的
 * `cordis.patch.yml` 里是 `- id: whale-qwq`，因此命名空间就是 `whale-qwq`。
 */
export const Config = z.object({
  [SUIT_FIELD]: z.union([...SKINS]).default(DEFAULT_SKIN).volatile(),
})

/**
 * 宿主插件体：声明设置页策略。
 *
 * 设置是可选能力——非 Web 场景或远端浏览器可能没有组合 settings 服务。
 * 用 ctx.inject 等它出现，缺它时插件照常加载，浏览器半边退回进程内偏好
 * （见 client/suit.ts）。
 * @param ctx - 宿主上下文。
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    // owner 用外层 ctx.fiber：策略绑定的是本插件实例（它的 Loader 行），
    // 而不是 inject 出来的子 fiber，否则 describe 里挂不到行上。
    settingsCtx.effect(
      () => settingsCtx.settings.configure({ auto: false }, ctx.fiber),
      'whale-qwq: 不生成自动设置页',
    )
  })
}
