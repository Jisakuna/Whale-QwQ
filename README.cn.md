# dsh-web-gui-pack 🎨

**DeepSeek Harness Web GUI 个性化包**

[**English**](README.md) · **简体中文**

---

## 兼容性

面向 **DeepSeek Harness 0.2.x**（已用 `0.2.1-rc.2` 实测）。三个包都声明了
`engines.dsh: ^0.2.1-rc.2`：0.2.x 核心会正常加载，0.1.x 核心会被兼容闸门拦下。

**不能**在 0.1.x 上使用：0.2.1 移除了 `settingsNamespace` / `installSettingsSection`，
并下线了 `@deepseek-ai/dsh-client-runtime` 模块。完整改动清单、原因与实测记录见
[docs/ADAPTATION-0.2.1.md](docs/ADAPTATION-0.2.1.md)。

## 包含内容

| 目录 | 是什么 | 功能 |
|------|--------|------|
| `whale-qwq/` | 主题 | 设置 → 通用 → 「换装」：Joi·Flowers / Joi·Library / DeepSeek 原生 |
| `dsh-custom-bg/` | 自定义背景 | 设置 → 通用 → 「自定义背景」：导入背景图 + 不透明度，明暗模式分别记忆 |
| `dsh-maid-whale-pet/` | 常驻吉祥物 | 贴着侧栏右边缘随动的角色（拖宽/收起侧栏时跟着走，空档不够就缩小或隐藏） |
| `dsh-power-button/` | 电源键 | 侧栏底部「⏻ 退出」：确认后结束 dsh web 进程（只接受 loopback 请求） |

## 安装

前置：Node.js ≥ 20，且 `PATH` 上的 `dsh` 是 **0.2.x**（`dsh --version` 自查）。
0.2.x 的插件就是普通 npm 包，**不再需要** DeepSeek Harness 源码目录。

```sh
# 把 <pack> 换成这几个目录所在路径
dsh plugin --profile web add <pack>/whale-qwq
dsh plugin --profile web add <pack>/dsh-custom-bg
dsh plugin --profile web add <pack>/dsh-maid-whale-pet
```

或运行一键脚本 `install.ps1`（加 `-Rebuild` 会先装依赖并重新构建）：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

安装完成后**重启 Web GUI**（客户端模块图在启动时扫描）。

## 使用

- **换装**：设置 → 通用 → 「换装」行，选 Joi·Flowers / Joi·Library / 原生
- **背景**：设置 → 通用 → 「自定义背景」→ 导入图片 →「启用」→ 不透明度可调
- **退出**：侧栏底部「⏻ 退出」→ 确认 → dsh web 进程结束；下次双击桌面图标即可重启
- **诊断**：浏览器控制台运行 `window.__joi()`（主题）或 `window.__cbg()`（背景）

## 从源码构建

```sh
cd whale-qwq && npm install && npm run build
cd ../dsh-custom-bg && npm install && npm run build
```

`src/generated/baseline.ts` 与 `src/generated/assets.ts` 已随仓库提交：设计源
（`design/baseline-4q.json` 与原图）没有发布。`baseline.ts` 由
`scripts/recover-baseline.mjs` 从 0.1.9 的构建产物里原样取回；手上有 `design/` 时
`npm run build:full` 会重新生成这两份文件。

## 许可

MIT License
