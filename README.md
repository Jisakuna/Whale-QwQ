# dsh-web-gui-pack 🎨

**DeepSeek Harness Web GUI personalization pack** — a complete bundle of the Joi two-outfit theme (wardrobe + character assets) and the custom background plugin. Extract and install.

**English** · [**简体中文**](README.cn.md)

---

## Contents

| Directory | What it is | Features |
|-----------|------------|----------|
| `whale-qwq/` | Joi two-outfit theme (full source + built artifacts + assets) | Settings → Wardrobe: Joi·Flowers / Joi·Library / Native; the chat sprites are replaced with your custom **tulip 4** and **-01** artwork |
| `dsh-custom-bg/` | Custom background plugin (with overlay-exclusion fix) | Settings → General → "Custom Background": import a background image + adjust opacity, remembered separately for light/dark modes |

## Installation

Prerequisites: a DeepSeek Harness checkout and Node.js.

```sh
# Run from the Harness checkout (replace <pack> with the extracted path)
dsh plugin --profile web add <pack>/whale-qwq
dsh plugin --profile web add <pack>/dsh-custom-bg
```

Or run the one-click script `install.ps1` (keep the script in the same directory as the two plugin folders, and run it from the Harness checkout):

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

**Restart the Web GUI** (`pnpm dsh web`) after installation.

## Usage

- **Wardrobe**: Settings → General → "Wardrobe" row; pick Joi·Flowers / Joi·Library / Native. Use the top-right theme button to switch light/dark.
- **Background**: Settings → General → "Custom Background" → import an image → check "Enabled" → adjust the opacity slider (one image per light/dark mode).
- **Diagnostics**: run `window.__cbg()` in the browser console to inspect the background plugin state (matched surfaces, CSS variables, last error, etc.).

## Assets

- `whale-qwq/stuff/Stuff for Use/` holds all editable source art; `In a Chat - tulip 4.png` (joiFlowers slot) and `-01.png` (zhouxin slot) are the active custom sprites.
- To swap art and rebuild: `cd whale-qwq && npm install && npm run build` (the asset pipeline needs Python + Pillow; the built `lib/` and `src/generated/` are already included, so installation works without building).
- After editing `dsh-custom-bg` sources: `cd dsh-custom-bg && npm install && npm run build`, then just refresh the browser (the client bundle is served without caching).

## Known limitations

- Both plugins are installed via `link:` — **do not delete or move the extracted directories after installation**.
- Background images and settings live in browser localStorage (key `dsh-custom-bg`); they do not follow you across browsers or machines.
- The custom background only paints containers that are near viewport size and share the theme's base background color; if a future Harness release changes how that base color is painted, `findSurfaces()` in `dsh-custom-bg/src/client/background.ts` must be updated.

## License

- `whale-qwq/`: CC BY-NC-SA 4.0 (see its `LICENSE` / `LICENSE-ASSETS.md` / `NOTICE`; non-commercial only)
- `dsh-custom-bg/`: MIT
- This pack's `README.md` / `README.cn.md` / `install.ps1`: MIT
