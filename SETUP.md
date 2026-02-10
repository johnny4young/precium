# Precium Development Setup Guide

This guide will help you set up the Precium development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 24+** and **npm 10+**: [Download Node.js](https://nodejs.org/)
- **Go 1.23+**: [Download Go](https://golang.org/dl/)
- **Docker** and **Docker Compose**: [Download Docker](https://www.docker.com/products/docker-desktop)
- **Git**: [Download Git](https://git-scm.com/downloads)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/johnny4young/precium.git
cd precium
```

### 2. Install Dependencies

Install all npm dependencies for the monorepo:

```bash
npm install
```

This will install dependencies for:

- Root workspace (linting, formatting tools)
- Web application (`apps/web`)
- Shared packages (`packages/*`)

### 3. Backend Setup

Navigate to the backend directory and set up environment variables:

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` file if needed, then install Go dependencies:

```bash
go mod download
```

### 4. Database Setup

Start PostgreSQL and Redis using Docker Compose:

```bash
cd ../.. # Back to root
docker-compose up -d postgres redis
```

Wait for services to be healthy:

```bash
docker-compose ps
```

### 5. Run Database Migrations

Install golang-migrate if you haven't already:

```bash
# macOS
brew install golang-migrate

# Linux
curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz | tar xvz
sudo mv migrate /usr/local/bin/

# Windows
# Download from https://github.com/golang-migrate/migrate/releases
```

**Important**: Before running migrations, ensure PostgreSQL is running and the database exists:

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check if database exists
docker exec precium-postgres psql -U precium -d precium_dev -c "SELECT 1"
```

If the database doesn't exist, create it:

```bash
# If using Docker Compose, restart to create the database
docker-compose down
docker-compose up -d postgres

# Or create manually
docker exec precium-postgres psql -U precium -c "CREATE DATABASE precium_dev"
```

Run migrations:

```bash
cd apps/backend
# Make sure you're using the correct database name from your .env file
migrate -path db/migrations -database "postgresql://precium:precium_dev@localhost:5432/precium_dev?sslmode=disable" up
```

**Note**: Replace `precium_dev` with your actual password and database name if you changed them in `.env`.

## Running the Application

### Option 1: Using Docker Compose (Recommended)

Start all services:

```bash
docker-compose up
```

This starts:

- PostgreSQL (localhost:5432)
- Redis (localhost:6379)
- Backend API (localhost:3001)
- Web frontend (localhost:3000)

### Option 2: Running Services Individually

#### Start Backend

```bash
cd apps/backend
go run cmd/server/main.go
```

Backend will be available at: http://localhost:3001

#### Start Web Frontend

In a new terminal:

```bash
cd apps/web
npm run dev
```

Web app will be available at: http://localhost:3000

## Verify Installation

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# API documentation
curl http://localhost:3001/api/v1/docs
```

Expected response:

```json
{
  "status": "healthy",
  "service": "precium-api",
  "version": "1.0.0"
}
```

### Test Web Frontend

Open your browser and navigate to: http://localhost:3000

You should see the Precium welcome page.

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
cd apps/backend
go test ./...

# Run frontend tests
npm run test --workspace=apps/web
```

### Linting and Formatting

```bash
# Check code formatting
npm run format:check

# Format all code
npm run format

# Run linters
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### Building for Production

```bash
# Build all workspaces
npm run build

# Build backend only
cd apps/backend
go build -o bin/server cmd/server/main.go

# Build web only
npm run build --workspace=apps/web
```

## Common Commands

| Command               | Description           |
| --------------------- | --------------------- |
| `npm run dev`         | Start all dev servers |
| `npm run build`       | Build all workspaces  |
| `npm test`            | Run all tests         |
| `npm run lint`        | Lint all code         |
| `npm run format`      | Format all code       |
| `npm run type-check`  | Type check TypeScript |
| `docker-compose up`   | Start all services    |
| `docker-compose down` | Stop all services     |

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find process using port 3001 (backend)
lsof -i :3001

# Find process using port 3000 (frontend)
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

1. Ensure PostgreSQL is running:

   ```bash
   docker-compose ps postgres
   ```

2. Check logs:

   ```bash
   docker-compose logs postgres
   ```

3. Restart the service:

   ```bash
   docker-compose restart postgres
   ```

### Database Migration Errors

**Error: `database "precium" does not exist`**

This error occurs when the database name in your migration command doesn't match the actual database. To fix:

1. Check your `.env` file for the correct database name:

   ```bash
   cat .env | grep POSTGRES_DB
   ```

2. Verify the database exists in PostgreSQL:

   ```bash
   docker exec precium-postgres psql -U precium -l
   ```

3. If the database doesn't exist, create it:

   ```bash
   # Stop and recreate containers (this will create the database)
   docker-compose down
   docker-compose up -d postgres

   # Or create manually
   docker exec precium-postgres psql -U precium -c "CREATE DATABASE precium_dev"
   ```

4. Run migrations with the correct database name:

   ```bash
   cd apps/backend
   # Use the database name from your .env file (default: precium_dev)
   migrate -path db/migrations -database "postgresql://precium:precium_dev@localhost:5432/precium_dev?sslmode=disable" up
   ```

**Common causes:**

- `.env` file not created from `.env.example`
- Database name mismatch between `.env` and migration command
- PostgreSQL container not initialized properly

### Node Module Issues

If you encounter node module issues:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Go Module Issues

If you encounter Go module issues:

```bash
cd apps/backend
go clean -modcache
go mod download
```

## IDE Setup

### VS Code

Recommended extensions:

- Go (golang.go)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Docker (ms-azuretools.vscode-docker)

Settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[go]": {
    "editor.defaultFormatter": "golang.go"
  },
  "go.useLanguageServer": true
}
```

## Next Steps

Now that you have the development environment set up, you can:

1. Read the [API Documentation](apps/backend/README.md)
2. Check out the [Implementation Roadmap](docs/05-IMPLEMENTATION-ROADMAP.md)
3. Review [Development Guidelines](docs/07-DEVELOPMENT-GUIDELINES.md)
4. Start contributing!

## Getting Help

- Check the [docs/](docs/) directory for detailed documentation
- Open an issue on GitHub if you encounter problems
- Join our development discussions

Happy coding! 🚀
