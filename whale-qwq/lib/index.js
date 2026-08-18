import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
//#region src/contract.ts
/**
* 两个半边共享的常量与类型。零依赖是刻意的：客户端 bundle 会把这个文件内联，
* 而宿主半边要用的 schemastery / dsh-settings 都是 Node 侧依赖，
* 一旦从这里泄进浏览器产物，模块表答不上那个 require，启动即抛。
*/
/** 两套衣装。互斥，不得混用（设计法条）。 */
const SUITS = ["flowers", "library"];
/**
* 可选的三种皮肤：两套衣装，外加「原生」。
*
* 原生是一等选项，不是降级：装了插件不等于必须换肤。选它时 token 覆盖层
* 整层卸掉、装饰层静默，界面回到与未装插件逐项一致的样子。
*/
const SKINS = [...SUITS, "native"];
/** 首装默认皮肤。 */
const DEFAULT_SKIN = "flowers";
/** 首装默认衣装（原生态下装饰层仍以此为素材基准）。 */
const DEFAULT_SUIT = "flowers";
/**
* 窄化一个跨设置边界的值。
* @param value - 来自设置文档或 UI 的值。
* @returns 是否为合法皮肤标识。
*/
function isSkin(value) {
	return SKINS.some((skin) => skin === value);
}
/**
* 本插件自有的设置命名空间。
*
* 不复用 ui-theme 的命名空间，也不走 register()+setTheme() 当持久化路径：
* ThemeRuntime 的 isThemePreference 白名单只认 light/dark/system，
* 任何自定义 id 都存不进它的偏好字段（源码实证）。明暗归 app，衣装归这里。
*/
const SETTINGS_NAMESPACE = "joi-channel-theme";
/** 承载衣装选择的字段名。 */
const SUIT_FIELD = "suit";
/**
* 窄化一个跨设置边界的值。
* @param value - 来自设置文档或 UI 的值。
* @returns 是否为合法衣装标识。
*/
function isSuit(value) {
	return SUITS.some((suit) => suit === value);
}
//#endregion
//#region src/index.ts
/** 衣装偏好的持久 schema，同时是浏览器侧校验用的 wire 信封。 */
const JoiSettingsSchema = z.object({ [SUIT_FIELD]: z.union([...SKINS]).default(DEFAULT_SKIN) });
const NAMESPACE = settingsNamespace(SETTINGS_NAMESPACE);
/**
* 宿主插件体：设置服务在场时注册衣装段。
*
* 用 ctx.inject 而不是直接读服务，是因为 settings 是可选能力——
* 远端浏览器场景下它可能根本没被组合进来，那时浏览器半边会走进程内兜底
* （见 client/suit.ts）。缺它不该让插件失败。
* @param ctx - 宿主上下文。
*/
function apply(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(NAMESPACE, JoiSettingsSchema);
	});
}
//#endregion
export { DEFAULT_SKIN, DEFAULT_SUIT, JoiSettingsSchema, SETTINGS_NAMESPACE, SKINS, SUITS, SUIT_FIELD, apply, isSkin, isSuit };
