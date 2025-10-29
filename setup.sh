#!/bin/bash

# HomeMadeFood App - Backend Setup Script
# This script sets up the PostgreSQL database and starts the backend server

echo "🍕 HomeMadeFood App - Backend Setup"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. You can modify it if needed."
else
    echo "✅ .env file already exists"
fi

# Start PostgreSQL database
echo "🐘 Starting PostgreSQL database..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ PostgreSQL database is running"
else
    echo "❌ Failed to start PostgreSQL database"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run start:dev"
echo "2. The API will be available at: http://localhost:3000"
echo "3. API documentation: http://localhost:3000/api"
echo ""
echo "Database information:"
echo "- Host: localhost"
echo "- Port: 5432"
echo "- Database: homemadefood_db"
echo "- Username: postgres"
echo "- Password: password"
echo ""
echo "To stop the database: npm run db:stop"
echo "To reset the database: npm run db:reset"