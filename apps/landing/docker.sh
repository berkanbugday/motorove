#!/bin/bash

# Motorove Landing Page Docker Management Script
# This script helps manage Docker containers and push to Docker Hub

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

# Start containers
start() {
    print_header "Starting Motorove Landing Page"
    
    print_info "Starting container..."
    docker-compose up -d
    
    print_success "Container started successfully!"
    print_info "Waiting for service to be ready..."
    sleep 3
    
    print_info "Container status:"
    docker-compose ps
    
    print_success "Landing page is running!"
    print_info "URL: http://localhost:8080"
}

# Stop containers
stop() {
    print_header "Stopping Motorove Landing Page"
    
    docker-compose stop
    print_success "Container stopped successfully!"
}

# Restart containers
restart() {
    print_header "Restarting Motorove Landing Page"
    
    stop
    start
}

# View logs
logs() {
    docker-compose logs -f
}

# Build images
build() {
    print_header "Building Motorove Landing Page"
    
    print_info "Building image..."
    docker-compose build
    
    print_success "Build completed successfully!"
}

# Push to Docker Hub with multi-architecture support
push() {
    shift
    
    print_header "Multi-Architecture Docker Build & Push"
    
    # Default Docker Hub configuration for shared motorove/images repository
    local docker_username="${DOCKER_HUB_USERNAME:-motorove}"
    local image_name="${DOCKER_HUB_IMAGE_NAME:-images}"
    local tags=()
    local platforms="linux/amd64,linux/arm64"
    local use_buildx=true
    local no_cache=false
    local default_tag="landing"
    
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
            tag_args+=("-t" "${docker_username}/${image_name}:landing-sha-${git_sha}")
            print_info "Adding git commit tag: landing-sha-${git_sha}"
        fi
        
        # Build and push multi-architecture image
        print_info "Building and pushing multi-architecture image..."
        local buildx_args=(
            --platform "$platforms"
            "${tag_args[@]}"
            --push
            -f Dockerfile
        )
        
        # Add NEXT_PUBLIC_* build args if set
        if [ -n "$NEXT_PUBLIC_API_URL" ]; then
            buildx_args+=(--build-arg "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL")
            print_info "NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
        else
            print_error "NEXT_PUBLIC_API_URL is not set!"
            print_info "Set it with: export NEXT_PUBLIC_API_URL=<your-api-url>"
            exit 1
        fi
        
        if [ -n "$NEXT_PUBLIC_BASE_URL" ]; then
            buildx_args+=(--build-arg "NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL")
            print_info "NEXT_PUBLIC_BASE_URL: $NEXT_PUBLIC_BASE_URL"
        else
            print_error "NEXT_PUBLIC_BASE_URL is not set!"
            print_info "Set it with: export NEXT_PUBLIC_BASE_URL=<your-base-url>"
            exit 1
        fi
        
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
                echo "  • ${docker_username}/${image_name}:landing-sha-${git_sha}"
            fi
            echo ""
            print_info "Supported platforms: $platforms"
            echo ""
            print_info "To deploy, use this image:"
            echo ""
            echo "  docker pull ${docker_username}/${image_name}:${tags[0]}"
            echo ""
        else
            print_error "Build failed"
            exit 1
        fi
    else
        # Single-architecture build (legacy method)
        print_info "Using standard Docker build (single architecture)..."
        
        # Build the image
        print_info "Building image..."
        local build_args=(
            -f Dockerfile
            -t "temp-motorove-landing:build"
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
            docker tag "temp-motorove-landing:build" "$full_tag"
        done
        
        # Add git commit SHA tag if in a git repo
        if git rev-parse --git-dir > /dev/null 2>&1; then
            local git_sha=$(git rev-parse --short HEAD)
            local sha_tag="${docker_username}/${image_name}:landing-sha-${git_sha}"
            print_info "  → $sha_tag (git commit)"
            docker tag "temp-motorove-landing:build" "$sha_tag"
            tags+=("landing-sha-${git_sha}")
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
        docker rmi "temp-motorove-landing:build" > /dev/null 2>&1
        
        print_success "All images pushed successfully!"
    fi
    
    print_info "Docker Hub: https://hub.docker.com/r/${docker_username}/${image_name}"
}

# Pull from Docker Hub
pull() {
    local docker_username="${DOCKER_HUB_USERNAME:-motorove}"
    local image_name="${DOCKER_HUB_IMAGE_NAME:-images}"
    local tag="${1:-landing}"
    
    print_header "Pulling from Docker Hub"
    
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
    print_info "Opening shell in container..."
    docker-compose exec landing sh
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
${BLUE}Motorove Landing Page Docker Management Script${NC}

${GREEN}Usage:${NC}
    ./docker.sh <command> [options]

${GREEN}Commands:${NC}
    start           Start container
    stop            Stop container
    restart         Restart container
    build           Build Docker image
    logs            View container logs
    shell           Open shell in container
    push            Build and push image to Docker Hub
    pull [tag]      Pull image from Docker Hub (default: latest)
    status          Show container status
    clean           Stop container and remove volumes
    help            Show this help message

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
    ./docker.sh start                       # Start landing page
    ./docker.sh build                       # Build image
    ./docker.sh logs                        # View logs
    ./docker.sh shell                       # Open shell in container
    
    # Push to Docker Hub (multi-architecture by default)
    ./docker.sh push                                # Push as motorove/images:landing
    ./docker.sh push --tag landing-v1.0.0           # Push with version tag
    ./docker.sh push --tag landing-v1.0.0 --tag landing-stable # Push with multiple tags
    ./docker.sh push --platform linux/amd64         # Push only for amd64
    ./docker.sh push --no-buildx                    # Use single-arch build (legacy)
    ./docker.sh push --tag landing-v1.0.0 --no-cache # Clean rebuild without cache
    
    # Pull from Docker Hub
    ./docker.sh pull                                # Pull motorove/images:landing
    ./docker.sh pull landing-v1.0.0                 # Pull specific version

${GREEN}Quick Start:${NC}
    1. ./docker.sh build            # Build image
    2. ./docker.sh start            # Start container
    3. ./docker.sh logs             # View logs

${GREEN}Docker Hub Workflow (Multi-Architecture):${NC}
    1. docker login                 # Login to Docker Hub (uses motorove account)
    2. ./docker.sh push --tag landing-v1.0.0
    3. ./docker.sh pull landing-v1.0.0 # Pull on another machine
    
    Images are pushed to the shared motorove/images repository with landing- prefix tags.
    
    The push command builds for both linux/amd64 (Railway, AWS) and 
    linux/arm64 (Mac M1/M2) by default using Docker Buildx.

${YELLOW}Note:${NC}
    Images are pushed to motorove/images repository with landing- prefix tags.
    The landing page runs on port 8080 by default.
    See README-DOCKER-HUB.md for detailed Docker Hub documentation.

EOF
}

# Main script logic
case ${1:-help} in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    build)
        build
        ;;
    logs)
        logs
        ;;
    shell)
        shell
        ;;
    push)
        push "$@"
        ;;
    pull)
        pull "${2:-landing}"
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
