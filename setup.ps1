# HomeMadeFood App - Backend Setup Script (PowerShell)
# This script sets up the PostgreSQL database and starts the backend server

Write-Host "🍕 HomeMadeFood App - Backend Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Visit: https://docs.docker.com/desktop/windows/install/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    Write-Host "   Visit: https://docs.docker.com/compose/install/" -ForegroundColor Yellow
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Blue
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. You can modify it if needed." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Start PostgreSQL database
Write-Host "🐘 Starting PostgreSQL database..." -ForegroundColor Blue
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Check if database is running
$dbStatus = docker-compose -f docker-compose.dev.yml ps
if ($dbStatus -match "Up") {
    Write-Host "✅ PostgreSQL database is running" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start PostgreSQL database" -ForegroundColor Red
    exit 1
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
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the development server: npm run start:dev" -ForegroundColor White
Write-Host "2. The API will be available at: http://localhost:3000" -ForegroundColor White
Write-Host "3. API documentation: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "Database information:" -ForegroundColor Yellow
Write-Host "- Host: localhost" -ForegroundColor White
Write-Host "- Port: 5432" -ForegroundColor White
Write-Host "- Database: homemadefood_db" -ForegroundColor White
Write-Host "- Username: postgres" -ForegroundColor White
Write-Host "- Password: password" -ForegroundColor White
Write-Host ""
Write-Host "To stop the database: npm run db:stop" -ForegroundColor Cyan
Write-Host "To reset the database: npm run db:reset" -ForegroundColor Cyan