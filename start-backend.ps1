# Start Backend API Server

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Backend API Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
cd backend

# Check if virtual environment exists
if (-Not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run setup-backend.ps1 first:" -ForegroundColor Yellow
    Write-Host "  .\setup-backend.ps1" -ForegroundColor Cyan
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Start Flask API
Write-Host "Starting Flask API server..." -ForegroundColor Yellow
Write-Host ""
python api/app.py
