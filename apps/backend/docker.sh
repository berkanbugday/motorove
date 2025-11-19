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

# Push to Docker Hub with multi-architecture support
push() {
    local env=${1:-prod}
    shift
    
    print_header "Multi-Architecture Docker Build & Push - $env"
    
    # Default Docker Hub configuration for shared motorove/images repository
    local docker_username="${DOCKER_HUB_USERNAME:-motorove}"
    local image_name="${DOCKER_HUB_IMAGE_NAME:-images}"
    local tags=()
    local platforms="linux/amd64,linux/arm64"
    local use_buildx=true
    local no_cache=false
    
    # Determine target and default tags with backend prefix
    local target=""
    local default_tag=""
    case $env in
        dev|development)
            target="development"
            default_tag="backend-dev"
            ;;
        staging)
            target="staging"
            default_tag="backend-staging"
            ;;
        prod|production)
            target="production"
            default_tag="backend"
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
            --platform|-p)
                platforms="$2"
                shift 2
                ;;
            --no-buildx)
                use_buildx=false
                shift
                ;;
            --no-cache)
                no_cache=true
                shift
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
    
    print_info "Environment: $env"
    print_info "Target: $target"
    print_info "Docker Hub: ${docker_username}/${image_name}"
    print_info "Platforms: $platforms"
    
    if [ "$use_buildx" = true ]; then
        # Multi-architecture build with buildx
        print_info "Using Docker Buildx for multi-architecture build..."
        
        # Create or use existing buildx builder
        if ! docker buildx ls | grep -q "multiarch"; then
            print_info "Creating multiarch builder..."
            docker buildx create --name multiarch --driver docker-container --use
            print_success "Created multiarch builder"
        else
            docker buildx use multiarch
            print_success "Using existing multiarch builder"
        fi
        
        # Bootstrap the builder
        docker buildx inspect --bootstrap > /dev/null 2>&1
        
        # Build tag arguments
        local tag_args=()
        for tag in "${tags[@]}"; do
            tag_args+=("-t" "${docker_username}/${image_name}:${tag}")
        done
        
        # Add git commit SHA tag if in a git repo
        if git rev-parse --git-dir > /dev/null 2>&1; then
            local git_sha=$(git rev-parse --short HEAD)
            tag_args+=("-t" "${docker_username}/${image_name}:backend-sha-${git_sha}")
            print_info "Adding git commit tag: backend-sha-${git_sha}"
        fi
        
        # Build and push multi-architecture image
        print_info "Building and pushing multi-architecture image..."
        local buildx_args=(
            --platform "$platforms"
            --target "$target"
            "${tag_args[@]}"
            --push
            -f Dockerfile
        )
        
        # Add no-cache flag if requested
        if [ "$no_cache" = true ]; then
            buildx_args+=(--no-cache)
            print_warning "Building with --no-cache (this will take longer)"
        fi
        
        docker buildx build "${buildx_args[@]}" ../..
        
        if [ $? -eq 0 ]; then
            print_success "Multi-architecture image built and pushed successfully!"
            echo ""
            print_info "Images pushed:"
            for tag in "${tags[@]}"; do
                echo "  • ${docker_username}/${image_name}:${tag}"
            done
            if git rev-parse --git-dir > /dev/null 2>&1; then
                local git_sha=$(git rev-parse --short HEAD)
                echo "  • ${docker_username}/${image_name}:backend-sha-${git_sha}"
            fi
            echo ""
            print_info "Supported platforms: $platforms"
            echo ""
            print_info "To use on Railway, add this to your railway.toml:"
            echo ""
            echo "  [deploy]"
            echo "  image = \"${docker_username}/${image_name}:${tags[0]}\""
            echo ""
        else
            print_error "Build failed"
            exit 1
        fi
    else
        # Single-architecture build (legacy method)
        print_info "Using standard Docker build (single architecture)..."
        
        # Build the image
        print_info "Building image for $env environment..."
        local build_args=(
            -f Dockerfile
            --target "$target"
            -t "temp-motorove-$env:build"
        )
        
        # Add no-cache flag if requested
        if [ "$no_cache" = true ]; then
            build_args+=(--no-cache)
            print_warning "Building with --no-cache (this will take longer)"
        fi
        
        docker build "${build_args[@]}" ../..
        
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
            local sha_tag="${docker_username}/${image_name}:backend-sha-${git_sha}"
            print_info "  → $sha_tag (git commit)"
            docker tag "temp-motorove-$env:build" "$sha_tag"
            tags+=("backend-sha-${git_sha}")
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
    fi
    
    print_info "Docker Hub: https://hub.docker.com/r/${docker_username}/${image_name}"
}

# Pull from Docker Hub
pull() {
    local env=${1:-prod}
    local docker_username="${DOCKER_HUB_USERNAME:-motorove}"
    local image_name="${DOCKER_HUB_IMAGE_NAME:-images}"
    
    print_header "Pulling from Docker Hub - $env"
    
    local tag=""
    case $env in
        dev|development)
            tag="backend-dev"
            ;;
        staging)
            tag="backend-staging"
            ;;
        prod|production)
            tag="backend"
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
    --image, -i <name>      Image name (default: images)
    --platform, -p <plat>   Target platforms (default: linux/amd64,linux/arm64)
    --no-buildx             Use standard build instead of buildx (single architecture)
    --no-cache              Build without using cache (clean rebuild)

${GREEN}Environment Variables:${NC}
    DOCKER_HUB_USERNAME     Your Docker Hub username (default: motorove)
    DOCKER_HUB_IMAGE_NAME   Custom image name (default: images)

${GREEN}Examples:${NC}
    ./docker.sh start dev           # Start development environment
    ./docker.sh build staging       # Build staging image
    ./docker.sh logs prod           # View production logs
    ./docker.sh migrate dev         # Run migrations in development
    ./docker.sh shell dev           # Open shell in development container
    
    # Push to Docker Hub (multi-architecture by default)
    ./docker.sh push prod                           # Push as motorove/images:backend
    ./docker.sh push prod --tag backend-v1.0.0      # Push with version tag
    ./docker.sh push prod --tag backend-v1.0.0 --tag backend-stable # Push with multiple tags
    ./docker.sh push staging                        # Push as motorove/images:backend-staging
    ./docker.sh push prod --platform linux/amd64    # Push only for amd64
    ./docker.sh push prod --no-buildx               # Use single-arch build (legacy)
    ./docker.sh push staging --tag backend-v1.0.0 --no-cache # Clean rebuild without cache
    
    # Pull from Docker Hub
    ./docker.sh pull prod                           # Pull latest production image

${GREEN}Quick Start:${NC}
    1. ./docker.sh build dev        # Build development image
    2. ./docker.sh start dev        # Start development environment
    3. ./docker.sh migrate dev      # Run migrations
    4. ./docker.sh logs dev         # View logs

${GREEN}Docker Hub Workflow (Multi-Architecture):${NC}
    1. docker login                 # Login to Docker Hub (uses motorove account)
    2. ./docker.sh push prod --tag backend-v1.0.0
    3. ./docker.sh pull prod        # Pull motorove/images:backend
    
    Images are pushed to the shared motorove/images repository with backend- prefix tags.
    
    The push command builds for both linux/amd64 (Railway, AWS) and 
    linux/arm64 (Mac M1/M2) by default using Docker Buildx.

${YELLOW}Note:${NC}
    Make sure to configure your .env files before starting containers.
    Images are pushed to motorove/images repository with backend- prefix tags.
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
