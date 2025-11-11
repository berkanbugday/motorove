#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Motorove Landing Page with Docker...${NC}"

# Stop existing container if running
if [ "$(docker ps -q -f name=motorove-landing)" ]; then
    echo -e "${YELLOW}Stopping existing container...${NC}"
    docker stop motorove-landing
fi

# Remove existing container
if [ "$(docker ps -aq -f name=motorove-landing)" ]; then
    echo -e "${YELLOW}Removing existing container...${NC}"
    docker rm motorove-landing
fi

# Build and start
echo -e "${GREEN}Building and starting container...${NC}"
docker-compose up --build -d

# Wait for container to be ready
echo -e "${YELLOW}Waiting for container to be ready...${NC}"
sleep 3

# Check if container is running
if [ "$(docker ps -q -f name=motorove-landing)" ]; then
    echo -e "${GREEN}✓ Container is running!${NC}"
    echo -e "${GREEN}✓ Landing page available at: ${YELLOW}http://localhost:8080${NC}"
    echo ""
    echo "To view logs: docker logs -f motorove-landing"
    echo "To stop: docker-compose down"
else
    echo -e "${RED}✗ Container failed to start${NC}"
    echo "Check logs with: docker logs motorove-landing"
    exit 1
fi
