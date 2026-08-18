# dsh-custom-bg

DeepSeek Harness 的自定义对话背景插件：在**设置界面手动导入背景图**，可调节**不透明度**，按**明暗模式分别记忆**。

> 纯客户端 UI 插件，不依赖任何主题（与 Joi 主题等可共存），全程 fail-soft，不破坏原生界面。

## 功能

- **导入图片**：设置 → 通用 → 「自定义背景」→ 导入图片（自动压缩：最长边 ≤1600px、转 WebP，存入浏览器本地存储）
- **不透明度**：0–100%，叠加层用 `rgba` 把图片向主题实时底色渐变——100% 全显、0% 完全隐入主题色；主题换装/切明暗自动跟随
- **明暗分离**：浅色/深色两种外观模式各存各的图与不透明度（右上角主题按钮切换后分别设置）
- **壁纸效果**：`cover` 铺满 + `fixed` 固定（滚动对话时背景不动），画在 app 真正画底色的大容器上
- **清除**：一键移除当前模式的背景并关闭

## 安装

### 方式一：从发布 zip 安装（推荐）

1. 下载 `dsh-custom-bg-v0.1.0.zip` 并解压到固定目录（解压后目录内含 `package.json`、`lib/`、`cordis.patch.yml`）
2. 从 Harness checkout 安装：

```sh
dsh plugin --profile web add /绝对/路径/dsh-custom-bg
```

3. 重启 Web GUI（或在 Harness checkout 重新运行 `pnpm dsh web`），进入 设置 → 通用 即可看到「自定义背景」行

> ⚠️ 安装后**解压目录不能删除或移动**（profile 以 `link:` 依赖指向它）。

### 方式二：从源码安装

```sh
git clone https://github.com/Jisakuna/dsh-custom-bg.git
cd <harness checkout>
dsh plugin --profile web add /绝对/路径/dsh-custom-bg
```

## 使用

1. 打开右上角主题按钮，确定当前外观模式（浅色/深色）
2. 设置 → 通用 → 「自定义背景」→ **导入图片** 选择图片
3. 勾选**启用**，拖动**不透明度**滑杆调节
4. 切到另一种外观模式，可再导入/调整另一张图

数据保存在浏览器 localStorage（键 `dsh-custom-bg`），换浏览器/换机器不跟随。

## 构建

```sh
npm install        # 需要网络；本机沙箱环境请加 --cache <可写路径>
npm run build      # tsdown → lib/index.js + lib/client.js
```

- Node ≥ 20；构建无需安装任何 @deepseek-ai 类型包（平台模块外部化）
- 产物 `lib/client.js` 是 `window.__ModuleLoader__.load({ id, factory })` 闭包壳，与 Harness 自带客户端产物同形
- 改完 `src/` 重新构建后，浏览器 **F5 刷新**即可加载新版（客户端 bundle 无缓存），无需重启服务器

## 已知限制

- 图片按模式分别存 localStorage（约 5MB 配额；压缩后单图通常 <1MB）
- 背景只画在「尺寸接近视口且底色等于主题底色」的大容器上——若未来 app 改版不再这样画底色，需要更新 `src/client/background.ts` 的 `findSurfaces()` 判据
- 浏览器控制台可运行 `window.__cbg()` 查看运行状态（模式、启用、透明度、命中表面数、CSS 变量、最近错误），用于排查

## 许可

MIT
