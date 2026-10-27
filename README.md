# dsh-web-gui-pack 🎨

**DeepSeek Harness Web GUI Customization Pack**

**English** · [**简体中文**](README.cn.md)

---

## Compatibility

Built for **DeepSeek Harness 0.2.x** (verified against `0.2.1-rc.2`). The packages declare
`engines.dsh: ^0.2.1-rc.2`, so a 0.2.x core loads them and narrows/refuses them on 0.1.x.

They do **not** work on 0.1.x: 0.2.1 removed `settingsNamespace` / `installSettingsSection` and
retired the `@deepseek-ai/dsh-client-runtime` module. See
[docs/ADAPTATION-0.2.1.md](docs/ADAPTATION-0.2.1.md) for the full breakdown (what changed, why,
and how it was verified in a real browser).

## Contents

| Directory | Type | Function |
|------|--------|------|
| `whale-qwq/` | Themes | Settings → General → “Outfits”: Joi·Flowers / Joi·Library  |
| `dsh-custom-bg/` | Custom Background | Settings → General → “Custom Background”: import a background image and adjust opacity, with settings saved separately for light and dark modes |
| `dsh-maid-whale-pet/` | Persistent Mascot | A mascot that follows the sidebar border (tracks drag/resize, shrinks or hides when the gutter is too tight) |
| `dsh-power-button/` | Power Button | Sidebar footer "Quit": ends the dsh web process after a confirmation (loopback-only route) |

## Installation

Prerequisites: Node.js ≥ 20 and a `dsh` CLI on `PATH` that reports **0.2.x** (`dsh --version`).
No source checkout is needed any more — a 0.2.x plugin is an ordinary npm package.

```sh
# replace <pack> with the path to this directory
dsh plugin --profile web add <pack>/whale-qwq
dsh plugin --profile web add <pack>/dsh-custom-bg
dsh plugin --profile web add <pack>/dsh-maid-whale-pet
```

Or run the one-click installation script `install.ps1` (add `-Rebuild` to build the three packages first):

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

After installation, **restart the Web GUI** — the client module graph is scanned at startup.

## Usage

- **Outfits**: Settings → General → the “Outfits” row → select Joi·Flowers / Joi·Library / DeepSeek native
- **Background**: Settings → General → “Custom Background” → Import Image → “Enable” → adjust the opacity
- **Quit**: sidebar footer "⏻ Quit" → confirm → the dsh web process exits; double-click the desktop icon to start it again
- **Diagnostics**: Run `window.__joi()` (theme) or `window.__cbg()` (background) in the browser console

## Building from source

```sh
cd whale-qwq && npm install && npm run build
cd ../dsh-custom-bg && npm install && npm run build
```

`src/generated/baseline.ts` and `src/generated/assets.ts` are committed because the design source
(`design/baseline-4q.json`, the original PNGs) is not published; `baseline.ts` was recovered verbatim
from the 0.1.9 bundle with `scripts/recover-baseline.mjs`. `npm run build:full` regenerates both from
`design/` when you do have it.

## License

MIT License
