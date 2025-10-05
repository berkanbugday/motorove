# Motorove Backend API

NestJS-based GraphQL API for the Motorove motorcycle community platform.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
cd apps/backend

# Build and start development environment
./docker.sh build dev
./docker.sh start dev

# Run database migrations
./docker.sh migrate dev

# View logs
./docker.sh logs dev
```

Access:

- **API**: http://localhost:3000/api
- **GraphQL**: http://localhost:3000/graphql

### Local Development (Without Docker)

```bash
cd apps/backend

# Install dependencies
pnpm install

# Run migrations
pnpm prisma migrate deploy

# Start development server
pnpm dev
```

## 📚 Documentation

### Docker Setup

- **[README-DOCKER.md](./README-DOCKER.md)** - Complete Docker guide
- **[DOCKER-SETUP-SUMMARY.md](./DOCKER-SETUP-SUMMARY.md)** - Quick reference
- **[CHANGES.md](./CHANGES.md)** - Detailed changelog
- **[docker.sh](./docker.sh)** - Helper script (`./docker.sh help`)

### Supabase Integration

- **[README-SUPABASE.md](./README-SUPABASE.md)** - Supabase-specific guide
- **[SUPABASE-CHANGES.md](./SUPABASE-CHANGES.md)** - Supabase setup summary

### Configuration

- **[README-ENVIRONMENTS.md](./README-ENVIRONMENTS.md)** - Environment configuration
- **[README-AUTH.md](./README-AUTH.md)** - Authentication setup

## 🗄️ Database

This project uses **Supabase** as the database provider:

- ✅ Hosted PostgreSQL database
- ✅ Built-in connection pooling
- ✅ Automatic backups
- ✅ Storage for file uploads
- ✅ Real-time subscriptions

See [README-SUPABASE.md](./README-SUPABASE.md) for detailed setup instructions.

### Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. **Database**: Settings → Database → Connection string (Session pooler)
3. **API**: Settings → API → Copy Project URL and anon key
4. Update your `.env.dev` file

## 🛠️ Available Scripts

### Development

```bash
pnpm dev              # Start development server
pnpm build            # Build production bundle
pnpm start:dev        # Start with watch mode
pnpm start:staging    # Start in staging mode
pnpm start:prod       # Start in production mode
```

### Database

```bash
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:seed      # Seed database
```

### Testing

```bash
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:cov         # Generate coverage report
pnpm test:e2e         # Run e2e tests
```

### Docker

```bash
./docker.sh start dev     # Start development
./docker.sh stop dev      # Stop development
./docker.sh build dev     # Build image
./docker.sh logs dev      # View logs
./docker.sh migrate dev   # Run migrations
./docker.sh shell dev     # Access container shell
./docker.sh help          # Show all commands
```

## 🏗️ Project Structure

```
apps/backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration files
│   └── seed.ts                # Seed data
├── src/
│   ├── auth/                  # Authentication module
│   ├── users/                 # User management
│   ├── posts/                 # Posts module
│   ├── groups/                # Groups module
│   ├── events/                # Events module
│   ├── core/                  # Core utilities & config
│   │   ├── config/            # Configuration service
│   │   ├── filters/           # Exception filters
│   │   └── interceptors/      # Interceptors
│   └── main.ts                # Application entry point
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Multi-stage Docker build
├── docker.sh                  # Docker helper script
└── README.md                  # This file
```

## 🔐 Environment Variables

Create a `.env.dev` file based on `.env.dev.sample`:

```bash
# Required
NODE_ENV=development
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
JWT_SECRET=your-secret-key
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_KEY=your-supabase-anon-key
FIREBASE_SERVICE_ACCOUNT={...}
WEATHER_API_KEY=your-google-cloud-weather-api-key
GEOCODING_API_KEY=your-google-maps-geocoding-api-key

# Optional
SENTRY_DSN=your-sentry-dsn
REDIS_HOST=localhost
REDIS_PORT=6379
```

See [README-ENVIRONMENTS.md](./README-ENVIRONMENTS.md) for complete list.

## ☁️ Google Cloud Weather API Setup

The application uses Google Cloud Weather API for weather data. You need to set up Google Cloud Platform and enable the required APIs.

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### 2. Enable Required APIs

Enable these APIs in your Google Cloud project:

```bash
# Using gcloud CLI
gcloud services enable weather.googleapis.com
gcloud services enable geocoding-backend.googleapis.com
```

Or enable them manually in the [Google Cloud Console](https://console.cloud.google.com/apis/library):
- **Weather API** - For current weather conditions
- **Geocoding API** - For converting city names to coordinates

### 3. Create API Key

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. **Recommended**: Restrict the API key to only the required APIs for security

### 4. Configure Environment Variables

Add your Google Cloud API keys to your environment files:

```bash
# .env.dev and .env.staging
WEATHER_API_KEY=your_google_cloud_weather_api_key_here
GEOCODING_API_KEY=your_google_maps_geocoding_api_key_here
```

### 5. API Usage & Pricing

- **Weather API**: $0.002 per request (first 100,000 requests/month free)
- **Geocoding API**: $0.005 per request (first $200 credit free)

The application implements caching to minimize API calls:
- Weather data: 3-hour cache
- Geocoding results: 24-hour cache

## 🏃 Running the Application

### Option 1: Docker (Recommended)

**Development:**

```bash
./docker.sh start dev
```

**Staging:**

```bash
./docker.sh start staging
```

**Production:**

```bash
./docker.sh start prod
```

### Option 2: Local

```bash
pnpm dev
```

## 📊 Database Migrations

### Create Migration

```bash
# Local
pnpm prisma migrate dev --name migration_name

# Docker
./docker.sh shell dev
pnpm prisma migrate dev --name migration_name
```

### Apply Migrations

```bash
# Local
pnpm prisma migrate deploy

# Docker
./docker.sh migrate dev
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 🚢 Deployment

### Docker Production Build

```bash
# Build production image
docker-compose build api-prod

# Run migrations
docker-compose run --rm api-prod pnpm prisma migrate deploy

# Start production
docker-compose up -d api-prod
```

See [README-DOCKER.md](./README-DOCKER.md) for detailed deployment instructions.

## 🔧 Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 6
- **API**: GraphQL (Apollo Server)
- **Auth**: JWT, Firebase Admin
- **Storage**: Supabase Storage
- **Queue**: BullMQ + Redis
- **Validation**: class-validator
- **Documentation**: GraphQL Playground

## 📦 Monorepo Structure

This backend is part of a pnpm workspace monorepo:

```
motorove/
├── apps/
│   ├── backend/          # This project
│   ├── mobile/           # React Native app
│   └── landing/          # Next.js landing page
└── shared/               # Shared types & interfaces
```

The Docker setup is optimized for this monorepo structure.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting: `pnpm lint`
5. Submit a pull request

## 📄 License

UNLICENSED

## 🆘 Support

For issues and questions:

1. Check the documentation in this directory
2. Review [troubleshooting guides](./README-DOCKER.md#troubleshooting)
3. Check application logs: `./docker.sh logs dev`
4. Review Supabase dashboard for database issues

---

**Made with ❤️ for the motorcycle community**
