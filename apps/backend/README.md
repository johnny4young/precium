# Precium Backend

Golang backend application with Fiber framework.

## Setup

1. Install Go 1.23+
2. Copy `.env.example` to `.env`
3. Install dependencies:
   ```bash
   go mod download
   ```

## Development

Run the server:
```bash
go run cmd/server/main.go
```

Or use Air for hot reload:
```bash
air
```

## Testing

Run tests:
```bash
go test ./...
```

With coverage:
```bash
go test -cover ./...
```

## Build

Build the binary:
```bash
go build -o bin/server cmd/server/main.go
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/v1/docs` - API documentation

## Database Migrations

Run migrations:
```bash
migrate -path db/migrations -database "$DATABASE_URL" up
```

Rollback:
```bash
migrate -path db/migrations -database "$DATABASE_URL" down
```
