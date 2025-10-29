# HomeMadeFood App - Backend Setup Script (No Docker)
# This script sets up the backend with SQLite database

Write-Host "🍕 HomeMadeFood App - Backend Setup (No Docker)" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Blue
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. You can modify it if needed." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Create data directory for SQLite
if (-not (Test-Path "data")) {
    Write-Host "📁 Creating data directory for SQLite..." -ForegroundColor Blue
    New-Item -ItemType Directory -Path "data" | Out-Null
    Write-Host "✅ Data directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Data directory already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# Build the application
Write-Host "🔨 Building the application..." -ForegroundColor Blue
npm run build

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Database Information:" -ForegroundColor Yellow
Write-Host "- Type: SQLite" -ForegroundColor White
Write-Host "- Location: ./data/homemadefood.sqlite" -ForegroundColor White
Write-Host "- Auto-created on first run" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the development server: npm run start:dev" -ForegroundColor White
Write-Host "2. The API will be available at: http://localhost:3000" -ForegroundColor White
Write-Host "3. API documentation: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "Admin Features:" -ForegroundColor Yellow
Write-Host "- Create food items: POST /api/v1/admin/food" -ForegroundColor White
Write-Host "- Create categories: POST /api/v1/admin/categories" -ForegroundColor White
Write-Host "- All admin endpoints require authentication" -ForegroundColor White
Write-Host ""
Write-Host "To reset the database: npm run db:reset" -ForegroundColor Cyan
