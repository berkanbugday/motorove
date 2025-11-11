# Motorove Landing Page

Modern landing page for the Motorove motorcycle community app.

## Getting Started

These instructions will help you set up and run the project on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18+ recommended)
- pnpm

### Installation

1. Clone the repository
2. Navigate to the landing page directory:

```bash
cd apps/landing
```

3. Install dependencies:

```bash
pnpm install
```

4. Start the development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
apps/landing/
├── public/              # Static files (images, fonts, etc.)
├── src/                 # Source files
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
└── ...
```

## Design

The landing page is designed to match the mobile app's aesthetics and branding, featuring:

- Modern, clean UI with ample whitespace
- Primary color: #FF3B30 (Motorove's signature red)
- Animations and transitions for enhanced user experience
- Fully responsive design for all screen sizes
- Sections highlighting key app features: community, routes, events

## Build

To build the project for production:

```bash
pnpm build
```

## Docker Deployment

### Quick Start with Docker

```bash
# Build and start the container
./docker.sh build
./docker.sh start

# View logs
./docker.sh logs

# Stop the container
./docker.sh stop
```

The landing page will be available at [http://localhost:8080](http://localhost:8080).

### Docker Hub Push (Multi-Architecture)

Build and push to Docker Hub with support for both amd64 and arm64:

```bash
# Set your Docker Hub username
export DOCKER_HUB_USERNAME=yourusername

# Login to Docker Hub
docker login

# Push with version tag
./docker.sh push --tag v1.0.0

# Push with multiple tags
./docker.sh push --tag v1.0.0 --tag latest
```

### Available Docker Commands

```bash
./docker.sh start           # Start container
./docker.sh stop            # Stop container
./docker.sh restart         # Restart container
./docker.sh build           # Build Docker image
./docker.sh logs            # View container logs
./docker.sh shell           # Open shell in container
./docker.sh push            # Build and push to Docker Hub
./docker.sh pull [tag]      # Pull image from Docker Hub
./docker.sh status          # Show container status
./docker.sh clean           # Clean up Docker resources
./docker.sh help            # Show all commands
```

For detailed Docker Hub deployment instructions, see [README-DOCKER-HUB.md](./README-DOCKER-HUB.md).

## Traditional Deployment

This project is also configured for easy deployment to platforms like Vercel or Netlify.

## Built With

- Next.js - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Framer Motion - Animations
