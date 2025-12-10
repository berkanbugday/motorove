# Motorove Landing Page

Modern, dark-themed landing page for the Motorove motorcycle community app.

## 🏍️ Features

- **Dark Theme**: Modern dark design with glass-effect components
- **Multi-language**: English and Turkish support with i18next
- **Animations**: Smooth animations with Framer Motion
- **Responsive**: Fully responsive design for all screen sizes
- **App Promotion**: Download links for iOS and Android

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.6.0

### Installation

```bash
# From monorepo root
pnpm install

# Navigate to landing page
cd apps/landing

# Start development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🛠️ Available Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Build for production     |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

## 🏗️ Project Structure

```
apps/landing/
├── public/              # Static files (images, fonts)
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── [lng]/       # Language-specific routes
│   │   └── i18n/        # i18n configuration
│   ├── components/      # React components
│   │   ├── Header.tsx   # Navigation header
│   │   ├── Hero.tsx     # Hero section
│   │   ├── Features.tsx # Features showcase
│   │   ├── Map.tsx      # Map preview
│   │   ├── FinalCTA.tsx # Call-to-action
│   │   └── Footer.tsx   # Footer
│   ├── styles/          # Global styles
│   └── middleware.ts    # Language detection
├── Dockerfile           # Docker configuration
├── docker.sh            # Docker helper script
└── package.json
```

## 🎨 Design System

| Element           | Value                                |
| ----------------- | ------------------------------------ |
| **Primary Color** | #FF3B30 (Motorove Red)               |
| **Background**    | Dark gradient (dark-900 to dark-800) |
| **Text**          | White with opacity variations        |
| **Effects**       | Glass morphism, backdrop blur        |
| **Animations**    | Floating, fade-in, staggered reveals |

## 🔧 Tech Stack

| Category       | Technology              |
| -------------- | ----------------------- |
| **Framework**  | Next.js 14 (App Router) |
| **Language**   | TypeScript              |
| **Styling**    | Tailwind CSS            |
| **Animations** | Framer Motion           |
| **i18n**       | i18next, react-i18next  |
| **Forms**      | React Hook Form, Zod    |

## 🌐 Internationalization

Supported languages:

- **English** (en) - Default
- **Turkish** (tr)

Language detection via:

1. URL path (`/en`, `/tr`)
2. Browser language preference
3. Cookie storage

## 🐳 Docker Deployment

### Quick Start

```bash
# Build and start
./docker.sh build
./docker.sh start

# View logs
./docker.sh logs

# Stop
./docker.sh stop
```

Access at [http://localhost:8080](http://localhost:8080).

### Docker Commands

| Command               | Description         |
| --------------------- | ------------------- |
| `./docker.sh start`   | Start container     |
| `./docker.sh stop`    | Stop container      |
| `./docker.sh restart` | Restart container   |
| `./docker.sh build`   | Build Docker image  |
| `./docker.sh logs`    | View container logs |
| `./docker.sh push`    | Push to Docker Hub  |
| `./docker.sh help`    | Show all commands   |

### Docker Hub Push

```bash
export DOCKER_HUB_USERNAME=yourusername
docker login
./docker.sh push --tag v1.0.0
```

See [README-DOCKER-HUB.md](./README-DOCKER-HUB.md) for detailed instructions.

## ☁️ Cloud Deployment

### Vercel

```bash
vercel deploy
```

### Netlify

```bash
netlify deploy --prod
```

## 📦 Monorepo Integration

This landing page is part of the Motorove monorepo:

```
motorove/
├── apps/
│   ├── backend/          # NestJS GraphQL API
│   ├── mobile/           # React Native app
│   └── landing/          # This project
└── shared/               # Shared types & interfaces
```

The landing page imports shared types from `@motorove/shared`.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `pnpm lint`
4. Submit a pull request

## 📄 License

UNLICENSED - Private repository

---

**Made with ❤️ for the motorcycle community**
