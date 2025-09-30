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

# Push to Docker Hub
push() {
    local env=${1:-prod}
    shift
    
    print_header "Pushing to Docker Hub - $env"
    
    # Default Docker Hub username (can be overridden with DOCKER_HUB_USERNAME env var)
    local docker_username="${DOCKER_HUB_USERNAME:-yourusername}"
    local image_name="${DOCKER_HUB_IMAGE_NAME:-backend}"
    local tags=()
    
    # Determine target and default tags
    local target=""
    local default_tag=""
    case $env in
        dev|development)
            target="development"
            default_tag="dev"
            ;;
        staging)
            target="staging"
            default_tag="staging"
            ;;
        prod|production)
            target="production"
            default_tag="latest"
            ;;
    esac
    
    # Parse additional tags from arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --tag|-t)
                tags+=("$2")
                shift 2
                ;;
            --username|-u)
                docker_username="$2"
                shift 2
                ;;
            --image|-i)
                image_name="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Add default tag if no custom tags specified
    if [ ${#tags[@]} -eq 0 ]; then
        tags+=("$default_tag")
    fi
    
    # Check if logged in to Docker Hub
    if ! docker info | grep -q "Username"; then
        print_warning "Not logged in to Docker Hub"
        print_info "Attempting to log in..."
        docker login
        if [ $? -ne 0 ]; then
            print_error "Docker login failed"
            exit 1
        fi
    fi
    
    # Build the image
    print_info "Building image for $env environment..."
    docker build -f Dockerfile \
        --target "$target" \
        -t "temp-motorove-$env:build" \
        ../..
    
    if [ $? -ne 0 ]; then
        print_error "Build failed"
        exit 1
    fi
    
    print_success "Build completed!"
    
    # Tag the image
    print_info "Tagging image..."
    for tag in "${tags[@]}"; do
        local full_tag="${docker_username}/${image_name}:${tag}"
        print_info "  → $full_tag"
        docker tag "temp-motorove-$env:build" "$full_tag"
    done
    
    # Add git commit SHA tag if in a git repo
    if git rev-parse --git-dir > /dev/null 2>&1; then
        local git_sha=$(git rev-parse --short HEAD)
        local sha_tag="${docker_username}/${image_name}:sha-${git_sha}"
        print_info "  → $sha_tag (git commit)"
        docker tag "temp-motorove-$env:build" "$sha_tag"
        tags+=("sha-${git_sha}")
    fi
    
    # Push all tags
    print_info "Pushing to Docker Hub..."
    for tag in "${tags[@]}"; do
        local full_tag="${docker_username}/${image_name}:${tag}"
        print_info "Pushing $full_tag..."
        docker push "$full_tag"
        
        if [ $? -eq 0 ]; then
            print_success "  ✓ Pushed $full_tag"
        else
            print_error "  ✗ Failed to push $full_tag"
        fi
    done
    
    # Clean up temporary image
    docker rmi "temp-motorove-$env:build" > /dev/null 2>&1
    
    print_success "All images pushed successfully!"
    print_info "Docker Hub: https://hub.docker.com/r/${docker_username}/${image_name}"
}

# Pull from Docker Hub
pull() {
    local env=${1:-prod}
    local docker_username="${DOCKER_HUB_USERNAME:-yourusername}"
    local image_name="${DOCKER_HUB_IMAGE_NAME:-backend}"
    
    print_header "Pulling from Docker Hub - $env"
    
    local tag=""
    case $env in
        dev|development)
            tag="dev"
            ;;
        staging)
            tag="staging"
            ;;
        prod|production)
            tag="latest"
            ;;
    esac
    
    local full_image="${docker_username}/${image_name}:${tag}"
    
    print_info "Pulling $full_image..."
    docker pull "$full_image"
    
    if [ $? -eq 0 ]; then
        print_success "Image pulled successfully!"
    else
        print_error "Failed to pull image"
        exit 1
    fi
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
    ./docker.sh <command> [environment] [options]

${GREEN}Commands:${NC}
    start [env]     Start containers (default: dev)
    stop [env]      Stop containers
    restart [env]   Restart containers
    build [env]     Build Docker images
    logs [env]      View container logs
    migrate [env]   Run database migrations
    seed [env]      Seed database
    shell [env]     Open shell in container
    push [env]      Build and push image to Docker Hub
    pull [env]      Pull image from Docker Hub
    status          Show container status
    clean           Stop containers and remove volumes
    help            Show this help message

${GREEN}Environments:${NC}
    dev, development    Development environment (default)
    staging             Staging environment
    prod, production    Production environment

${GREEN}Push Options:${NC}
    --tag, -t <tag>         Additional tag for the image (can be used multiple times)
    --username, -u <user>   Docker Hub username (default: \$DOCKER_HUB_USERNAME)
    --image, -i <name>      Image name (default: backend)

${GREEN}Environment Variables:${NC}
    DOCKER_HUB_USERNAME     Your Docker Hub username
    DOCKER_HUB_IMAGE_NAME   Custom image name (default: backend)

${GREEN}Examples:${NC}
    ./docker.sh start dev           # Start development environment
    ./docker.sh build staging       # Build staging image
    ./docker.sh logs prod           # View production logs
    ./docker.sh migrate dev         # Run migrations in development
    ./docker.sh shell dev           # Open shell in development container
    
    # Push to Docker Hub
    ./docker.sh push prod                           # Push with default tags
    ./docker.sh push prod --tag v1.0.0              # Push with version tag
    ./docker.sh push prod --tag v1.0.0 --tag stable # Push with multiple tags
    ./docker.sh push staging -u myusername          # Push with custom username
    
    # Pull from Docker Hub
    ./docker.sh pull prod                           # Pull latest production image

${GREEN}Quick Start:${NC}
    1. ./docker.sh build dev        # Build development image
    2. ./docker.sh start dev        # Start development environment
    3. ./docker.sh migrate dev      # Run migrations
    4. ./docker.sh logs dev         # View logs

${GREEN}Docker Hub Workflow:${NC}
    1. export DOCKER_HUB_USERNAME=yourusername
    2. docker login                 # Login to Docker Hub
    3. ./docker.sh push prod --tag v1.0.0 --tag latest
    4. ./docker.sh pull prod        # Pull on another machine

${YELLOW}Note:${NC}
    Make sure to configure your .env files before starting containers.
    Set DOCKER_HUB_USERNAME environment variable for push/pull commands.
    See README-DOCKER-HUB.md for detailed Docker Hub documentation.

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
    push)
        shift
        push "$@"
        ;;
    pull)
        pull "${2:-prod}"
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
