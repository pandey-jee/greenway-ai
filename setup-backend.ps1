# Backend Setup and Training Script
# Run this script to set up the backend and train ML models

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Smart Tourism Backend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Set-Location $PSScriptRoot
cd backend

# Create virtual environment if it doesn't exist
if (-Not (Test-Path "venv")) {
    Write-Host "`nCreating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "`n✅ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`nActivating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "`nInstalling Python dependencies..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes...)" -ForegroundColor Gray
Write-Host ""

# Upgrade pip first
Write-Host "Upgrading pip..." -ForegroundColor Gray
& .\venv\Scripts\python.exe -m pip install --upgrade pip --quiet

# Install packages with pre-compiled wheels only (--only-binary :all:)
Write-Host "Installing packages (using pre-compiled wheels)..." -ForegroundColor Gray
& .\venv\Scripts\python.exe -m pip install --only-binary :all: numpy pandas scikit-learn joblib --quiet 2>$null

# Install remaining packages
& .\venv\Scripts\python.exe -m pip install flask flask-cors python-dotenv --quiet 2>$null

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Create data directory
if (-Not (Test-Path "data")) {
    New-Item -ItemType Directory -Name "data" | Out-Null
    Write-Host "`n✅ Created data directory" -ForegroundColor Green
}

# Create models directory
if (-Not (Test-Path "models")) {
    New-Item -ItemType Directory -Name "models" | Out-Null
    Write-Host "✅ Created models directory" -ForegroundColor Green
}

# Generate training data
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Generating Training Data" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
python utils/data_generator.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Training data generated" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error generating data" -ForegroundColor Red
    exit 1
}

# Train clustering model
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Training ML Models" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "`n1. Training Tourist Clustering Model..." -ForegroundColor Yellow
python ml_models/clustering.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Clustering model trained" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Clustering training had issues, but continuing..." -ForegroundColor Yellow
}

# Train prediction model
Write-Host "`n2. Training Congestion Prediction Model..." -ForegroundColor Yellow
python ml_models/prediction.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Prediction model trained" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Prediction training had issues, but continuing..." -ForegroundColor Yellow
}

# Test ESI calculator
Write-Host "`n3. Testing ESI Calculator..." -ForegroundColor Yellow
python ml_models/esi_calculator.py

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "`nYour backend is ready. To start the API server, run:" -ForegroundColor White
Write-Host "  .\start-backend.ps1" -ForegroundColor Cyan
Write-Host "`nOr manually:" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "  python api/app.py" -ForegroundColor Gray
Write-Host ""
