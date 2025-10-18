#!/bin/bash

set -e

echo "Streamoid Docker Setup"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Docker is installed"
echo "Docker Compose is installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo ".env file created. You can edit it to customize your configuration."
    else
        echo ".env.example not found. Using default Docker configuration."
    fi
else
    echo ".env file exists"
fi

echo ""
echo "Building Docker containers..."
docker-compose build

echo ""
echo "Starting containers..."
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "Container status:"
docker-compose ps

echo ""
echo "  Setup complete!"
echo ""
echo "Your application is running at: http://localhost:8000"
echo ""
echo "Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop containers:  docker-compose down"
echo "   Restart:          docker-compose restart"
echo "   Access shell:     docker-compose exec app sh"
echo ""
