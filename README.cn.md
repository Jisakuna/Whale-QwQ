# dsh-web-gui-pack 🎨

**DeepSeek Harness Web GUI 个性化包**

[**English**](README.md) · **简体中文**

---

## 包含内容

| 目录 | 是什么 | 功能 |
|------|--------|------|
| `whale-qwq/` | 主题 | 设置 → 换装：Joi·Flowers / Joi·Library  |
| `dsh-custom-bg/` | 自定义背景 | 设置 → 通用 → 「自定义背景」：导入背景图 + 不透明度，明暗模式分别记忆 |
| `dsh-maid-whale-pet/` | 常驻吉祥物 | 页面边缘常驻角色 |

## 安装

前置：DeepSeek Harness 源码目录 + Node.js。

```sh
# 在 Harness checkout 目录执行（把 <pack> 换成解压路径）
dsh plugin --profile web add <pack>/whale-qwq
dsh plugin --profile web add <pack>/dsh-custom-bg
dsh plugin --profile web add <pack>/dsh-maid-whale-pet
```

或运行一键脚本 `install.ps1`：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

安装完成后**重启 Web GUI**。

## 使用

- **换装**：设置 → 通用 → 「换装」行，选 Joi·Flowers / Joi·Library 
- **背景**：设置 → 通用 → 「自定义背景」→ 导入图片 →「启用」→ 不透明度可调
- **诊断**：浏览器控制台运行 `window.__cbg()` 查看背景插件运行状态

## 许可

MIT License
