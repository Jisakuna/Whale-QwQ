# dsh-web-gui-pack 🎨

**DeepSeek Harness Web GUI Customization Pack**

**English** · [**简体中文**](README.cn.md)

---

## Contents

| Directory | Type | Function |
|------|--------|------|
| `whale-qwq/` | Themes | Settings → Outfits: Joi·Flowers / Joi·Library  |
| `dsh-custom-bg/` | Custom Background | Settings → General → “Custom Background”: import a background image and adjust opacity, with settings saved separately for light and dark modes |
| `dsh-maid-whale-pet/` | Persistent Mascot | A character that stays at the edge of the page |

## Installation

Prerequisites: a local DeepSeek Harness source checkout + Node.js.

```sh
# Run from the Harness checkout directory (replace <pack> with the path to the extracted pack)
dsh plugin --profile web add <pack>/whale-qwq
dsh plugin --profile web add <pack>/dsh-custom-bg
dsh plugin --profile web add <pack>/dsh-maid-whale-pet
```

Or run the one-click installation script `install.ps1`:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

After installation, **restart the Web GUI**.

## Usage

- **Outfits**: Settings → General → the “Outfits” row → select Joi·Flowers / Joi·Library
- **Background**: Settings → General → “Custom Background” → Import Image → “Enable” → adjust the opacity
- **Diagnostics**: Run `window.__cbg()` in the browser console to check the background plugin’s runtime status

## License

MIT License
