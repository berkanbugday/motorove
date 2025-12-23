# Docker Hub Push Guide

This guide explains how to build and push your Motorove backend Docker images to the shared `motorove/images` Docker Hub repository with backend-specific tags.

## Prerequisites

1. **Docker Hub Account**: Create an account at [hub.docker.com](https://hub.docker.com)
2. **Docker installed**: Docker 20.10 or higher
3. **Docker CLI access**: Ensure you're logged in to Docker Hub

## Quick Start

### 1. Login to Docker Hub

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

**Alternative**: Use an access token (recommended for CI/CD):

```bash
docker login -u YOUR_USERNAME -p YOUR_ACCESS_TOKEN
```

To create an access token:

1. Go to [Docker Hub Security Settings](https://hub.docker.com/settings/security)
2. Click "New Access Token"
3. Give it a description and permissions
4. Copy and save the token securely

### 2. Build and Push Using Helper Script

The easiest way is to use the enhanced `docker.sh` script:

```bash
# Build and push development image
./docker.sh push dev

# Build and push staging image
./docker.sh push staging

# Build and push production image
./docker.sh push prod

# Push with specific tag/version
./docker.sh push prod --tag v1.0.0

# Push with multiple tags
./docker.sh push prod --tag v1.0.0 --tag latest
```

### 3. Manual Build and Push

If you prefer to do it manually:

```bash
# Build the production image for motorove/images repository
docker build -f Dockerfile \
  --target production \
  --build-context monorepo=../.. \
  -t motorove/images:backend \
  -t motorove/images:backend-prod \
  -t motorove/images:backend-v1.0.0 \
  ../..

# Push to Docker Hub
docker push motorove/images:backend
docker push motorove/images:backend-prod
docker push motorove/images:backend-v1.0.0
```

## Image Tagging Strategy

### Recommended Tagging Convention

All images are pushed to `motorove/images` repository with backend-specific tags:

1. **Environment tags**: `backend-dev`, `backend-staging`, `backend-prod`
2. **Version tags**: `backend-v1.0.0`, `backend-v1.0.1`, etc.
3. **Git commit tags**: `backend-sha-abc1234` (for traceability)
4. **Latest tags**: `backend` (production), `backend-latest` (development)
5. **Date tags**: `backend-2025-09-30` (optional, for releases)

### Examples

```bash
# Production image with multiple tags
docker tag backend:prod motorove/images:backend
docker tag backend:prod motorove/images:backend-prod
docker tag backend:prod motorove/images:backend-v1.0.0

# Staging image
docker tag backend:staging motorove/images:backend-staging
docker tag backend:staging motorove/images:backend-v1.0.0-rc.1

# Development image
docker tag backend:dev motorove/images:backend-dev
docker tag backend:dev motorove/images:backend-latest
```

## Docker Compose with Docker Hub Images

Update your `docker-compose.yml` to pull from Docker Hub:

```yaml
services:
  api-prod:
    image: motorove/images:backend
    # ... rest of configuration
```

Or create a `docker-compose.hub.yml`:

```yaml
version: '3.8'

services:
  api-prod:
    image: motorove/images:backend
    container_name: motorove-api-prod
    env_file:
      - .env
    ports:
      - '3000:3000'
    networks:
      - motorove-network
    restart: unless-stopped

networks:
  motorove-network:
    driver: bridge
```

Then use it:

```bash
docker-compose -f docker-compose.hub.yml up -d
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/docker-build-push.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - main
      - staging
      - develop
    tags:
      - 'v*'

env:
  DOCKER_HUB_USERNAME: motorove
  IMAGE_NAME: images

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_HUB_USERNAME }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch,prefix=backend-
            type=ref,event=pr,prefix=backend-
            type=semver,pattern=backend-v{{version}}
            type=semver,pattern=backend-v{{major}}.{{minor}}
            type=semver,pattern=backend-v{{major}}
            type=sha,prefix=backend-sha-
            type=raw,value=backend,enable={{is_default_branch}}
            type=raw,value=backend-latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/backend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          target: production
          cache-from: type=registry,ref=${{ env.DOCKER_HUB_USERNAME }}/${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=${{ env.DOCKER_HUB_USERNAME }}/${{ env.IMAGE_NAME }}:buildcache,mode=max
          platforms: linux/amd64,linux/arm64
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
variables:
  DOCKER_HUB_USERNAME: motorove
  IMAGE_NAME: images
  DOCKER_DRIVER: overlay2

stages:
  - build
  - push

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - echo $DOCKER_HUB_TOKEN | docker login -u $DOCKER_HUB_USERNAME --password-stdin
  script:
    - cd apps/backend
    - docker build -f Dockerfile --target production -t $DOCKER_HUB_USERNAME/$IMAGE_NAME:backend-sha-$CI_COMMIT_SHA ../..
    - docker tag $DOCKER_HUB_USERNAME/$IMAGE_NAME:backend-sha-$CI_COMMIT_SHA $DOCKER_HUB_USERNAME/$IMAGE_NAME:backend
    - docker push $DOCKER_HUB_USERNAME/$IMAGE_NAME:backend-sha-$CI_COMMIT_SHA
    - docker push $DOCKER_HUB_USERNAME/$IMAGE_NAME:backend
  only:
    - main
```

## Security Best Practices

### 1. Use Docker Hub Access Tokens

Never use your password in scripts or CI/CD. Always use access tokens:

```bash
# Create token at: https://hub.docker.com/settings/security
echo "YOUR_TOKEN" | docker login -u motorove --password-stdin
```

### 2. Scan Images for Vulnerabilities

```bash
# Scan image before pushing
docker scan motorove/images:backend

# Or use Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image motorove/images:backend
```

### 3. Sign Images (Docker Content Trust)

Enable Docker Content Trust:

```bash
export DOCKER_CONTENT_TRUST=1
docker push motorove/images:backend
```

### 4. Use Multi-Architecture Builds

Build for multiple platforms:

```bash
docker buildx create --name multiarch --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --target production \
  -t motorove/images:backend \
  --push \
  -f apps/backend/Dockerfile \
  .
```

## Repository Settings on Docker Hub

### 1. Create Repository

1. Go to [Docker Hub](https://hub.docker.com)
2. Click "Create Repository"
3. Name: `images` (shared repository for all Motorove services)
4. Visibility: Private or Public
5. Description: "Motorove platform Docker images - Backend API and Landing Page"
6. Create repository

### 2. Configure Repository

- **README**: Link to your GitHub README or add deployment docs
- **Build triggers**: Set up automated builds (optional)
- **Webhooks**: Configure webhooks for notifications (optional)
- **Collaborators**: Add team members if needed

## Common Commands

### Build Commands

```bash
# Build for specific environment
./docker.sh build dev
./docker.sh build staging
./docker.sh build prod

# Build with no cache
docker-compose build --no-cache api-prod
```

### Tag Commands

```bash
# Tag local image for Docker Hub
docker tag motorove-api-prod:latest motorove/images:backend

# Tag with version
docker tag motorove-api-prod:latest motorove/images:backend-v1.0.0

# Tag with git commit
docker tag motorove-api-prod:latest motorove/images:backend-sha-$(git rev-parse --short HEAD)
```

### Push Commands

```bash
# Push specific tag
docker push motorove/images:backend

# Push all backend tags
docker push motorove/images --all-tags
```

### Pull Commands

```bash
# Pull from Docker Hub
docker pull motorove/images:backend

# Pull specific version
docker pull motorove/images:backend-v1.0.0
```

## Troubleshooting

### Authentication Issues

```bash
# Check if logged in
docker info | grep Username

# Logout and login again
docker logout
docker login
```

### Push Denied

If you get "denied: requested access to the resource is denied":

1. Ensure you're logged in: `docker login`
2. Check repository name matches your username
3. Verify repository exists on Docker Hub
4. Check if repository is public or you have access

### Image Size Too Large

```bash
# Check image size
docker images yourusername/backend

# Optimize Dockerfile:
# - Use multi-stage builds ✓ (already implemented)
# - Remove unnecessary dependencies
# - Use .dockerignore
# - Minimize layers

# Compress image
docker save yourusername/backend:latest | gzip > backend.tar.gz
```

### Build Context Too Large

```bash
# Check build context size
cd apps/backend
du -sh ../..

# Ensure .dockerignore is properly configured
# Add more patterns to .dockerignore if needed
```

## Automated Workflows

### Pre-commit Hook

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash

echo "Building and testing Docker image before push..."

cd apps/backend
./docker.sh build prod

if [ $? -ne 0 ]; then
    echo "Docker build failed. Push aborted."
    exit 1
fi

echo "Docker build successful!"
```

Make it executable:

```bash
chmod +x .git/hooks/pre-push
```

### Automated Versioning Script

Create `scripts/release.sh`:

```bash
#!/bin/bash

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    exit 1
fi

echo "Creating release $VERSION..."

# Build production image
cd apps/backend
./docker.sh build prod

# Tag with version
docker tag motorove-api-prod:latest yourusername/backend:$VERSION
docker tag motorove-api-prod:latest yourusername/backend:latest

# Push to Docker Hub
docker push yourusername/backend:$VERSION
docker push yourusername/backend:latest

echo "Release $VERSION created and pushed successfully!"
```

## Environment-Specific Images

### Development

```bash
# Build and push development image (for testing)
docker build -f Dockerfile --target development \
  -t yourusername/backend:dev \
  ../..
docker push yourusername/backend:dev
```

### Staging

```bash
# Build and push staging image
docker build -f Dockerfile --target staging \
  -t yourusername/backend:staging \
  -t yourusername/backend:v1.0.0-rc.1 \
  ../..
docker push yourusername/backend:staging
docker push yourusername/backend:v1.0.0-rc.1
```

### Production

```bash
# Build and push production image
docker build -f Dockerfile --target production \
  -t yourusername/backend:prod \
  -t yourusername/backend:latest \
  -t yourusername/backend:v1.0.0 \
  ../..
docker push yourusername/backend:prod
docker push yourusername/backend:latest
docker push yourusername/backend:v1.0.0
```

## Docker Hub Alternatives

If you prefer other registries:

### GitHub Container Registry (ghcr.io)

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
docker tag motorove-api-prod:latest ghcr.io/YOUR_USERNAME/backend:latest
docker push ghcr.io/YOUR_USERNAME/backend:latest
```

### AWS ECR

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag motorove-api-prod:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/backend:latest
```

### Google Container Registry (gcr.io)

```bash
gcloud auth configure-docker
docker tag motorove-api-prod:latest gcr.io/PROJECT_ID/backend:latest
docker push gcr.io/PROJECT_ID/backend:latest
```

## Additional Resources

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Docker Build Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-platform Builds](https://docs.docker.com/build/building/multi-platform/)
- [Docker Content Trust](https://docs.docker.com/engine/security/trust/)
- [GitHub Actions Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)

## Support

For issues with Docker Hub:

- [Docker Hub Status](https://www.dockerstatus.com/)
- [Docker Community Forums](https://forums.docker.com/)
- [Docker Hub Support](https://hub.docker.com/support/contact/)
