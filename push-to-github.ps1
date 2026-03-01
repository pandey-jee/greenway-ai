# =============================================
# GreenWay AI - Push to GitHub Script (PowerShell)
# =============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Push GreenWay AI to GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get GitHub username
$githubUsername = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    Write-Host "Error: GitHub username is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Create GitHub Repository" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Open this link in your browser:" -ForegroundColor Cyan
Write-Host "https://github.com/new" -ForegroundColor Green
Write-Host ""
Write-Host "Repository settings:" -ForegroundColor Cyan
Write-Host "  - Name: greenway-ai" -ForegroundColor White
Write-Host "  - Description: GreenWay AI - Smart Sustainable Tourism Management" -ForegroundColor White
Write-Host "  - Public: Yes (check)" -ForegroundColor White
Write-Host "  - DO NOT initialize with anything" -ForegroundColor Red
Write-Host ""
Write-Host "Click 'Create repository' then press Enter here..." -ForegroundColor Yellow
Read-Host "Press Enter to continue"

Write-Host ""
Write-Host "Step 2: Pushing Code to GitHub..." -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host ""

$repoUrl = "https://github.com/$githubUsername/greenway-ai.git"

Write-Host "Adding remote: $repoUrl" -ForegroundColor Cyan

# Try to add remote, if it exists, remove and re-add
try {
    git remote add origin $repoUrl 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Remote already exists, updating..." -ForegroundColor Yellow
        git remote remove origin
        git remote add origin $repoUrl
    }
} catch {
    Write-Host "Error adding remote" -ForegroundColor Red
}

Write-Host "Setting branch to main..." -ForegroundColor Cyan
git branch -M main

Write-Host "Pushing code..." -ForegroundColor Cyan
Write-Host ""

# Show what will be pushed
Write-Host "Files to be pushed:" -ForegroundColor Cyan
git ls-files | Measure-Object | Select-Object @{Name="Count"; Expression={$_.Count}}
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! Code pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository:" -ForegroundColor Cyan
    Write-Host "https://github.com/$githubUsername/greenway-ai" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy backend to Render (see DEPLOYMENT.md)" -ForegroundColor White
    Write-Host "2. Deploy frontend to Vercel (see DEPLOYMENT.md)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Wrong GitHub credentials - re-run and try again" -ForegroundColor White
    Write-Host "2. Repository doesn't exist yet - create at https://github.com/new" -ForegroundColor White
    Write-Host "3. SSH/HTTPS not configured - use:" -ForegroundColor White
    Write-Host "   git config --global credential.helper store" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Press Enter to exit..." -ForegroundColor Cyan
Read-Host
