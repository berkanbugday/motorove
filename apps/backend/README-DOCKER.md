# Docker Setup Guide

This guide explains how to run the Motorove backend API using Docker and Docker Compose in a pnpm workspace monorepo with Supabase as the database provider.

## Prerequisites

- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- pnpm 9.6.0 or higher (for local development)
- Supabase account and project ([sign up free](https://app.supabase.com))

**Note:** This setup uses Supabase for the database. No local PostgreSQL is required.

## Quick Start

### 1. Set Up Supabase

First, get your Supabase credentials:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. **Database Connection**: Settings → Database → Connection string (Session pooler)
3. **API Credentials**: Settings → API → Copy Project URL and anon key

See [README-SUPABASE.md](./README-SUPABASE.md) for detailed instructions.

### 2. Set Up Environment Files

Your `.env.dev` should already be configured with Supabase. Verify it has:

```bash
DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'
SUPABASE_URL='https://[PROJECT-REF].supabase.co'
SUPABASE_KEY='your-supabase-anon-key'
```

For staging/production, copy and edit sample files:

```bash
# Staging environment
cp .env.staging.sample .env.staging
# Edit .env.staging with your staging Supabase credentials

# Production environment
cp .env.sample .env
# Edit .env with your production Supabase credentials
```

**Important**: Make sure to fill in all required values, especially:

- `DATABASE_URL` (Supabase connection string with Session pooler)
- `SUPABASE_URL` and `SUPABASE_KEY`
- `FIREBASE_SERVICE_ACCOUNT`
- `WEATHER_API_KEY` (Google Cloud Weather API key)
- `GEOCODING_API_KEY` (Google Maps Geocoding API key)

### 3. Run with Docker Compose

**Note:** No local PostgreSQL is started. The API connects directly to your Supabase database.

#### Development Environment

```bash
# Start API in development mode (connects to Supabase)
docker-compose up api-dev

# Or run in detached mode
docker-compose up -d api-dev

# View logs
docker-compose logs -f api-dev
```

#### Staging Environment

```bash
# Start API in staging mode (connects to your staging Supabase project)
docker-compose up api-staging

# Or run in detached mode
docker-compose up -d api-staging
```

#### Production Environment

```bash
# Start API in production mode (connects to your production Supabase project)
docker-compose up api-prod

# Or run in detached mode
docker-compose up -d api-prod
```

### 4. Run Database Migrations

After starting the containers, run migrations on your Supabase database:

```bash
# For development
docker-compose exec api-dev pnpm prisma migrate deploy

# For staging
docker-compose exec api-staging pnpm prisma migrate deploy

# For production
docker-compose exec api-prod pnpm prisma migrate deploy
```

**Note:** Migrations are applied to your Supabase database, not a local database.

### 5. Access the Application

- **Development API**: http://localhost:3000/api
- **Development GraphQL**: http://localhost:3000/graphql

- **Staging API**: http://localhost:3001/api
- **Production API**: http://localhost:3002/api

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build optimized for pnpm workspaces:

1. **base**: Sets up Node.js and pnpm
2. **dependencies**: Installs all dependencies and builds the `@motorove/shared` package
3. **development**: Development build with hot-reload support
4. **staging**: Staging build
5. **production-deps**: Production dependencies only
6. **production**: Optimized production build

### Monorepo Support

The Docker setup is designed to work with pnpm workspaces:

- Build context is set to the monorepo root (`../..`)
- The `@motorove/shared` package is built first and made available to the backend
- Workspace structure is preserved in the container
- pnpm's workspace protocol is fully supported

### Database Architecture

The application uses **Supabase** as the database provider:

- No local PostgreSQL container required
- Connects to Supabase's hosted PostgreSQL database
- Uses Supabase Session pooler for better performance
- Built-in connection pooling and management
- Additional features: Storage, Auth, Realtime

**Optional**: You can uncomment the PostgreSQL service in `docker-compose.yml` if you prefer a local database for development.

## Available Commands

### Building Images

```bash
# Build development image
docker-compose build api-dev

# Build staging image
docker-compose build api-staging

# Build production image
docker-compose build api-prod

# Build all images
docker-compose build
```

### Managing Containers

```bash
# Start containers
docker-compose up [api-dev|api-staging|api-prod]

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart containers
docker-compose restart [api-dev|api-staging|api-prod]

# View container status
docker-compose ps

# View logs
docker-compose logs -f [api-dev|api-staging|api-prod]
```

### Database Operations (Supabase)

All database operations are performed on your Supabase database:

```bash
# Run Prisma Studio (connects to Supabase)
docker-compose exec api-dev pnpm prisma studio

# Generate Prisma Client
docker-compose exec api-dev pnpm prisma generate

# Create migration
docker-compose exec api-dev pnpm prisma migrate dev --name migration_name

# Apply migrations to Supabase
docker-compose exec api-dev pnpm prisma migrate deploy

# Reset Supabase database (development only - use with caution!)
docker-compose exec api-dev pnpm prisma migrate reset

# Seed Supabase database
docker-compose exec api-dev pnpm prisma:seed

# Test Supabase connection
docker-compose exec api-dev pnpm prisma db pull
```

**Note:** All operations connect to your Supabase database via the `DATABASE_URL` in your `.env` file.

### Shell Access

```bash
# Access container shell
docker-compose exec api-dev sh

# Run commands in container
docker-compose exec api-dev pnpm run <command>
```

## Environment Configuration

### Environment Files Priority

Each environment uses specific `.env` files in this order:

- **Development**: `.env.dev`
- **Staging**: `.env.staging`
- **Production**: `.env`

### Required Environment Variables

| Variable                 | Description                                              | Required |
| ------------------------ | -------------------------------------------------------- | -------- |
| NODE_ENV                 | Application environment                                  | Yes      |
| DATABASE_URL             | Supabase PostgreSQL connection (use Session pooler)      | Yes      |
| SUPABASE_URL             | Supabase project URL (https://[PROJECT-REF].supabase.co) | Yes      |
| SUPABASE_KEY             | Supabase anon/public key                                 | Yes      |
| FIREBASE_SERVICE_ACCOUNT | Firebase service account JSON                            | Yes      |
| WEATHER_API_KEY          | Google Cloud Weather API key                             | Yes      |
| GEOCODING_API_KEY        | Google Maps Geocoding API key                            | Yes      |

**DATABASE_URL Format:**

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

See `.env.sample` files for complete list of variables and [README-SUPABASE.md](./README-SUPABASE.md) for Supabase setup.

## Volumes

### Data Persistence

**Note:** Since we're using Supabase, no local database volumes are needed. Your data is stored in Supabase's cloud infrastructure.

The `postgres_data` volume in `docker-compose.yml` is commented out. Uncomment it only if you choose to use a local PostgreSQL database instead of Supabase.

### Development Volumes

In development mode, source code is mounted as volumes for hot-reload:

```yaml
volumes:
  - ../../shared:/app/shared # Shared package
  - .:/app/apps/backend # Backend source
  - /app/apps/backend/node_modules # Prevent overwriting node_modules
  - /app/node_modules # Prevent overwriting root node_modules
```

## Networking

All services run on the `motorove-network` bridge network. The API containers can communicate with each other and connect to external services:

- Development API: `api-dev:3000`
- Staging API: `api-staging:3000`
- Production API: `api-prod:3000`
- Database: External Supabase (via internet connection)

**Note:** No local database service. The API connects to Supabase over the internet using the `DATABASE_URL` from your `.env` files.

## Troubleshooting

### Container Won't Start

1. **Check logs**:

   ```bash
   docker-compose logs api-dev
   ```

2. **Verify environment files exist**:

   ```bash
   ls -la .env*
   ```

3. **Check Supabase connection**:
   ```bash
   docker-compose exec api-dev pnpm prisma db pull
   ```

### Database Connection Issues (Supabase)

1. **Verify DATABASE_URL** in your `.env` file (should be Supabase connection string)

   ```bash
   cat .env.dev | grep DATABASE_URL
   ```

2. **Check Supabase project status**:

   - Visit https://app.supabase.com
   - Ensure your project is active (not paused)
   - Free tier projects pause after inactivity - wake them up by visiting dashboard

3. **Test connection from container**:

   ```bash
   docker-compose exec api-dev pnpm prisma db pull
   ```

4. **Common causes**:
   - Supabase project paused (free tier)
   - Incorrect DATABASE_URL format
   - Password contains special characters (needs URL encoding)
   - Network/firewall issues
   - Invalid Supabase credentials

See [README-SUPABASE.md](./README-SUPABASE.md) for detailed Supabase troubleshooting.

### Shared Package Not Found

If you get errors about `@motorove/shared`:

1. **Rebuild the image**:

   ```bash
   docker-compose build --no-cache api-dev
   ```

2. **Verify shared package is built**:
   ```bash
   docker-compose exec api-dev ls -la /app/shared/dist
   ```

### Port Already in Use

If you get "port already in use" errors:

1. **Change ports in docker-compose.yml**:

   ```yaml
   ports:
     - '3010:3000' # Use a different host port
   ```

2. **Or stop the conflicting service**:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

### Out of Memory

If builds fail with out of memory errors:

1. **Increase Docker memory limit** in Docker Desktop settings
2. **Use a smaller image** or optimize dependencies
3. **Clear Docker cache**:
   ```bash
   docker system prune -a
   ```

## Performance Optimization

### Build Cache

The Dockerfile is optimized to use Docker's build cache:

- Dependencies are installed before copying source code
- The `@motorove/shared` package is built once in a separate layer
- pnpm's `--frozen-lockfile` ensures deterministic builds

### .dockerignore

A comprehensive `.dockerignore` file excludes unnecessary files from the build context:

- `node_modules` (will be installed in container)
- `dist` and build outputs (will be built in container)
- Development files and documentation
- Other monorepo apps not needed for backend

### Multi-Stage Builds

Production images use multi-stage builds to:

- Install only production dependencies
- Remove source files after building
- Minimize final image size

## Production Deployment

### Best Practices

1. **Use production-optimized images**:

   ```bash
   docker-compose build api-prod
   ```

2. **Run migrations separately**:

   ```bash
   docker-compose run --rm api-prod pnpm prisma migrate deploy
   ```

3. **Verify Supabase connection**:
   Ensure your Supabase project is active and `DATABASE_URL` is correctly configured in your `.env` file.

4. **Set resource limits**:
   Add resource limits in docker-compose.yml for production:

   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 2G
   ```

5. **Use secrets management**:

   - Don't commit `.env` files
   - Use Docker secrets or environment variable injection
   - Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)

6. **Monitor logs**:
   - Use a log aggregation service (ELK, Datadog, CloudWatch, etc.)
   - Set appropriate LOG_LEVEL in production (warn or error)

### Security Considerations

1. **Non-root user**: Consider adding a non-root user in the Dockerfile
2. **Scan images**: Use `docker scan` to check for vulnerabilities
3. **Update base images**: Regularly update the Node.js base image
4. **Secrets**: Never hardcode secrets in the Dockerfile
5. **Network isolation**: Use Docker networks to isolate services

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker-compose build api-prod

      - name: Run migrations
        run: docker-compose run --rm api-prod pnpm prisma migrate deploy

      - name: Push to registry
        run: |
          docker tag motorove-api-prod registry.example.com/motorove-api:latest
          docker push registry.example.com/motorove-api:latest
```

## Pushing to Docker Hub

To share your Docker images or deploy to production via Docker Hub, see:

- **Quick Start**: [DOCKER-HUB-QUICKSTART.md](./DOCKER-HUB-QUICKSTART.md) - Get started in 5 minutes
- **Full Guide**: [README-DOCKER-HUB.md](./README-DOCKER-HUB.md) - Complete documentation

Quick example:

```bash
# Set your Docker Hub username
export DOCKER_HUB_USERNAME=yourusername

# Login to Docker Hub
docker login

# Build and push production image
./docker.sh push prod --tag v1.0.0 --tag latest

```

## Additional Resources

- [Docker Hub Guide](./README-DOCKER-HUB.md) - Push images to Docker Hub
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [NestJS Docker Deployment](https://docs.nestjs.com/recipes/docker)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

## Support

For issues related to Docker setup, please check:

1. This documentation
2. [Docker Hub Guide](./README-DOCKER-HUB.md) - For Docker Hub specific issues
3. [Project README](./README.md)
4. [Environment Configuration Guide](./README-ENVIRONMENTS.md)
5. Project issue tracker
