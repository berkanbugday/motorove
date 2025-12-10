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

# Generate Prisma client
pnpm prisma:generate:dev

# Run migrations
pnpm prisma:migrate:dev

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
- ✅ 30-day authentication sessions

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
pnpm prisma:generate:dev      # Generate Prisma client (dev)
pnpm prisma:migrate:dev       # Run migrations (dev)
pnpm prisma:studio:dev        # Open Prisma Studio (dev)
pnpm prisma:seed:dev          # Seed database (dev)
pnpm prisma:migrate:reset:dev # Reset database (dev)
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
│   ├── auth/                  # Authentication (Supabase + Firebase)
│   ├── users/                 # User management
│   ├── posts/                 # Posts & media sharing
│   ├── post-comments/         # Post comments
│   ├── groups/                # Riding groups
│   ├── group-memberships/     # Group membership management
│   ├── events/                # Events & group rides
│   ├── businesses/            # Motorcycle businesses
│   ├── business-comments/     # Business reviews
│   ├── warnings/              # Road hazard warnings
│   ├── emergencies/           # Emergency reports
│   ├── notifications/         # Push notifications
│   ├── user-followings/       # Social following system
│   ├── user-blocks/           # User blocking
│   ├── user-settings/         # User preferences
│   ├── user-locations/        # Location tracking
│   ├── cities/                # City data
│   ├── content-reports/       # Content moderation
│   ├── supports/              # Support tickets
│   ├── core/                  # Core utilities
│   │   ├── cache/             # Redis caching
│   │   ├── config/            # Configuration service
│   │   ├── exceptions/        # Custom exceptions
│   │   ├── filters/           # Exception filters
│   │   ├── i18n/              # Internationalization (EN/TR)
│   │   ├── image-censor-filter/ # NSFW detection
│   │   ├── interceptors/      # Request interceptors
│   │   ├── profanity-filter/  # Content filtering
│   │   ├── queue/             # BullMQ job processing
│   │   ├── schedule-job/      # Scheduled tasks
│   │   ├── sentry/            # Error tracking
│   │   ├── storage/           # Supabase storage
│   │   └── weather/           # Google Cloud Weather API
│   ├── enums/                 # GraphQL enums
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
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
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

| Category       | Technology                         |
| -------------- | ---------------------------------- |
| **Framework**  | NestJS 11                          |
| **Database**   | PostgreSQL (Supabase)              |
| **ORM**        | Prisma 6                           |
| **API**        | GraphQL (Apollo Server)            |
| **Auth**       | Supabase Auth, Firebase Admin      |
| **Storage**    | Supabase Storage                   |
| **Queue**      | BullMQ + Redis                     |
| **Cache**      | Redis                              |
| **Weather**    | Google Cloud Weather API           |
| **Monitoring** | Sentry                             |
| **Validation** | class-validator, class-transformer |
| **i18n**       | i18next (EN, TR)                   |

## 📡 API Modules

### Core Features

| Module                | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| **Auth**              | Supabase authentication with 30-day sessions, Firebase push tokens |
| **Users**             | User profiles, preferences, motorcycle info                        |
| **Posts**             | Social posts with media, likes, NSFW detection                     |
| **Post Comments**     | Nested comments on posts                                           |
| **Groups**            | Riding groups with privacy settings                                |
| **Group Memberships** | Join requests, member roles, invitations                           |
| **Events**            | Group rides, meetups, event invitations                            |

### Location & Safety

| Module                | Description                                     |
| --------------------- | ----------------------------------------------- |
| **Businesses**        | Motorcycle shops, repair services, dealerships  |
| **Business Comments** | Reviews and ratings                             |
| **Warnings**          | Road hazard reports with nearby notifications   |
| **Emergencies**       | Emergency alerts with 20km radius notifications |
| **User Locations**    | Real-time location tracking                     |
| **Cities**            | City data for location filtering                |
| **Weather**           | Google Cloud Weather API integration            |

### Social & Moderation

| Module              | Description                          |
| ------------------- | ------------------------------------ |
| **User Followings** | Follow system with approval workflow |
| **User Blocks**     | User blocking functionality          |
| **Notifications**   | Push notifications via Firebase      |
| **Content Reports** | Report inappropriate content         |
| **Supports**        | Support ticket system                |

### Core Services

| Service              | Description                               |
| -------------------- | ----------------------------------------- |
| **Cache**            | Redis-based caching with TTL              |
| **Queue**            | BullMQ job processing for notifications   |
| **I18n**             | Multi-language support (English, Turkish) |
| **Profanity Filter** | Content filtering with Turkish support    |
| **Image Censor**     | NSFW detection using Google Cloud Vision  |
| **Storage**          | Supabase storage for media files          |
| **Sentry**           | Error tracking and monitoring             |

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
