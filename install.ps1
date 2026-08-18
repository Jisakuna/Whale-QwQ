# dsh-web-gui-pack ä¸€é”®å®‰è£…è„šæœ¬
# ç”¨æ³•ï¼šæŠŠæœ¬è„šæœ¬ä¸Ž whale-qwq / dsh-custom-bg æ”¾åœ¨åŒä¸€ç›®å½•ï¼Œ
#       åœ¨ DeepSeek Harness checkout é‡Œè¿è¡Œï¼špowershell -ExecutionPolicy Bypass -File <æœ¬è„šæœ¬è·¯å¾„>
$ErrorActionPreference = 'Stop'

$packDir = $PSScriptRoot
$harness = (Get-Location).Path

Write-Host "pack dir : $packDir" -ForegroundColor Cyan
Write-Host "harness  : $harness" -ForegroundColor Cyan

# ç¡®è®¤åœ¨ harness checkoutï¼ˆå­˜åœ¨ apps/cliï¼‰
if (-not (Test-Path (Join-Path $harness 'apps\cli'))) {
    Write-Error "è¯·å…ˆ cd åˆ° DeepSeek Harness checkout å†è¿è¡Œæœ¬è„šæœ¬ï¼ˆå½“å‰ï¼š$harnessï¼‰"
    exit 1
}

function Add-Plugin([string]$dir, [string]$name) {
    $abs = (Resolve-Path $dir).Path
    if (-not (Test-Path (Join-Path $abs 'package.json'))) {
        Write-Error "æ‰¾ä¸åˆ° $name çš„ package.jsonï¼š$abs"
        exit 1
    }
    Write-Host "==> å®‰è£… $nameï¼ˆ$absï¼‰" -ForegroundColor Green
    node --import tsx/esm apps/cli/src/bin.ts plugin --profile web add $abs
    if ($LASTEXITCODE -ne 0) { Write-Error "$name å®‰è£…å¤±è´¥"; exit 1 }
}

Add-Plugin (Join-Path $packDir 'whale-qwq') 'whale-qwq'
Add-Plugin (Join-Path $packDir 'dsh-custom-bg') 'dsh-custom-bg'

Write-Host ""
Write-Host "âœ… å…¨éƒ¨å®‰è£…å®Œæˆã€‚è¯·é‡å¯ Web GUIï¼ˆpnpm dsh webï¼‰ç”Ÿæ•ˆã€‚" -ForegroundColor Green
