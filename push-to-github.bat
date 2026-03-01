@echo off
REM =============================================
REM GreenWay AI - Push to GitHub Script
REM =============================================

setlocal enabledelayedexpansion

echo ========================================
echo Push GreenWay AI to GitHub
echo ========================================
echo.

REM Get GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "

if "!GITHUB_USERNAME!"=="" (
    echo Error: GitHub username is required!
    pause
    exit /b 1
)

echo.
echo Step 1: Creating GitHub repository...
echo Please open this link in browser and create the repository:
echo https://github.com/new
echo.
echo Repository settings:
echo   - Name: greenway-ai
echo   - Description: GreenWay AI - Smart Sustainable Tourism Management
echo   - Public: Yes
echo   - Don't initialize with anything
echo.
pause

echo.
echo Step 2: Pushing code to GitHub...
echo.

cd /d "%~dp0"

git remote add origin https://github.com/!GITHUB_USERNAME!/greenway-ai.git
if !errorlevel! equ 0 (
    echo Successfully added remote
) else (
    echo Remote might already exist, removing and re-adding...
    git remote remove origin
    git remote add origin https://github.com/!GITHUB_USERNAME!/greenway-ai.git
)

git branch -M main
echo Branch set to main

git push -u origin main

if !errorlevel! equ 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo Your repository is at:
    echo https://github.com/!GITHUB_USERNAME!/greenway-ai
    echo.
) else (
    echo.
    echo ❌ Push failed. Common issues:
    echo - Wrong GitHub credentials
    echo - Repository doesn't exist yet
    echo - SSH key not configured
    echo.
    echo Try authenticating with GitHub:
    echo git config credential.helper store
    echo git push -u origin main
    echo.
)

pause
