#!/bin/bash

# Motorove Backend Docker Management Script
# This script helps manage Docker containers for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if environment file exists
check_env_file() {
    local env_file=$1
    if [ ! -f "$env_file" ]; then
        print_error "Environment file '$env_file' not found!"
        print_info "Creating from sample..."
        
        local sample_file="${env_file}.sample"
        if [ -f "$sample_file" ]; then
            cp "$sample_file" "$env_file"
            print_warning "Please edit '$env_file' with your actual values before starting the containers."
            return 1
        else
            print_error "Sample file '$sample_file' not found!"
            return 1
        fi
    fi
    return 0
}

# Setup environment
setup_env() {
    local env=$1
    local env_file=""
    
    case $env in
        dev|development)
            env_file=".env.dev"
            ;;
        staging)
            env_file=".env.staging"
            ;;
        prod|production)
            env_file=".env"
            ;;
        *)
            print_error "Invalid environment: $env"
            print_info "Valid environments: dev, staging, prod"
            exit 1
            ;;
    esac
    
    check_env_file "$env_file"
}

# Start containers
start() {
    local env=${1:-dev}
    
    print_header "Starting Motorove Backend - $env"
    
    # Setup environment
    setup_env "$env"
    
    # Determine service name
    local service=""
    case $env in
        dev|development)
            service="api-dev"
            ;;
        staging)
            service="api-staging"
            ;;
        prod|production)
            service="api-prod"
            ;;
    esac
    
    print_info "Starting $service..."
    docker-compose up -d "$service"
    
    print_success "Containers started successfully!"
    print_info "Waiting for services to be ready..."
    sleep 5
    
    print_info "Container status:"
    docker-compose ps
    
    print_success "Backend is running!"
    print_info "API: http://localhost:${API_PORT:-3000}/api"
    print_info "GraphQL: http://localhost:${API_PORT:-3000}/graphql"
}

# Stop containers
stop() {
    local env=${1:-dev}
    
    print_header "Stopping Motorove Backend - $env"
    
    local service=""
    case $env in
        dev|development)
            service="api-dev"
            ;;
        staging)
            service="api-staging"
            ;;
        prod|production)
            service="api-prod"
            ;;
    esac
    
    docker-compose stop "$service"
    print_success "Containers stopped successfully!"
}

# Restart containers
restart() {
    local env=${1:-dev}
    
    print_header "Restarting Motorove Backend - $env"
    
    stop "$env"
    start "$env"
}

# View logs
logs() {
    local env=${1:-dev}
    
    local service=""
    case $env in
        dev|development)
            service="api-dev"
            ;;
        staging)
            service="api-staging"
            ;;
        prod|production)
            service="api-prod"
            ;;
    esac
    
    docker-compose logs -f "$service"
}

# Build images
build() {
    local env=${1:-dev}
    
    print_header "Building Motorove Backend - $env"
    
    local service=""
    case $env in
        dev|development)
            service="api-dev"
            ;;
        staging)
            service="api-staging"
            ;;
        prod|production)
            service="api-prod"
            ;;
    esac
    
    print_info "Building $service..."
    docker-compose build "$service"
    
    print_success "Build completed successfully!"
}

# Run migrations
migrate() {
    local env=${1:-dev}
    
    print_header "Running Database Migrations - $env"
    
    local service=""
    case $env in
        dev|development)
            service="api-dev"
            ;;
        staging)
            service="api-staging"
            ;;
        prod|production)
            service="api-prod"
            ;;
    esac
    
    print_info "Running migrations..."
    docker-compose exec "$service" pnpm prisma migrate deploy
    
    print_success "Migrations completed successfully!"
}

# Seed database
seed() {
    local env=${1:-dev}
    
    print_header "Seeding Database - $env"
    
    local service=""
    case $env in
        dev|development)
            service="api-dev"
            ;;
        staging)
            service="api-staging"
            ;;
        prod|production)
            service="api-prod"
            ;;
    esac
    
    print_info "Seeding database..."
    docker-compose exec "$service" pnpm prisma:seed
    
    print_success "Database seeded successfully!"
}

# Shell access
shell() {
    local env=${1:-dev}
    
    local service=""
    case $env in
        dev|development)
            service="api-dev"
            ;;
        staging)
            service="api-staging"
            ;;
        prod|production)
            service="api-prod"
            ;;
    esac
    
    print_info "Opening shell in $service..."
    docker-compose exec "$service" sh
}

# Clean up
clean() {
    print_header "Cleaning up Docker resources"
    
    print_warning "This will stop all containers and remove volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Status
status() {
    print_header "Container Status"
    docker-compose ps
}

# Help
show_help() {
    cat << EOF
${BLUE}Motorove Backend Docker Management Script${NC}

${GREEN}Usage:${NC}
    ./docker.sh <command> [environment]

${GREEN}Commands:${NC}
    start [env]     Start containers (default: dev)
    stop [env]      Stop containers
    restart [env]   Restart containers
    build [env]     Build Docker images
    logs [env]      View container logs
    migrate [env]   Run database migrations
    seed [env]      Seed database
    shell [env]     Open shell in container
    status          Show container status
    clean           Stop containers and remove volumes
    help            Show this help message

${GREEN}Environments:${NC}
    dev, development    Development environment (default)
    staging             Staging environment
    prod, production    Production environment

${GREEN}Examples:${NC}
    ./docker.sh start dev           # Start development environment
    ./docker.sh build staging       # Build staging image
    ./docker.sh logs prod           # View production logs
    ./docker.sh migrate dev         # Run migrations in development
    ./docker.sh shell dev           # Open shell in development container

${GREEN}Quick Start:${NC}
    1. ./docker.sh build dev        # Build development image
    2. ./docker.sh start dev        # Start development environment
    3. ./docker.sh migrate dev      # Run migrations
    4. ./docker.sh logs dev         # View logs

${YELLOW}Note:${NC}
    Make sure to configure your .env files before starting containers.
    Run './docker.sh setup [env]' to create environment files from samples.

EOF
}

# Main script logic
case ${1:-help} in
    start)
        start "${2:-dev}"
        ;;
    stop)
        stop "${2:-dev}"
        ;;
    restart)
        restart "${2:-dev}"
        ;;
    build)
        build "${2:-dev}"
        ;;
    logs)
        logs "${2:-dev}"
        ;;
    migrate)
        migrate "${2:-dev}"
        ;;
    seed)
        seed "${2:-dev}"
        ;;
    shell)
        shell "${2:-dev}"
        ;;
    clean)
        clean
        ;;
    status)
        status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
