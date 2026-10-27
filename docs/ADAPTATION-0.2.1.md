# 适配 DeepSeek Harness 0.2.x（0.1.9 → 0.2.0）

日期：2026-10-26 ｜ 目标运行时：dsh **0.2.1-rc.2**（npm 发布版）

---

## 一、结论

三个包都已按 0.2.x 的公开接口重写，并在真实浏览器里跑通：

| 包 | 版本 | 0.2.1-rc.2 上的结论 |
|---|---|---|
| `whale-qwq` | 0.1.9 → **0.2.0** | ✅ 可加载；换装行在设置里渲染；token 层生效；选择写进设置文档 |
| `dsh-custom-bg` | 0.1.0 → **0.1.1** | ✅ 可加载；「自定义背景」行在设置里渲染 |
| `dsh-maid-whale-pet` | 0.1.0 → **0.1.1** | ✅ 可加载；吉祥物在场 |

验证方式（不是「静态看起来没问题」）：

- `dsh web --dump-config`：退出码 0，三个 Loader 行都在，stderr 无兼容闸门告警。
- 另起一个 `dsh web --port 3099`，用 headless Chrome + CDP 实测（`scripts/verify-web.mjs`、`scripts/verify-settings.mjs`）：
  - `window.__joi()` / `window.__cbg()` 存在 → 两个插件体都执行了；
  - `selectorMisses: []` → 装饰层依赖的 DOM 钩子在 0.2.1 上仍然命中；
  - `body --dsw-alias-bg-base` = `#FFFAF2`（Flowers）/ `#FAFBFC`（Library）→ token 覆盖层真的落了；
  - 设置 → 通用里同时出现「换装」「自定义背景」两行；
  - 点 Joi·Library 后 `persistence = { channel: 'host', hostStatus: 'ready', hostUser: 'library' }`，profile 的 `cordis.patch.yml` 里出现 `- id: whale-qwq / config: suit: library` → **写入链路端到端打通**。

---

## 二、0.2.1 把哪些接口拿掉了

### 1. `@deepseek-ai/dsh-settings` 公开 API 重写（最致命）

0.1.x：

```ts
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
const NAMESPACE = settingsNamespace('joi-channel-theme')
ctx.inject(['settings'], (c) => c.settings.register(NAMESPACE, schema))
```

0.2.x 只剩 `SettingsForms` / `SettingsConflictError` / `redactSecrets` 三个导出。设置段不再由插件注册，而是**由 Loader 行的 Config schema 驱动**：

```ts
export const Config = z.object({ suit: z.union([...SKINS]).default('flowers').volatile() })
export function apply(ctx) {
  ctx.inject(['settings'], (c) => c.effect(() => c.settings.configure({ auto: false }, ctx.fiber)))
}
```

命名空间 = `entry.options.id`（`cordis.patch.yml` 里那行的 `id:`）。两个细节是硬要求：

- 字段必须 `.volatile()`：`SettingsForms` 只把 volatile 字段投影成表单（`volatileForm`），不加标记连 describe 都进不去，浏览器侧永远 `unavailable`；
- `configure` 的 owner 要传插件自身的 fiber（`ctx.fiber`），否则页面策略挂不到行上。

### 2. `@deepseek-ai/dsh-client-runtime` 整个下线

快照 store 引擎升格成平台模块 `@deepseek-ai/dsh-client-store`。旧 bundle 顶部那句
`require("@deepseek-ai/dsh-client-runtime/client")` 在 0.2.1 的模块表里答不上来，**模块一加载就抛**——所以这不是「设置不生效」，是整个主题不出现。

### 3. 浏览器侧设置通道改名

`ctx.settingsScope.bind({ namespace })` → `ctx.configForms.get(entryId)`。
返回值仍是「快照 + 订阅 + `set(field, value)`」，但语义有两处变化，本次适配都处理了：

- 快照多了 `user`（用户层）与 `revision`（写栅栏）；
- `value` 带 schema 默认值。**不能拿 `value.suit` 当「用户选过」的证据**，否则 0.1.x 时代存在 localStorage 里的选择会在升级后第一次加载时被默认值 `flowers` 顶掉。现在只认 `user.suit`，没有就继续读 localStorage（键名沿用 `whale-qwq.suit`，老选择不丢）。

### 4. 图标改名

