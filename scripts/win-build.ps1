# SiYuan Build Script for Windows (PowerShell Version)
Write-Host "Building SiYuan for Windows using PowerShell"

Write-Host "Building UI"
Set-Location -Path "app"
& pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "pnpm install failed"
    exit $LASTEXITCODE
}

& pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "pnpm build failed"
    exit $LASTEXITCODE
}

Set-Location ..

Write-Host "Cleaning Builds"
if (Test-Path "app\build") {
    Remove-Item -Path "app\build" -Recurse -Force
}
if (Test-Path "app\kernel") {
    Remove-Item -Path "app\kernel" -Recurse -Force
}
if (Test-Path "app\kernel-arm64") {
    Remove-Item -Path "app\kernel-arm64" -Recurse -Force
}

Write-Host "Building Kernel"

# Set Go environment variables
$env:GO111MODULE = "on"
$env:GOPROXY = "https://mirrors.aliyun.com/goproxy/"
$env:CGO_ENABLED = "1"

Set-Location -Path "kernel"

# Check if goversioninfo is installed, skip if not
$goversioninfoExists = Get-Command goversioninfo -ErrorAction SilentlyContinue
if ($goversioninfoExists) {
    Write-Host "Generating version info..."
    & goversioninfo -platform-specific=true -icon=resource/icon.ico -manifest=resource/goversioninfo.exe.manifest
} else {
    Write-Host "Warning: goversioninfo not found. Skipping version info generation." -ForegroundColor Yellow
}

# Detect and set compiler for ARM64 if available
$arm64Compiler = $null

# Look for common paths where MinGW-w64 might be installed
$possiblePaths = @(
    "C:\Program Files\mingw-w64\*\bin\aarch64-w64-mingw32-gcc.exe",
    "D:\Program Files\mingw-w64\*\bin\aarch64-w64-mingw32-gcc.exe", 
    "C:\Program Files\llvm-mingw-*\bin\aarch64-w64-mingw32-gcc.exe",
    "D:\Program Files\llvm-mingw-*\bin\aarch64-w64-mingw32-gcc.exe",
    "${env:USERPROFILE}\scoop\apps\*\bin\aarch64-w64-mingw32-gcc.exe",
    "C:\msys64\mingw64\bin\aarch64-w64-mingw32-gcc.exe",
    "C:\msys64\clang64\bin\aarch64-w64-mingw32-gcc.exe"
)

foreach ($path in $possiblePaths) {
    $foundPaths = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
    if ($foundPaths) {
        $arm64Compiler = $foundPaths[0].FullName
        Write-Host "Found ARM64 compiler: $arm64Compiler"
        break
    }
}

if (-not $arm64Compiler) {
    Write-Host "Warning: ARM64 compiler not found. Skipping ARM64 build." -ForegroundColor Yellow
} else {
    $env:CC = $arm64Compiler
}

Write-Host "Building Kernel amd64"
$env:GOOS = "windows"
$env:GOARCH = "amd64"
& go build --tags fts5 -v -o "../app/kernel/SiYuan-Kernel.exe" -ldflags "-s -w -H=windowsgui" .
if ($LASTEXITCODE -ne 0) {
    Write-Error "amd64 build failed"
    exit $LASTEXITCODE
}

if ($arm64Compiler) {
    Write-Host "Building Kernel arm64"
    $env:GOARCH = "arm64"
    & go build --tags fts5 -v -o "../app/kernel-arm64/SiYuan-Kernel.exe" -ldflags "-s -w -H=windowsgui" .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "arm64 build failed"
        exit $LASTEXITCODE
    }
}

Set-Location ..

Write-Host "Building Electron App amd64"
Set-Location -Path "app"

# Copy elevator binaries
if (Test-Path "elevator\elevator-amd64.exe") {
    Copy-Item -Path "elevator\elevator-amd64.exe" -Destination "kernel\elevator.exe"
}

$kernelArm64Path = "..\app\kernel-arm64"
if ((Test-Path "elevator\elevator-arm64.exe") -and (Test-Path $kernelArm64Path)) {
    Copy-Item -Path "elevator\elevator-arm64.exe" -Destination "kernel-arm64\elevator.exe"
}

& pnpm run dist
if ($LASTEXITCODE -ne 0) {
    Write-Error "Electron amd64 build failed"
    exit $LASTEXITCODE
}

if (Test-Path $kernelArm64Path) {
    & pnpm run dist-arm64
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Electron arm64 build failed"
        exit $LASTEXITCODE
    }
}

Set-Location ..

Write-Host "SiYuan build completed successfully!" -ForegroundColor Green