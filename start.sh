#!/bin/bash

# Slack-lite Quick Start Script

echo "🚀 Starting Slack-lite Chat Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. You can edit it if needed."
fi

# Start the application
echo "🐳 Starting application with Docker Compose..."
docker-compose up --build

echo "✅ Application started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "❤️  Health Check: http://localhost:3001/health"
echo "📊 Metrics: http://localhost:3001/metrics"
echo ""
echo "Press Ctrl+C to stop the application"
