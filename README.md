# dsh-web-gui-pack 🎨

[**English**](https://github.com/Jisakuna/Whale-QwQ/blob/main/README.md) · **Simplified Chinese**

---

## Contents

[svg](https://github.com/Jisakuna/Whale-QwQ/blob/main/README.cn.md#%E5%8C%85%E5%90%AB%E5%86%85%E5%AE%B9)

| **Directory and Purpose** |       |                                         |
| --------------------- | ----- | --------------------------------------- |
| `whale-qwq/`          | Themes | Settings → Outfits: Joi·Flowers / Joi·Library |
| `dsh-custom-bg/`      | Custom Background | Settings → General → “Custom Background”: import a background image and adjust opacity, with settings saved separately for light and dark modes |
| `dsh-maid-whale-pet/` | Persistent Mascot | A character that stays at the edge of the page |

## Installation

[svg](https://github.com/Jisakuna/Whale-QwQ/blob/main/README.cn.md#%E5%AE%89%E8%A3%85)

Prerequisites: a local DeepSeek Harness source checkout + Node.js.

```
# Run from the Harness checkout directory (replace <pack> with the path to the extracted pack)
dsh plugin --profile web add <pack>/whale-qwq
dsh plugin --profile web add <pack>/dsh-custom-bg
dsh plugin --profile web add <pack>/dsh-maid-whale-pet
```

**svg**

Or run the one-click installation script `install.ps1`:

```
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

**svg**

After installation, **restart the Web GUI**.

## Usage

[svg](https://github.com/Jisakuna/Whale-QwQ/blob/main/README.cn.md#%E4%BD%BF%E7%94%A8)

- **Outfits**: Settings → General → “Outfits” row, then select Joi·Flowers / Joi·Library
- **Background**: Settings → General → “Custom Background” → Import Image → “Enable” → adjust the opacity
- **Diagnostics**: Run `window.__cbg()` in the browser console to check the background plugin’s runtime status

## License

[svg](https://github.com/Jisakuna/Whale-QwQ/blob/main/README.cn.md#%E8%AE%B8%E5%8F%AF)

MIT License
