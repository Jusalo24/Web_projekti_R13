# Movie Project R13

A full-stack movie web application built with React, Node.js/Express, PostgreSQL, and TMDB API.

**Team Members:** Juho-Pekka Salo, Tomi Roumio, Leevi Määttä, Konsta Ahvonen

---

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Running the Application](#running-the-application)
- [Docker Management](#docker-management-commands)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Additional Resources](#additional-resources)

---

## Quick Start

For those who want to get started quickly:

```powershell
# 1. Clone and enter the project
git clone https://github.com/Jusalo24/Web_projekti_R13.git
cd Web_projekti_R13

# 2. Set up environment variables
Copy-Item .env.example .env
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
# Edit .env files with your TMDB API key

# 3. Start everything
docker-compose up --build

# 4. In a new terminal, initialize database
docker-compose cp server/database/schema.sql db:/tmp/schema.sql
docker-compose exec db psql -U postgres -d moviedb -f /tmp/schema.sql

# 5. Access the app at http://localhost:5173
```

---

## Features

- 🎬 Browse and search movies using TMDB API
- 👥 Create and manage groups for collaborative movie experiences
- ⭐ Create and share favorite movie lists
- 📝 Write and read movie reviews
- 🔐 User authentication and account management
- 🌐 Responsive web design

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js 22** - Runtime environment
- **Express 5** - Web framework
- **PostgreSQL 16** - Database
- **pg** - PostgreSQL client

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nodemon** - Development auto-reload

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git** - [Download](https://git-scm.com/downloads)
- **Docker** - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** - (Included with Docker Desktop)
- **TMDB API Key** - [Get your free API key](https://www.themoviedb.org/settings/api)

### Verify Installation

```powershell
# Check Git
git --version

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version

# Ensure Docker Desktop is running
docker ps
```

**Windows Users:** Make sure Docker Desktop is running and WSL2 backend is enabled for best performance.

---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Jusalo24/Web_projekti_R13.git
cd Web_projekti_R13
```

### 2. Set Up Environment Variables

The project uses environment variables for configuration. You need to create `.env` files from the provided templates.

#### Root Environment Variables (Docker Compose)

```powershell
# Copy the example file
Copy-Item .env.example .env

# Edit with your values
code .env
```

Update `.env` with your configuration:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=moviedb

# Server
NODE_ENV=development
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=moviedb

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here
```

**Important:** Replace `your_tmdb_api_key_here` with your actual TMDB API key from https://www.themoviedb.org/settings/api

#### Server Environment Variables

```powershell
# Copy the example file
Copy-Item server\.env.example server\.env

# Edit with your values
code server\.env
```

Update `server/.env`:

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=moviedb

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here

# JWT (for authentication)
JWT_SECRET=your_secure_jwt_secret_here
```

#### Client Environment Variables

```powershell
# Copy the example file
Copy-Item client\.env.example client\.env

# Edit with your values
code client\.env
```

Update `client/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Feature Flags (optional)
VITE_ENABLE_DEBUG=true
```

### 3. Verify Database Schema

The database schema file is already included at `server/database/schema.sql`. You don't need to create it - it will be initialized when you first run the application.

---

## Running the Application

### First Time Setup

#### 1. Build and Start All Services

From the project root directory:

```powershell
# Build and start all services (database, server, client)
docker-compose up --build
```

This command will:
1. Pull the PostgreSQL 16 image
2. Build the Node.js server container
3. Build the React client container
4. Create a Docker network for service communication
5. Create a volume for database persistence
6. Start all services

**Wait for these messages:**
```
db-1      | database system is ready to accept connections
server-1  | Server running on port http://localhost:3001/
client-1  | ➜  Local:   http://localhost:5173/
```

#### 2. Initialize the Database Schema

After all containers are running, **open a new terminal** and initialize the database:

```powershell
# Copy schema into the database container
docker-compose cp server/database/schema.sql db:/tmp/schema.sql

# Run the schema
docker-compose exec db psql -U postgres -d moviedb -f /tmp/schema.sql
```

**Verify tables were created:**

```powershell
docker-compose exec db psql -U postgres -d moviedb -c "\dt"
```

You should see 9 tables listed:
- users
- groups
- group_members
- group_join_requests
- group_movies
- reviews
- favorite_lists
- favorite_list_items
- favorite_list_shares

### Access the Application

Once all containers are running:

- **Frontend (React):** http://localhost:5173
- **Backend API (Express):** http://localhost:3001
- **PostgreSQL Database:** localhost:5432

---

## Docker Management Commands

### Starting and Stopping

```powershell
# Start all services (after first build)
docker-compose up

# Start in detached mode (runs in background)
docker-compose up -d

# Stop all services (keeps data)
docker-compose down

# Stop and remove all volumes (deletes database data!)
docker-compose down -v
```

### Viewing Logs

```powershell
# View all logs in real-time
docker-compose logs -f

# View logs from specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f db

# View last 50 lines
docker-compose logs --tail=50 server
```

### Restarting Services

```powershell
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart server
docker-compose restart client
docker-compose restart db
```

### Rebuilding After Changes

```powershell
# Rebuild specific service
docker-compose build server
docker-compose build client

# Rebuild all services
docker-compose build

# Rebuild without cache (clean build)
docker-compose build --no-cache

# Rebuild and restart
docker-compose up --build
```

### Checking Service Status

```powershell
# Check running containers
docker-compose ps

# Check container health
docker-compose ps -a

# View resource usage
docker stats
```

### Accessing Containers

```powershell
# Access server container shell
docker-compose exec server sh

# Access client container shell
docker-compose exec client sh

# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d moviedb

# Run commands in containers
docker-compose exec server npm install package-name
docker-compose exec client npm install package-name
```

### Database Management

```powershell
# Create a backup
docker-compose exec db pg_dump -U postgres moviedb > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Restore from backup
Get-Content backup_20251111_203000.sql | docker-compose exec -T db psql -U postgres moviedb

# View database size
docker-compose exec db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('moviedb'));"

# View all databases
docker-compose exec db psql -U postgres -c "\l"

# Reset database (WARNING: Deletes all data!)
docker-compose down -v
docker-compose up -d db
Start-Sleep -Seconds 5
docker-compose cp server/database/schema.sql db:/tmp/schema.sql
docker-compose exec db psql -U postgres -d moviedb -f /tmp/schema.sql
```

### Cleaning Up Docker

```powershell
# Remove stopped containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Remove specific volumes
docker volume rm web_projekti_r13_pgdata
```

### Troubleshooting Commands

```powershell
# Check if ports are available
netstat -ano | findstr :5173
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# View Docker disk usage
docker system df

# Inspect a specific container
docker-compose exec server env  # View environment variables
docker-compose exec db ps aux   # View running processes

# Check network connectivity
docker-compose exec server ping db
docker-compose exec client ping server
```

---

## Running Services Individually (Without Docker)

If you prefer to run services outside Docker for development:

### Database (in Docker)
```powershell
docker-compose up db
```

### Backend (locally)
```powershell
cd server
npm install
npm run devStart
# Server runs at http://localhost:3001
```

### Frontend (locally)
```powershell
cd client
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

**Note:** Update `server/.env` to use `DB_HOST=localhost` instead of `DB_HOST=db` when running server locally.

---

## Database Schema

The application uses PostgreSQL with the following main tables:

### Core Tables
- **users** - User accounts and authentication
- **groups** - Movie groups created by users
- **group_members** - Group membership with roles (owner, admin, member)
- **group_join_requests** - Pending group join requests
- **group_movies** - Movies associated with groups
- **reviews** - User movie reviews with ratings (1-5)
- **favorite_lists** - User-created favorite movie lists
- **favorite_list_items** - Movies in favorite lists
- **favorite_list_shares** - Shareable links for favorite lists

### Key Features
- UUID primary keys for all tables
- Cascading deletes for related data
- Indexes for performance optimization
- Enum types for roles and statuses
- Timestamp tracking for creation dates

### ER Diagram

![ER Diagram](https://github.com/user-attachments/assets/ae9d8636-b424-4235-95f0-07a0e5bb5268)

---

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Planned Endpoints

#### Movies
- `GET /api/movies` - Get popular movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/search?q=query` - Search movies

#### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

#### Groups
- `GET /api/groups` - Get all public groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member to group
- `POST /api/groups/:id/join-request` - Request to join group

#### Reviews
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie
- `POST /api/reviews` - Create a review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

#### Favorite Lists
- `GET /api/favorites` - Get user's favorite lists
- `POST /api/favorites` - Create favorite list
- `POST /api/favorites/:id/movies` - Add movie to list
- `GET /api/favorites/share/:token` - View shared list

---

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```powershell
# Check what's using the port (Windows)
netstat -ano | findstr :3001  # Backend
netstat -ano | findstr :5173  # Frontend
netstat -ano | findstr :5432  # Database

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

### Docker Build Issues

```powershell
# Clean up Docker completely
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues

**1. Check if database is running:**
```powershell
docker-compose ps
```

**2. Check database logs:**
```powershell
docker-compose logs db
```

**3. Test database connection:**
```powershell
docker-compose exec db psql -U postgres -d moviedb -c "SELECT version();"
```

**4. Verify environment variables:**
```powershell
# Check server environment variables
docker-compose exec server env | findstr DB_

# Check docker-compose is reading .env
Get-Content .env
```

**5. Common fixes:**
```powershell
# Reset database completely
docker-compose down -v
docker volume rm web_projekti_r13_pgdata
docker-compose up -d db
Start-Sleep -Seconds 5

# Reinitialize schema
docker-compose cp server/database/schema.sql db:/tmp/schema.sql
docker-compose exec db psql -U postgres -d moviedb -f /tmp/schema.sql
```

### TMDB API Issues

**1. Verify API key in `.env`:**
```powershell
Get-Content .env | Select-String "TMDB_API_KEY"
Get-Content server\.env | Select-String "TMDB_API_KEY"
```

**2. Test API key manually:**
```powershell
# Using curl (if installed)
curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_API_KEY"

# Using PowerShell
$apiKey = "YOUR_API_KEY"
Invoke-RestMethod -Uri "https://api.themoviedb.org/3/movie/popular?api_key=$apiKey"
```

**3. Check TMDB API status:**
- Visit: https://www.themoviedb.org/talk/category/5047958519c29526b50017d6

**4. Ensure rate limits not exceeded:**
- TMDB allows 40 requests per 10 seconds

### Module Not Found Errors

```powershell
# Reinstall dependencies in containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Or rebuild specific service:**
```powershell
docker-compose build server --no-cache
docker-compose up server
```

### Container Won't Start

**1. Check logs for errors:**
```powershell
docker-compose logs server
docker-compose logs client
docker-compose logs db
```

**2. Remove everything and start fresh:**
```powershell
docker-compose down -v
docker system prune -a
docker-compose up --build
```

**3. Check Docker disk space:**
```powershell
docker system df
```

### Hot Reload Not Working

**Frontend (Vite):**
- Ensure volume mounting is correct in docker-compose.yml
- Try clearing Vite cache:
  ```powershell
  docker-compose exec client rm -rf node_modules/.vite
  docker-compose restart client
  ```

**Backend (Nodemon):**
- Check `package.json` has `nodemon` in devDependencies
- Verify nodemon is watching the right files
- Check `server/.dockerignore` isn't ignoring source files

### Environment Variables Not Loading

**1. Check file names are correct:**
```powershell
# Should see these files
Test-Path .env
Test-Path .env.example
Test-Path server\.env
Test-Path server\.env.example
Test-Path client\.env
Test-Path client\.env.example
```

**2. Verify no syntax errors in .env files:**
- No spaces around `=`
- No quotes needed for values
- Format: `KEY=value`

**3. Restart containers after .env changes:**
```powershell
docker-compose down
docker-compose up
```

### Windows-Specific Issues

**1. Line Endings (CRLF vs LF):**
```powershell
# Configure Git to handle line endings
git config core.autocrlf true
```

**2. File Permissions:**
- Ensure Docker Desktop has access to your drive
- Check Docker Desktop → Settings → Resources → File Sharing

**3. WSL2 Backend:**
- Docker Desktop should use WSL2 backend for better performance
- Check Docker Desktop → Settings → General

### Can't Access Frontend at localhost:5173

**1. Check if container is running:**
```powershell
docker-compose ps client
```

**2. Check Vite is binding to correct host:**
- Verify `CMD ["npm", "run", "dev", "--", "--host"]` in `client/Dockerfile`

**3. Try accessing via container IP:**
```powershell
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web_projekti_r13-client-1
# Then visit http://<IP>:5173
```

**4. Check firewall settings:**
- Windows Defender might block Docker ports
- Add exception for Docker Desktop

### Database Schema Errors

**If schema initialization fails:**

**1. Check syntax:**
```powershell
# Validate SQL syntax
docker-compose exec db psql -U postgres -d moviedb --dry-run -f /tmp/schema.sql
```

**2. Run schema step by step:**
```powershell
# Connect to database
docker-compose exec db psql -U postgres -d moviedb

# Then paste sections of schema.sql manually
```

**3. Check for existing conflicting objects:**
```powershell
docker-compose exec db psql -U postgres -d moviedb -c "\dt"
docker-compose exec db psql -U postgres -d moviedb -c "\dT"
```

### Getting Help

If you're still stuck:

1. **Check logs thoroughly:**
   ```powershell
   docker-compose logs -f
   ```

2. **Create a GitHub issue** with:
   - Error message
   - Steps to reproduce
   - Relevant log output
   - Your environment (Windows version, Docker version)

3. **Refer to documentation:**
   - [Architecture Guide](./architecture_guide.md)
   - [Contributing Guide](./CONTRIBUTING.md)
   - [Docker Documentation](https://docs.docker.com/)

### Common Error Messages

| Error | Solution |
|-------|----------|
| "port is already allocated" | Kill process using the port or change port in docker-compose.yml |
| "no such file or directory" | Check file paths are correct, verify files exist |
| "cannot connect to database" | Ensure DB_HOST=db in .env, check db container is running |
| "TMDB API error 401" | Check API key is correct and active |
| "module not found" | Rebuild containers: `docker-compose build --no-cache` |
| "permission denied" | Check Docker Desktop has drive access permissions |

---

## Project Structure

```
Web_projekti_R13/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── .env                  # Frontend environment variables (gitignored)
│   ├── .env.example          # Frontend env template (committed)
│   ├── .dockerignore         # Docker ignore rules
│   ├── Dockerfile            # Frontend container config
│   ├── index.html            # HTML template
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── server/                  # Express backend
│   ├── config/               # Configuration files
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Express middleware
│   ├── helpers/              # Helper functions
│   ├── database/             # Database related files
│   │   └── schema.sql         # PostgreSQL schema
│   ├── .env                  # Server environment variables (gitignored)
│   ├── .env.example          # Server env template (committed)
│   ├── .dockerignore         # Docker ignore rules
│   ├── .gitignore            # Git ignore rules
│   ├── Dockerfile            # Backend container config
│   ├── index.js              # Server entry point
│   └── package.json          # Backend dependencies
├── public/                  # Public static files
├── .env                     # Docker Compose variables (gitignored)
├── .env.example             # Docker Compose template (committed)
├── .gitignore               # Root gitignore
├── docker-compose.yml       # Multi-container configuration
├── architecture_guide.md    # Detailed architecture documentation
├── CONTRIBUTING.md          # Contribution guidelines
└── README.md                # This file
```

### Key Files Explained

| File | Purpose | Committed to Git? |
|------|---------|------------------|
| `.env` | Actual secrets and configuration | ❌ No (gitignored) |
| `.env.example` | Template for team members | ✅ Yes |
| `docker-compose.yml` | Defines all services | ✅ Yes |
| `server/database/schema.sql` | Database structure | ✅ Yes |
| `**/Dockerfile` | Container build instructions | ✅ Yes |
| `**/package.json` | Node.js dependencies | ✅ Yes |

---

## Additional Resources

### Documentation
- [Architecture Guide](./architecture_guide.md) - Detailed technical documentation
- [Contributing Guide](./CONTRIBUTING.md) - Development workflow and guidelines

### External Documentation
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## Team

- **Juho-Pekka Salo** - [GitHub Profile](https://github.com/Jusalo24)
- **Tomi Roumio**
- **Leevi Määttä**
- **Konsta Ahvonen**

---

## Contributing

We welcome contributions from all team members! 

### Before You Start
1. Read the [Architecture Guide](./architecture_guide.md) to understand the project structure
2. Review the [Contributing Guide](./CONTRIBUTING.md) for:
   - Git workflow and branching strategy
   - Code style guidelines
   - Commit message conventions
   - Pull request process
   - Development best practices

### Quick Contribution Steps
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit with clear messages: `Add: description of feature`
4. Push and create a pull request
5. Wait for code review

For detailed information, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Development Workflow

### Daily Development

```powershell
# Start your day
git pull origin main
docker-compose up

# Make changes to code (hot reload enabled)
# Files in ./client/src and ./server automatically reload

# View logs if needed
docker-compose logs -f server

# End your day
git add .
git commit -m "Add: what you did"
git push origin your-branch
docker-compose down
```

### Working on a Feature

1. **Start with a fresh environment:**
   ```powershell
   git checkout main
   git pull origin main
   docker-compose down -v
   docker-compose up --build
   ```

2. **Create a feature branch:**
   ```powershell
   git checkout -b feature/movie-search
   ```

3. **Develop with hot reload:**
   - Frontend changes reload automatically
   - Backend changes restart with nodemon

4. **Test your changes:**
   ```powershell
   # Check logs
   docker-compose logs -f

   # Test endpoints
   # Frontend: http://localhost:5173
   # Backend: http://localhost:3001
   ```

5. **Commit and push:**
   ```powershell
   git add .
   git commit -m "Add: movie search with filters"
   git push origin feature/movie-search
   ```

### Database Changes

When modifying the database:

1. **Update `server/database/schema.sql`**
2. **Test the changes:**
   ```powershell
   # Reset database
   docker-compose down -v
   docker-compose up -d db
   docker-compose cp server/database/schema.sql db:/tmp/schema.sql
   docker-compose exec db psql -U postgres -d moviedb -f /tmp/schema.sql
   ```
3. **Update documentation** in architecture_guide.md
4. **Commit both schema and docs**

### Environment Variables

- **Never commit `.env` files** (they're gitignored)
- **Always update `.env.example`** when adding new variables
- **Document new variables** in README and architecture guide

---

## License

This project is created for educational purposes as part of a web development course.

---

**Last Updated:** November 11, 2025

For questions or issues, please create an issue on the GitHub repository or refer to the [Contributing Guide](./CONTRIBUTING.md).

---

## Quick Reference

### Essential Commands

| Task | Command |
|------|---------|
| Start all services | `docker-compose up` |
| Start in background | `docker-compose up -d` |
| Stop all services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Rebuild services | `docker-compose up --build` |
| Reset database | `docker-compose down -v` |
| Check status | `docker-compose ps` |
| Access database | `docker-compose exec db psql -U postgres -d moviedb` |
| Restart service | `docker-compose restart server` |
| Clean everything | `docker-compose down -v && docker system prune -a` |

### Common Workflows

**First time setup:**
```powershell
git clone <repo> && cd Web_projekti_R13
Copy-Item .env.example .env  # Edit with your values
docker-compose up --build
docker-compose cp server/database/schema.sql db:/tmp/schema.sql
docker-compose exec db psql -U postgres -d moviedb -f /tmp/schema.sql
```

**Daily development:**
```powershell
docker-compose up
# Code with hot reload
# Ctrl+C to stop
docker-compose down
```

**Database reset:**
```powershell
docker-compose down -v
docker-compose up -d db
docker-compose cp server/database/schema.sql db:/tmp/schema.sql
docker-compose exec db psql -U postgres -d moviedb -f /tmp/schema.sql
```

**Clean rebuild:**
```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```