`IconLightOutline16` / `IconDarkOutline16` / `IconFollowsystemOutline16` → `...OutlineRegular`（1px）/ `...OutlineMedium`（1.3px）。旧名字在 0.2.1 的 primitives 里已不存在，渲染换装行时会拿到 `undefined` 组件。

### 5. 平台模块表变了

0.2.1 的模块表（web bundle 里的 id → 实现映射）：

```
react, react/jsx-runtime, react-dom, react-dom/client, @deepseek-ai/cordis,
zod, @tanstack/react-virtual,
@deepseek-ai/dsh-client-store, @deepseek-ai/dsh-client-ui-slots,
@deepseek-ai/dsh-client-ui-primitives, @deepseek-ai/dsh-client-ui-dockkit
```

`dsh-client-runtime/client`、`dsh-client-web-react`、`dsh-client-schema-form`、`dsh-client-ui-attachment` 都不在了。两份 `tsdown.config.ts` 的外部化名单已按这张表逐字重写——名单外的 id 会被内联，名单内的才交给 `require`；写错任何一项都是运行时抛错。

### 6. 兼容闸门（新增）

0.2.x 启动时读每个插件 manifest：有 `engines.dsh` 就只看它，否则看所有 `@deepseek-ai/dsh*` 的 `peerDependencies`。三个包现在都写了：

```json
"engines": { "node": ">=20", "dsh": "^0.2.1-rc.2" }
```

以前 `whale-qwq` 的 `peerDependencies.@deepseek-ai/dsh-settings: ^0.1.0-rc.6` 会被闸门判为不兼容而整包跳过（安全失败），这也是升级报告里它「自动消失」的原因。

---

## 三、逐文件改动

### `whale-qwq/`

| 文件 | 改动 |
|---|---|
| `package.json` | 版本 0.2.0；`engines.dsh`；devDeps 换到 0.2.1-rc.3 的类型包；`dsh.client.inject` 加 renderer；`build` 改为只跑 `tsdown`（`gen` 移到 `build:full`） |
| `src/index.ts` | 删掉 `settingsNamespace` / `register`，导出 `Config`（volatile 的 `suit`）+ `settings.configure({ auto: false })` |
| `src/contract.ts` | `SETTINGS_NAMESPACE` 改为 `'whale-qwq'`（= Loader 行 id） |
| `src/client/suit.ts` | `SettingsScope` → `ConfigForm`；只认 `user` 层；新增 `adoptHost()`；`persistence` 多报 `hostUser` |
| `src/client/index.tsx` | `inject` 加 `configForms`、去 `settingsScope`；回读改走表单订阅；类型 import 换成 cordis / renderer / settings / theme |
| `src/client/suit-row-store.ts` | `defineStore` 改从 `@deepseek-ai/dsh-client-store` 取 |
| `src/client/SuitRow.tsx` | 三个图标换成 `...OutlineRegular` |
| `tsdown.config.ts` | 平台模块表重写；宿主侧 `schemastery` 显式 external |
| `src/generated/baseline.ts` | **新增**（见下） |
| `scripts/recover-baseline.mjs` | 新增：从 0.1.9 的 `lib/client.js` 取回基线常量 |

**关于 `baseline.ts`**：`design/baseline-4q.json` 被 `.gitignore` 忽略且从未发布，`src/generated/baseline.ts` 因此不在仓库里——干净 clone 直接 `npm run build` 会报 `Could not resolve '../generated/baseline.ts'`。这份文件现在由 `scripts/recover-baseline.mjs` 从 0.1.9 的内联产物中原样取回并提交（数值逐项一致，没有重新设计），仓库恢复「拿到就能构建」。

### `dsh-custom-bg/`

- `src/client/store.ts`：`defineStore` → `@deepseek-ai/dsh-client-store`
- `src/client/index.tsx`：`ClientContext` 改从 `@deepseek-ai/cordis` 取；补 ui-renderer 的类型合并
- `package.json`：0.1.1、`engines.dsh`、类型 devDeps
- `tsdown.config.ts`：平台模块表重写

### `dsh-maid-whale-pet/`

纯 DOM + 一张内联图，没有任何 require，**代码不用改**；只补了 `engines.dsh` 与版本号。它挂靠的 `[role="tree"]` 在 0.2.1 的 workspace 侧栏里仍然存在（实测 `mascot: 1`）。

### 根目录

