# Motorove Landing Page - Docker Hub Deployment Guide

This guide explains how to build and push the Motorove landing page Docker images to Docker Hub with multi-architecture support.

## Prerequisites

- Docker installed and running
- Docker Hub account
- Docker Buildx (comes with Docker Desktop)

## Quick Start

### 1. Login to Docker Hub

```bash
docker login
```

### 2. Set Your Docker Hub Username

```bash
export DOCKER_HUB_USERNAME=yourusername
```

### 3. Build and Push Multi-Architecture Image

```bash
# Push with default tags (latest)
./docker.sh push

# Push with custom version tag
./docker.sh push --tag v1.0.0

# Push with multiple tags
./docker.sh push --tag v1.0.0 --tag stable
```

## Multi-Architecture Support

By default, the push command builds for both:
- **linux/amd64** - For Railway, AWS, Google Cloud, most servers
- **linux/arm64** - For Mac M1/M2, ARM servers

This ensures your image works on all platforms without separate builds.

## Push Command Options

```bash
./docker.sh push [options]
```

### Available Options

| Option | Description | Example |
|--------|-------------|---------|
| `--tag, -t` | Additional tag for the image | `--tag v1.0.0` |
| `--username, -u` | Docker Hub username | `--username myuser` |
| `--image, -i` | Image name | `--image landing-page` |
| `--platform, -p` | Target platforms | `--platform linux/amd64` |
| `--no-buildx` | Use standard build (single arch) | `--no-buildx` |
| `--no-cache` | Build without cache | `--no-cache` |

## Common Use Cases

### Push Production Release

```bash
# Push with version tag and latest
./docker.sh push --tag v1.0.0 --tag latest
```

### Push to Custom Repository

```bash
# Use custom username and image name
./docker.sh push --username mycompany --image motorove-landing --tag v1.0.0
```

### Build for Specific Platform

```bash
# Build only for amd64 (Railway, AWS)
./docker.sh push --platform linux/amd64 --tag v1.0.0

# Build only for arm64 (Mac M1/M2)
./docker.sh push --platform linux/arm64 --tag v1.0.0
```

### Clean Rebuild

```bash
# Force rebuild without using cache
./docker.sh push --tag v1.0.0 --no-cache
```

## Automatic Git SHA Tagging

The script automatically adds a git commit SHA tag to your images:

```bash
./docker.sh push --tag v1.0.0
```

This creates three tags:
- `motorove/landing:v1.0.0`
- `motorove/landing:latest`
- `motorove/landing:sha-abc1234` (git commit)

## Pulling Images

### Pull Latest Image

```bash
./docker.sh pull
```

### Pull Specific Version

```bash
./docker.sh pull v1.0.0
```

### Pull with Custom Settings

```bash
export DOCKER_HUB_USERNAME=myusername
./docker.sh pull v1.0.0
```

## Deployment Examples

### Deploy on Railway

1. Push your image:
```bash
./docker.sh push --tag v1.0.0
```

2. In Railway, set the Docker image:
```
motorove/landing:v1.0.0
```

### Deploy with Docker Compose

```yaml
version: '3.8'

services:
  landing:
    image: motorove/landing:latest
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    restart: unless-stopped
```

### Deploy with Docker Run

```bash
docker run -d \
  --name motorove-landing \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  motorove/landing:latest
```

## Environment Variables

Set these in your shell or `.bashrc`/`.zshrc`:

```bash
# Required for push/pull commands
export DOCKER_HUB_USERNAME=yourusername

# Optional: Custom image name
export DOCKER_HUB_IMAGE_NAME=landing
```

## Troubleshooting

### Not Logged In

If you see "Not logged in to Docker Hub":
```bash
docker login
```

### Buildx Not Available

If buildx is not available:
```bash
# Use legacy build method
./docker.sh push --no-buildx --tag v1.0.0
```

### Build Fails

Try a clean rebuild:
```bash
./docker.sh push --no-cache --tag v1.0.0
```

### Permission Denied

Make sure the script is executable:
```bash
chmod +x docker.sh
```

## Docker Hub Repository

Your images will be available at:
```
https://hub.docker.com/r/yourusername/landing
```

## Image Tags

The script creates the following tags:
- `latest` - Latest production build
- `v1.0.0` - Specific version (if specified)
- `sha-abc1234` - Git commit SHA (automatic)

## Best Practices

1. **Use Version Tags**: Always tag releases with version numbers
   ```bash
   ./docker.sh push --tag v1.0.0
   ```

2. **Keep Latest Updated**: Update latest tag with stable releases
   ```bash
   ./docker.sh push --tag v1.0.0 --tag latest
   ```

3. **Multi-Architecture**: Use default buildx for maximum compatibility
   ```bash
   ./docker.sh push --tag v1.0.0
   ```

4. **Git SHA Tags**: Use automatic git SHA tags for traceability
   - Automatically added by the script
   - Helps track which commit was deployed

5. **Clean Rebuilds**: Use `--no-cache` for production releases
   ```bash
   ./docker.sh push --tag v1.0.0 --no-cache
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}
      
      - name: Build and Push
        run: |
          cd apps/landing
          export DOCKER_HUB_USERNAME=${{ secrets.DOCKER_HUB_USERNAME }}
          ./docker.sh push --tag ${GITHUB_REF#refs/tags/}
```

## Support

For issues or questions:
- Check the main README.md
- Review Docker logs: `./docker.sh logs`
- Check container status: `./docker.sh status`

## Additional Commands

```bash
# View all available commands
./docker.sh help

# Check container status
./docker.sh status

# View logs
./docker.sh logs

# Open shell in container
./docker.sh shell

# Clean up resources
./docker.sh clean
```
