# Docker Setup Summary

## What Was Fixed

The Docker configuration has been updated to work properly with the pnpm workspace monorepo structure and optimized for use with Supabase. Here's what was changed:

### 1. **Dockerfile** - Monorepo Support

**Before:**

- Designed for a single-package structure
- Copied files from current directory only
- Didn't handle workspace dependencies

**After:**

- Multi-stage build optimized for pnpm workspaces
- Copies entire workspace structure (root, shared, backend)
- Builds `@motorove/shared` package first
- Properly installs workspace dependencies
- Separate stages for development, staging, and production

### 2. **docker-compose.yml** - Build Context & Docker Hub Integration

**Before:**

- Build context set to `.` (backend directory only)
- Referenced wrong environment files (`.env.development` vs `.env.dev`)
- Database URLs hard-coded
- Required local PostgreSQL container
- No Docker Hub configuration

**After:**

- Build context set to `../..` (monorepo root)
- Dockerfile path: `apps/backend/Dockerfile`
- **Docker Hub Integration**
- ✅ Shared `motorove/images` repository for all services
- ✅ Backend tags: `backend-dev`, `backend-staging`, `backend-prod`, `backend`
- ✅ Landing tags: `landing`, `landing-latest`
- ✅ Automatic image metadata and labels
- ✅ Multi-architecture builds (amd64/arm64)
- ✅ Consistent tagging strategy across projects:
  - Development: `.env.dev`
  - Staging: `.env.staging`
  - Production: `.env`
- Volume mounts for hot-reload in development
- Proper network configuration
- **No local PostgreSQL needed** (uses Supabase hosted database)
- Faster startup (no database healthcheck wait)
- PostgreSQL service commented out (optional if needed)

### 3. **.dockerignore** - Build Optimization

**New file created:**

- Excludes unnecessary files from build context
- Reduces build time and image size
- Prevents uploading sensitive files
- Ignores other monorepo apps (mobile, landing)

### 4. **Sample Environment Files**

**Created:**

- `.env.sample` - Production environment template (Supabase format)
- `.env.staging.sample` - Staging environment template (Supabase format)

**Updated:**

- DATABASE_URL format changed to Supabase connection string
- Added helpful comments about where to get Supabase credentials
- Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`

### 5. **Documentation & Tooling**

**Updated files:**

- `README-DOCKER.md` - Updated with Docker Hub integration
- `README-DOCKER-HUB.md` - Updated for shared `motorove/images` repository
- `DOCKER-SETUP-SUMMARY.md` - This file
- `docker-compose.yml` - Added Docker Hub image tags and metadata
- `Dockerfile` - Added Docker Hub labels and metadata

## Quick Start

### Step 1: Verify Supabase Configuration

Your `.env.dev` is already configured with Supabase! Just verify it has:

```bash
cd apps/backend

# Check your configuration
cat .env.dev

# Should contain:
# DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@...pooler.supabase.com:5432/postgres'
# SUPABASE_URL='https://[PROJECT-REF].supabase.co'
# SUPABASE_KEY='your-supabase-anon-key'
```

**Note:** Your existing `.env.dev` already has correct Supabase credentials! ✅

For staging/production, copy sample files:

```bash
# For staging (update with your staging Supabase project)
cp .env.staging.sample .env.staging

# For production (update with your production Supabase project)
cp .env.sample .env
```

### Step 2: Build and Start

Using the helper script (recommended):

```bash
# Build development image
./docker.sh build dev

# Start development environment (connects to Supabase automatically)
./docker.sh start dev

# Run migrations on Supabase database
./docker.sh migrate dev

# View logs
./docker.sh logs dev
```

**That's it!** The container connects to your Supabase database automatically. No local database needed.

Or using docker-compose directly:

```bash
# Start development environment
docker-compose up -d api-dev

# Run migrations
docker-compose exec api-dev pnpm prisma migrate deploy

