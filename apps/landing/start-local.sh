#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting Motorove Landing Page locally...${NC}"

# Build if needed
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}Building application...${NC}"
    pnpm build
fi

# Set environment variables
export PORT=8080
export HOSTNAME=0.0.0.0

echo -e "${GREEN}Starting server on http://localhost:8080${NC}"
pnpm start
