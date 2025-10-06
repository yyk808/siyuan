@echo off
echo 'use ".\scripts\win-build.bat" instead of "win-build.bat"'

echo 'Building UI'
cd app
call pnpm install
if errorlevel 1 (
    exit /b %errorlevel%
)
call pnpm run build
if errorlevel 1 (
    exit /b %errorlevel%
)
cd ..

echo 'Cleaning Builds'
rmdir /S /Q app\build 1>nul
rmdir /S /Q app\kernel 1>nul
rmdir /S /Q app\kernel-arm64 1>nul

echo 'Building Kernel'
@REM the C compiler "gcc" is necessary https://sourceforge.net/projects/mingw-w64/files/mingw-w64/
go version
set GO111MODULE=on
set GOPROXY=https://mirrors.aliyun.com/goproxy/
set CGO_ENABLED=1

cd kernel
@REM you can use `go mod tidy` to update kernel dependency before build
@REM you can use `go generate` instead (need add something in main.go)
goversioninfo -platform-specific=true -icon=resource/icon.ico -manifest=resource/goversioninfo.exe.manifest

echo 'Building Kernel amd64'
set GOOS=windows
set GOARCH=amd64
go build --tags fts5 -v -o "../app/kernel/SiYuan-Kernel.exe" -ldflags "-s -w -H=windowsgui" .
if errorlevel 1 (
    exit /b %errorlevel%
)

echo 'Detecting ARM64 compiler for Kernel build'

set GOARCH=arm64
REM Try to find ARM64 compiler in common locations
set "CC_FOUND="
for %%d in (C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    if exist "%%d:\Program Files\mingw-w64\*\bin\aarch64-w64-mingw32-gcc.exe" (
        for /f "delims=" %%i in ('dir /b /s "%%d:\Program Files\mingw-w64\*\bin\aarch64-w64-mingw32-gcc.exe" 2^>nul') do (
            set "CC=%%i"
            set "CC_FOUND=1"
            goto :compiler_found
        )
    )
    if exist "%%d:\Program Files\llvm-mingw-*\bin\aarch64-w64-mingw32-gcc.exe" (
        for /f "delims=" %%i in ('dir /b /s "%%d:\Program Files\llvm-mingw-*\bin\aarch64-w64-mingw32-gcc.exe" 2^>nul') do (
            set "CC=%%i"
            set "CC_FOUND=1"
            goto :compiler_found
        )
    )
)

:compiler_found
if defined CC_FOUND (
    echo Found ARM64 compiler: %CC%
    go build --tags fts5 -v -o "../app/kernel-arm64/SiYuan-Kernel.exe" -ldflags "-s -w -H=windowsgui" .
    if errorlevel 1 (
        exit /b %errorlevel%
    )
) else (
    echo WARNING: ARM64 compiler not found. Skipping ARM64 build.
    echo Please install MinGW-w64 or LLVM-MinGW to build ARM64 version.
)
cd ..

echo 'Building Electron App amd64'
cd app

copy "elevator\elevator-amd64.exe" "kernel\elevator.exe"
copy "elevator\elevator-arm64.exe" "kernel-arm64\elevator.exe"

call pnpm run dist
if errorlevel 1 (
    exit /b %errorlevel%
)
echo 'Building Electron App arm64'
call pnpm run dist-arm64
if errorlevel 1 (
    exit /b %errorlevel%
)
cd ..

echo 'Building Appx'
echo 'Building Appx should be disabled if you do not need it. Not configured correctly will lead to build failures'
cd . > app\build\win-unpacked\resources\ms-store
call electron-windows-store --input-directory app\build\win-unpacked --output-directory app\build\ --package-version 1.0.0.0 --package-name SiYuan --manifest app\appx\AppxManifest.xml --assets app\appx\assets\ --make-pri true

rmdir /S /Q app\build\pre-appx 1>nul

echo 'Building Appx arm64'
echo 'Building Appx arm64 should be disabled if you do not need it. Not configured correctly will lead to build failures'
cd . > app\build\win-arm64-unpacked\resources\ms-store
call electron-windows-store --input-directory app\build\win-arm64-unpacked --output-directory app\build\ --package-version 1.0.0.0 --package-name SiYuan-arm64 --manifest app\appx\AppxManifest-arm64.xml --assets app\appx\assets\ --make-pri true

rmdir /S /Q app\build\pre-appx 1>nul
