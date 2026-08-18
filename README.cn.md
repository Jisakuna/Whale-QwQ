# dsh-web-gui-pack 🎨

**DeepSeek Harness Web GUI 个性化包** —— Joi 双衣装主题（换装 + 角色素材）与自定义背景插件的完整打包，解压即装。

[**English**](README.md) · **简体中文**

---

## 包含内容

| 目录 | 是什么 | 功能 |
|------|--------|------|
| `whale-qwq/` | Joi 双衣装主题（完整源码 + 构建产物 + 素材） | 设置 → 换装：Joi·Flowers / Joi·Library / 原生；角色小精灵已替换为定制素材 **tulip 4** 与 **-01** |
| `dsh-custom-bg/` | 自定义背景插件（含覆盖层排除修复） | 设置 → 通用 → 「自定义背景」：导入背景图 + 不透明度，明暗模式分别记忆 |
| `dsh-maid-whale-pet/` | 常驻 pet（mascot）插件 | 从 [yunxiiQwQ/dsh-maid-whale-webUI](https://github.com/yunxiiQwQ/dsh-maid-whale-webUI) 裁剪：仅页面边缘常驻角色 + favicon，不含主题功能（BSD-3-Clause） |

## 安装

前置：DeepSeek Harness 源码目录 + Node.js。

```sh
# 在 Harness checkout 目录执行（把 <pack> 换成解压路径）
dsh plugin --profile web add <pack>/whale-qwq
dsh plugin --profile web add <pack>/dsh-custom-bg
dsh plugin --profile web add <pack>/dsh-maid-whale-pet
```

或运行一键脚本 `install.ps1`（脚本与插件目录放在同一目录，在 Harness checkout 中执行）：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

安装完成后**重启 Web GUI**（`pnpm dsh web`）。

## 使用

- **换装**：设置 → 通用 → 「换装」行，选 Joi·Flowers / Joi·Library / 原生；右上角主题按钮切换浅色/深色
- **背景**：设置 → 通用 → 「自定义背景」→ 导入图片 → 勾选「启用」→ 调节不透明度（浅色/深色各存一张）
- **诊断**：浏览器控制台运行 `window.__cbg()` 查看背景插件运行状态（命中表面、CSS 变量、最近错误等）

## 素材说明

- `whale-qwq/stuff/Stuff for Use/` 为全部可编辑源素材；`In a Chat - tulip 4.png`（joiFlowers 槽位）与 `-01.png`（zhouxin 槽位）为当前生效的定制形象
- 更换素材后重新构建：`cd whale-qwq && npm install && npm run build`（素材生成管线需 Python + Pillow；构建产物 `lib/` 与 `src/generated/` 均已随包提供，不构建也能直接安装）
- `dsh-custom-bg` 修改源码后：`cd dsh-custom-bg && npm install && npm run build`，浏览器 F5 刷新即可生效（客户端 bundle 无缓存）

## 已知限制

- 两个插件均以 `link:` 方式安装，**安装后解压目录不能删除或移动**
- 背景图片与设置保存在浏览器 localStorage（键 `dsh-custom-bg`），换浏览器或换机器不跟随
- 自定义背景只作用于「尺寸接近视口且底色等于主题底色」的大容器；若未来 Harness 改版不再如此绘制底色，需更新 `dsh-custom-bg/src/client/background.ts` 的 `findSurfaces()` 判定

## 许可

- `whale-qwq/`：CC BY-NC-SA 4.0（详见其 `LICENSE` / `LICENSE-ASSETS.md` / `NOTICE`，禁止商用）
- `dsh-custom-bg/`：MIT
- 本包 `README.md` / `README.cn.md` / `install.ps1`：MIT
