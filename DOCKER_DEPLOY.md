# LeadOff CRM - Docker Deployment

Simple Docker Compose deployment for LeadOff CRM.

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd leadoff-crm
   ```

2. **Setup environment:**
   ```bash
   cp .env.local .env
   # Edit .env if needed (default values work out of the box)
   ```

3. **Start the application:**
   ```bash
   docker compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Management Commands

**View logs:**
```bash
docker compose logs -f
```

**Stop the application:**
```bash
docker compose down
```

**Stop and remove all data:**
```bash
docker compose down -v
```

**Rebuild after code changes:**
```bash
docker compose up -d --build
```

## Configuration

The `.env` file contains all configuration. Default values:

```env
DATABASE_URL="file:./data/leadoff.db"
PORT=3000
NODE_ENV=production
FRONTEND_ORIGIN=http://localhost
LOG_LEVEL=info
```

## Data Persistence

Lead data is stored in a Docker volume (`backend-data`). To backup:

```bash
docker cp leadoff-backend:/app/backend/data/leadoff.db ./backup.db
```

## Troubleshooting

**Check service health:**
```bash
docker compose ps
```

**View backend logs:**
```bash
docker compose logs backend
```

**View frontend logs:**
```bash
docker compose logs frontend
```

**Reset database:**
```bash
docker compose down -v
docker compose up -d
```