- `install.ps1`：重写。不再要求「cd 到 Harness 源码 checkout」，也不再 `node --import tsx apps/cli/src/bin.ts`；改为检查 PATH 上的 `dsh` 是不是 0.2.x，然后 `dsh plugin --profile web add <目录>`；`-Rebuild` 可先装依赖再构建。
- `scripts/verify-web.mjs` / `scripts/verify-settings.mjs` / `scripts/cdp-eval.mjs`：headless Chrome + CDP 实测脚本，见第一节。

---

## 四、构建与安装

```sh
# 构建（三个包各自独立；baseline/assets 已随仓库提供，不需要 design/）
cd whale-qwq && npm install && npm run build
cd ../dsh-custom-bg && npm install && npm run build
```

```powershell
# 安装进 profile（任意目录，dsh 需为 0.2.x）
powershell -ExecutionPolicy Bypass -File .\install.ps1
# 或逐个：
dsh plugin --profile web add .\whale-qwq
dsh plugin --profile web add .\dsh-custom-bg
dsh plugin --profile web add .\dsh-maid-whale-pet
```

装完**重启 Web GUI**（客户端模块图在启动时扫描）。`dsh --version` 应为 `0.2.1-rc.2` 或更新。

---

## 五、已知限制 / 未覆盖

1. **引导页的 Q 版角色**（`paintOnboarding`）在 0.2.1 上找不到宿主：旧的 `welcomeNotice` 类名已随新版引导流程消失。这是 `fail-soft` 的装饰，缺了不影响任何功能，其余装饰（立绘、鲸鱼娘、底纹、字标、状态橙）实测全部在位。
2. **换装偏好仍有一份 localStorage 兜底**：设置文档可写时以文档为准（`channel: 'host'`），浏览器换机器不跟随。这是 0.1.x 的设计，本次保留。
3. `dsh-custom-bg` 的背景图存在 localStorage，不走设置文档（体积原因，未改）。
4. 真实 profile 里还有一个**与本 pack 无关**的旧 API 插件：`@linxin666/dsh-client-ui-skin-center` 仍在 `import { installSettingsSection, settingsNamespace }`，0.2.1 启动时会报 `SyntaxError` 并跳过它（安全失败）。要恢复它的皮肤功能得等上游更新或从 profile 里移除。
5. `whale-qwq` 的 `whale-qwq/README.{en,fr,ja,ko}.md` 与 `docs/DEVELOPMENT.md` 里的「settingsScope / 命名空间白名单」段落描述的是 0.1.x 机制，尚未逐篇改写；以本文件为准。

---

## 六、回滚

```powershell
# 1) 卸掉三个包（会同时从 profile 的 bundles 列表移除）
dsh plugin --profile web remove whale-qwq dsh-custom-bg dsh-maid-whale-pet

# 2) 还原 profile 清单（本次安装前的备份）
$b = "C:\Users\jisakuna\.dsh-backup-2026-10-26"
Copy-Item "$b\package.json","$b\cordis.patch.yml","$b\pnpm-lock.yaml" "$env:USERPROFILE\.dsh\profiles\web\" -Force
cd "$env:USERPROFILE\.dsh\profiles\web"; pnpm install
```

