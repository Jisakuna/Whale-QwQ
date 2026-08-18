# dsh-web-gui-pack 一键安装脚本
# 用法：把本脚本与 whale-qwq / dsh-custom-bg / dsh-maid-whale-pet 放在同一目录，
#       在 DeepSeek Harness checkout 里运行：powershell -ExecutionPolicy Bypass -File <本脚本路径>
$ErrorActionPreference = 'Stop'

$packDir = $PSScriptRoot
$harness = (Get-Location).Path

Write-Host "pack dir : $packDir" -ForegroundColor Cyan
Write-Host "harness  : $harness" -ForegroundColor Cyan

# 确认在 harness checkout（存在 apps/cli）
if (-not (Test-Path (Join-Path $harness 'apps\cli'))) {
    Write-Error "请先 cd 到 DeepSeek Harness checkout 再运行本脚本（当前：$harness）"
    exit 1
}

function Add-Plugin([string]$dir, [string]$name) {
    $abs = (Resolve-Path $dir).Path
    if (-not (Test-Path (Join-Path $abs 'package.json'))) {
        Write-Error "找不到 $name 的 package.json：$abs"
        exit 1
    }
    Write-Host "==> 安装 $name（$abs）" -ForegroundColor Green
    node --import tsx/esm apps/cli/src/bin.ts plugin --profile web add $abs
    if ($LASTEXITCODE -ne 0) { Write-Error "$name 安装失败"; exit 1 }
}

Add-Plugin (Join-Path $packDir 'whale-qwq') 'whale-qwq'
Add-Plugin (Join-Path $packDir 'dsh-custom-bg') 'dsh-custom-bg'
Add-Plugin (Join-Path $packDir 'dsh-maid-whale-pet') 'dsh-maid-whale-pet'

Write-Host ""
Write-Host "✅ 全部安装完成。请重启 Web GUI（pnpm dsh web）生效。" -ForegroundColor Green
