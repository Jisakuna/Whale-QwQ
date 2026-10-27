# dsh-web-gui-pack 一键安装脚本（DeepSeek Harness 0.2.x）
#
# 用法（PowerShell，任意目录）：
#   powershell -ExecutionPolicy Bypass -File .\install.ps1
#   powershell -ExecutionPolicy Bypass -File .\install.ps1 -Rebuild   # 先装依赖并重新构建
#
# 与 0.1.x 时代的旧脚本的区别：
#   · 不再需要「cd 到 Harness 源码 checkout」——0.2.x 的插件就是 npm 包，
#     `dsh plugin` 本身就是 profile 的包管理器入口；
#   · 不再用 `node --import tsx apps/cli/src/bin.ts` 跑源码，改为调用 PATH 上的
#     `dsh`（0.2.x 的 bin），因此也不必先构建 Harness 本体。
#
# 安装完必须重启 Web GUI 才会生效：客户端模块图在启动时扫描，
# 运行中新增的 bundle 不会被挂上。

[CmdletBinding()]
param(
    [switch]$Rebuild,
    [string]$Profile = 'web'
)

$ErrorActionPreference = 'Stop'
$packDir = $PSScriptRoot

Write-Host "pack dir : $packDir" -ForegroundColor Cyan

# ── 1. 找到 0.2.x 的 dsh ─────────────────────────────────────────────
$dsh = Get-Command dsh -ErrorAction SilentlyContinue
if (-not $dsh) {
    Write-Error "找不到 dsh 命令。请先安装 DeepSeek Harness 0.2.x（npm i -g @deepseek-ai/dsh@0.2.1-rc.2），并确保它在 PATH 上。"
    exit 1
}
$version = (& $dsh.Source --version 2>$null | Select-Object -First 1).Trim()
Write-Host "dsh      : $($dsh.Source) ($version)" -ForegroundColor Cyan
if ($version -notmatch '^0\.2\.') {
    Write-Error @"
当前 dsh 版本是 $version，本 pack 只适配 0.2.x。
0.2.1 起 dsh-settings 的公开 API 被重写（settingsNamespace / installSettingsSection 已移除），
0.1.x 的插件在 0.2.x 上会在导入阶段报 SyntaxError。请先把 dsh 升到 0.2.1-rc.2 或更新。
"@
    exit 1
}

# ── 2.（可选）重新构建三个包 ─────────────────────────────────────────
$plugins = @(
    @{ Dir = 'whale-qwq'; Name = 'whale-qwq' },
    @{ Dir = 'dsh-custom-bg'; Name = 'dsh-custom-bg' },
    @{ Dir = 'dsh-maid-whale-pet'; Name = 'dsh-maid-whale-pet' },
    @{ Dir = 'dsh-power-button'; Name = 'dsh-power-button' }
)

foreach ($plugin in $plugins) {
    $abs = Join-Path $packDir $plugin.Dir
    if (-not (Test-Path (Join-Path $abs 'package.json'))) {
        Write-Error "找不到 $($plugin.Name) 的 package.json：$abs"
        exit 1
    }
    if (-not (Test-Path (Join-Path $abs 'lib\client.js'))) {
        Write-Error "$($plugin.Name) 缺少构建产物 lib\client.js；请加 -Rebuild，或先在该目录跑 npm install 与 npm run build"
        exit 1
    }
    if ($Rebuild) {
        Write-Host "==> 构建 $($plugin.Name)" -ForegroundColor Green
        Push-Location $abs
        try {
            if (-not (Test-Path 'node_modules')) { npm install --no-audit --no-fund }
            npm run build
            if ($LASTEXITCODE -ne 0) { throw "$($plugin.Name) 构建失败" }
        } finally {
            Pop-Location
        }
    }
}

# ── 3. 装进 profile ─────────────────────────────────────────────────
foreach ($plugin in $plugins) {
    $abs = (Resolve-Path (Join-Path $packDir $plugin.Dir)).Path
    Write-Host "==> 安装 $($plugin.Name)（$abs）" -ForegroundColor Green
    & $dsh.Source plugin --profile $Profile add $abs
    if ($LASTEXITCODE -ne 0) { Write-Error "$($plugin.Name) 安装失败"; exit 1 }
}

Write-Host ""
Write-Host "✅ 三个包都已写入 profile '$Profile'。" -ForegroundColor Green
Write-Host "   重启 Web GUI（关掉 dsh web 再重开）后生效：设置 → 通用 里会出现「换装」与「自定义背景」两行。" -ForegroundColor Yellow
Write-Host "   诊断：浏览器控制台 window.__joi() / window.__cbg()；终端里 dsh --version 应为 0.2.x。" -ForegroundColor DarkGray