这次安装前已备份 `package.json` / `cordis.patch.yml` / `cordis.yml` / `pnpm-lock.yaml` / `pnpm-workspace.yaml` 到 `C:\Users\jisakuna\.dsh-backup-2026-10-26\`。

仓库侧的回退点：上一版（0.1.9 源码与产物）是 `3fa91dd`，本次适配提交在它之上。
`git reset --hard 3fa91dd` 即回到 0.1.x；只想撤销某个文件用
`git checkout 3fa91dd -- <path>`。

---

## 七、0.2.1 增量修复（2026-10-26）

0.2.0 装进真实 GUI 后暴露的两个视觉问题：

1. **左上角 logo 横向重复四遍。** 0.2.1 把字标拆成了
   `button._brand > span._brandIdentity > (span._brandMark + span._brandName)`，
   而本插件的选择器是裸 `[class*=_brand]`——四层全被贴上同一张 Joi logo。
   现在 `SELECTORS.brand` 锚到 `button[class*=_brand]`，并把原生 mark/name 那层
   （`_brandIdentity`，本来就是 `aria-hidden` 的装饰）收掉：**图标一个就够**。
   顺带修了个隐蔽开销：`brandSurgery()` 在新结构里找不到可搬的「HARNESS 字母段」，
   原先每帧都会重算一遍 `getBBox`；现在判一次就写 `data-joi-skip`，不再逐帧重试。
   > **字标改成「双人 + 糖果字」两层（2026-10-26）。** 左层仍是按衣装切换的双人
   > logo（`ASSETS.logoFlowers` / `logoLibrary`，1774×887 即 2:1，46px 高 → 92px 宽）；
   > 右层是 DeepSeek 糖果字：`scripts/make-brand-logo.mjs` 把 `logo.png` 裁到内容
   > 包围盒（1178×326）、按 2× 缩成 289×80、转 WebP（12.8 KB）内联进
   > `src/client/brand-logo.ts`，由 `--joi-brand-wordmark` 引用，从 100px 起
   > （92 + 8px 间距）、30px 高 ≈ 108px 宽。两层合计约 208px，占满 216px 品牌行。
   > 原生 mark/name 那层（`_brandIdentity`）仍然收掉，98px 左内边距同步去掉；
   > 源图存在 `stuff/Stuff for Use/DeepSeek Logo - Candy.png`，换图重跑一次脚本即可。

2. **左下角常驻 pet：改成贴着侧栏右边缘随动。** 0.2.x 的侧栏底部是「今日消费卡片 +
   账号行 + 两个图标」，底栏高约 210px 而角色高 160px——侧栏里没有一块 148×160 的空地，
   上移多少都只是换一样东西压。最终不再用固定偏移，而是**把左缘钉在侧栏右边缘 + 6px**，
   站进侧栏与输入卡片之间的空档里：
   - `ResizeObserver` 直接观察会话树（`[role="tree"]`）与输入卡片：拖动侧栏手柄、
     收起/展开动画、窗口缩放都逐帧重新量，角色是**跟着那条边框走**，而不是只在
     resize 事件上跳一下；节点被 React 换掉时由 MutationObserver 重新挂观察；
   - 输入卡片只用来算右边还剩多少空档：够就原尺寸，不够就等比缩小
     （`scale = (空档 − 14) / 148`，下限 0.55）；
   - 没有侧栏（收起成 rail）、没有输入卡片（设置页）、或 `[role="dialog"]` 模态
     打开时隐藏；窄于 960px 由 CSS 媒体查询隐藏。

实测（1504×865，headless Chrome）：
- 带 logo 背景的元素 **4 → 1**，`_brandIdentity` 计算样式 `display: none`；
- 把会话树宽度从 256px 改到 150px，角色 x 依次为 **284 → 173 → 284**，与边框同步；
- 1920 / 1504 / 1440 / 1300 / 1200 五档与输入卡片均无交叠（1200 缩到 89px），
  1100 隐藏；设置面板打开时 `display: none`。
截图见 `docs/sidebar-brand-pet.png`。

---

## 八、桌面快捷方式（2026-10-26 修复）

`桌面\DeepSeek-Harness.lnk` → `powershell -File %USERPROFILE%\.dsh\desktop-launcher\launcher.ps1`。

0.2.1 起，未持有配对 cookie 的浏览器访问 `/` 会得到 **401**
（`dsh web authentication required; reopen the URL printed by dsh web.`）。
launcher 的健康检查是 `Invoke-WebRequest` + 状态码 200–499，可 401 会让
`Invoke-WebRequest` **抛异常**，于是被判定为「没起来」：它又去起第二个 `dsh web`，
新实例绑不上 3080 直接退出，然后等满 60 秒弹「启动超时」。表现就是桌面图标点了没反应。

修法（旧文件备份为 `launcher.ps1.bak`）：

1. `Test-DshUrl`：捕获到 `$_.Exception.Response`（任何 HTTP 状态，含 401）即视为「服务在跑」；
2. 冷启动时把子进程 stdout/stderr 重定向到 `%TEMP%\dsh-launch.log`，从
   `dsh web: http://127.0.0.1:3080/?token=…` 里取出本次启动令牌，直接用它打开浏览器
   ——令牌只存在进程内存，磁盘上没有第二份，只能从启动输出里抓；
3. 子进程提前退出时立刻弹「启动失败」并附最后三行日志，不再干等 60 秒。

实测：服务已在跑时，图标 **0 秒返回并打开浏览器**（原来卡 60 秒报超时）；
冷启动路径用 3097 端口单独验证过：5 秒内抓到令牌 URL 并打开。