# View logs
docker-compose logs -f api-dev
```

### Step 3: Access the Application

- **API**: http://localhost:3000/api
- **GraphQL**: http://localhost:3000/graphql
- **Swagger**: http://localhost:3000/api (if enabled)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Monorepo Root                            │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │   shared    │  │   backend   │  │   landing    │       │
│  │             │  │             │  │              │       │
│  └─────────────┘  └─────────────┘  └──────────────┘       │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                          ▼                                  │
│                 ┌─────────────────┐                        │
│                 │  Docker Build   │                        │
│                 │    Context      │                        │
│                 └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────┐
        │   Multi-Stage Docker Build       │
        │                                  │
        │  1. Base (Node + pnpm)          │
        │  2. Dependencies (install)       │
        │  3. Build shared package        │
        │  4. Build backend/landing       │
        │  5. Runtime (dev/staging/prod)  │
        └──────────────────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────┐
        │      Docker Hub Repository       │
        │      motorove/images            │
        │                                  │
        │  • backend:backend-dev          │
        │  • backend:backend-staging      │
        │  • backend:backend-prod         │
        │  • backend:backend              │
        │  • landing:landing              │
        │  • landing:landing-latest       │
        └──────────────────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────┐
        │      Docker Containers           │
        │                                  │
        │  ┌────────────┐ ┌─────────────┐  │
        │  │  Backend   │ │   Landing   │  │
        │  │  :3000     │ │   :8080     │  │
        │  └────────────┘ └─────────────┘  │
        │              │                   │
        │              ▼                   │
        │      motorove-network            │
        └──────────────────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────┐
        │   Supabase (External)            │
        │                                  │
        │  • PostgreSQL Database           │
        │  • Connection Pooler             │
        │  • Storage                       │
        │  • Authentication                │
        └──────────────────────────────────┘
```

## Key Improvements

### 1. **Monorepo Compatibility**

- ✅ Properly handles pnpm workspace dependencies
- ✅ Builds shared packages first
- ✅ Maintains workspace structure in containers
- ✅ Supports workspace protocol (`workspace:*`)

### 2. **Performance**

- ✅ Multi-stage builds reduce final image size
- ✅ Build cache optimization
- ✅ Production-only dependencies in prod builds
- ✅ Efficient .dockerignore configuration

### 3. **Developer Experience**

- ✅ Hot-reload support in development
- ✅ Helper script for common operations
- ✅ Comprehensive documentation
- ✅ Sample environment files

### 4. **Production Ready**

- ✅ Separate builds for dev/staging/prod
- ✅ Docker Hub integration with proper tagging
- ✅ Multi-architecture support (amd64/arm64)
- ✅ Health checks
- ✅ Restart policies
- ✅ Resource limits support
- ✅ Security best practices

### 5. **Supabase Integration**

- ✅ Optimized for Supabase hosted database
- ✅ No local PostgreSQL needed (lighter resource usage)
- ✅ Supabase Session pooler for better performance
- ✅ Easy migration running on Supabase
- ✅ Comprehensive Supabase documentation
- ✅ Optional local PostgreSQL available (just uncomment)

## Common Use Cases

### Development

```bash
# Start everything
./docker.sh start dev

# Make code changes (hot-reload works automatically)

# Run migrations
./docker.sh migrate dev

# Access shell
./docker.sh shell dev

# View logs
./docker.sh logs dev

# Stop when done
./docker.sh stop dev
```

### Staging Testing

```bash
# Build staging image
./docker.sh build staging

# Start staging environment
./docker.sh start staging

# Run migrations
./docker.sh migrate staging

# Test your changes
curl http://localhost:3001/api

# Stop when done
./docker.sh stop staging
```

### Production Deployment

```bash
# Build production image
docker-compose build api-prod

# Run migrations first (in a separate container)
docker-compose run --rm api-prod pnpm prisma migrate deploy

# Start production
docker-compose up -d api-prod

# Monitor
docker-compose logs -f api-prod
```

## Troubleshooting

### Problem: Container won't start

**Solution:**

```bash
# Check logs
docker-compose logs api-dev

# Verify environment file exists
ls -la .env.dev

# Check PostgreSQL health
docker-compose ps postgres
```

### Problem: "Cannot find module '@motorove/shared'"

**Solution:**

```bash
# Rebuild with no cache
docker-compose build --no-cache api-dev

# Verify shared package is built
docker-compose exec api-dev ls -la /app/shared/dist
```

### Problem: Port already in use

**Solution:**

```bash
# Change port in docker-compose.yml
ports:
  - '3010:3000'  # Use different host port

# Or kill the process using the port
lsof -ti:3000 | xargs kill -9
```

### Problem: Database connection failed

**Solution:**

```bash
# Verify DATABASE_URL in .env file (should be Supabase URL)
cat .env.dev | grep DATABASE_URL

# Check Supabase project status
# Visit https://app.supabase.com and ensure your project is active

# Test connection from container
docker-compose exec api-dev pnpm prisma db pull

# Check container logs for connection errors
docker-compose logs api-dev
```

**Common causes:**

- Supabase project paused (free tier) - wake it up by visiting dashboard
- Incorrect DATABASE_URL format
- Password contains special characters (needs URL encoding)
- Network/firewall issues

## Using Supabase

### Current Setup

Your project is configured to use **Supabase** as the database provider:

- ✅ No local PostgreSQL container needed
- ✅ Faster container startup
- ✅ Managed database with automatic backups
- ✅ Built-in connection pooling
- ✅ Additional features: Storage, Auth, Realtime

### Get Supabase Credentials

If you need to update your Supabase configuration:

1. **Go to [Supabase Dashboard](https://app.supabase.com)**

2. **Get DATABASE_URL:**

   - Settings → Database → Connection string
   - Select "Session pooler" mode (recommended)
   - Copy the connection string

3. **Get API Credentials:**

   - Settings → API
   - Copy Project URL
   - Copy anon/public key

4. **Update `.env.dev`:**
   ```bash
   DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'
   SUPABASE_URL='https://[PROJECT-REF].supabase.co'
   SUPABASE_KEY='your-supabase-anon-key'
   ```

**See [README-SUPABASE.md](./README-SUPABASE.md) for complete guide.**

### Optional: Use Local PostgreSQL

If you prefer a local database for development:

1. **Uncomment in `docker-compose.yml`:**

   - The `postgres` service
   - The `volumes: postgres_data` section
   - The `depends_on` in API services

2. **Update `.env.dev`:**

   ```bash
   DATABASE_URL='postgresql://postgres:postgres@postgres:5432/motorove?schema=public'
   ```

3. **Restart:**
   ```bash
   ./docker.sh restart dev
   ```

## Next Steps

1. ✅ Environment files configured (Supabase)
2. ✅ Docker configuration updated
3. ⏳ Build and start containers
4. ⏳ Run database migrations on Supabase
5. ⏳ Seed database (optional)
6. ⏳ Test API endpoints
7. ⏳ Set up CI/CD (optional)

**Ready to start?** Run:

```bash
./docker.sh build dev && ./docker.sh start dev && ./docker.sh migrate dev
```

## Additional Resources

### Docker & Setup

- [README.md](./README.md) - Main project documentation
- [README-DOCKER.md](./README-DOCKER.md) - Full Docker documentation
- [docker-compose.yml](./docker-compose.yml) - Service configuration
- [Dockerfile](./Dockerfile) - Build instructions
- [docker.sh](./docker.sh) - Helper script (`./docker.sh help`)

### Supabase

- [README-SUPABASE.md](./README-SUPABASE.md) - Complete Supabase guide
- [SUPABASE-CHANGES.md](./SUPABASE-CHANGES.md) - Supabase setup summary

### Configuration

- [README-ENVIRONMENTS.md](./README-ENVIRONMENTS.md) - Environment configuration guide
- [README-AUTH.md](./README-AUTH.md) - Authentication setup
- [CHANGES.md](./CHANGES.md) - Complete changelog

## Support

If you encounter issues:

1. Check the logs: `./docker.sh logs dev`
2. Review this document and README-DOCKER.md
3. Verify environment variables are set correctly
4. Check Docker and Docker Compose versions
5. For database issues: Check [README-SUPABASE.md](./README-SUPABASE.md)
6. Verify Supabase project is active: https://app.supabase.com

## Quick Reference

### Common Commands

```bash
# Start development
./docker.sh start dev

# Stop development
./docker.sh stop dev

# View logs
./docker.sh logs dev

# Run migrations
./docker.sh migrate dev

# Access shell
./docker.sh shell dev

# Rebuild image
./docker.sh build dev

# Show all commands
./docker.sh help
```

### Check Supabase Connection

```bash
# From within container
docker-compose exec api-dev pnpm prisma db pull
```

---

**Last Updated:** September 30, 2025  
**Docker Version:** 20.10+  
**Docker Compose Version:** 2.0+  
**pnpm Version:** 9.6.0  
**Database:** Supabase (PostgreSQL)
