# Movie Project R13

![Backend Tests](https://img.shields.io/badge/tests-69%2F69%20passing-brightgreen)
![PowerShell](https://img.shields.io/badge/PowerShell-5.1%2B-blue)
![Docker](https://img.shields.io/badge/Docker-Required-2496ED)

A full-stack movie web application built with React, Node.js/Express, PostgreSQL, and TMDB API.

**Team Members:** Juho-Pekka Salo, Tomi Roumio, Leevi Määttä, Konsta Ahvonen

---

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Additional Resources](#additional-resources)

---

## Features

- 🎬 Browse and search movies and TV shows using TMDB API
- 👥 Create and manage groups for collaborative movie experiences
- ⭐ Create and share favorite movie lists
- 📝 Write and read movie reviews with ratings
- 🔐 User authentication and account management
- 🌐 Responsive web design
- 🔍 Advanced search and discovery features
- 📊 Trending content (movies, TV shows, people)
- 🎭 Person details and filmography

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js 22** - Runtime environment
- **Express 5** - Web framework
- **PostgreSQL 16** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **TMDB API** - Movie and TV show data

### DevOps & Testing
- **Docker & Docker Compose** - Containerization
- **Nodemon** - Development auto-reload
- **PowerShell** - Automated testing suite (69 comprehensive tests)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Git** - [Download](https://git-scm.com/downloads)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **PowerShell 5.1+** - Pre-installed on Windows, [install on Linux/Mac](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell)
- **TMDB API Key** - [Get your free API key](https://www.themoviedb.org/settings/api)

### Verify Installation

Open PowerShell or Terminal and run:

```powershell
# Check Git
git --version

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version

# Check PowerShell version
$PSVersionTable.PSVersion
```

---

## Project Setup

### 1. Clone the Repository

```powershell
git clone https://github.com/Jusalo24/Web_projekti_R13.git
cd Web_projekti_R13
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root directory:

```powershell
New-Item -Path ".env" -ItemType File
```

Add the following content to `.env`:

```env
# Server Configuration
PORT=3001

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here

# PostgreSQL Configuration
POSTGRES_HOST=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=moviedb
POSTGRES_PORT=5432

# JWT Configuration
JWT_SECRET=your_secure_random_string_here
```

**Important:** 
- Replace `your_tmdb_api_key_here` with your actual TMDB API key
- Replace `your_secure_random_string_here` with a strong random string for JWT
- **Never commit `.env` to version control** (already in `.gitignore`)

### 3. Start Docker Desktop

Ensure Docker Desktop is running before proceeding.

---

## Running the Application

### Start All Services

From the project root directory in PowerShell:

```powershell
# Build and start all services (database, server, client)
docker-compose up --build
```

This command will:
1. Pull the PostgreSQL 16 image
2. Build the Node.js server container
3. Build the React client container
4. Initialize the database with the schema from `init_moviedb.sql`
5. Start all services with networking configured

### Access the Application

Once all containers are running:

- **Frontend (React):** http://localhost:5173
- **Backend API (Express):** http://localhost:3001
- **Backend Health Check:** http://localhost:3001/health
- **PostgreSQL Database:** localhost:5432

### Verify Services

```powershell
# Check all containers are running
docker ps

# Expected: 3 containers running
# - web_projekti_r13-client-1
# - web_projekti_r13-server-1
# - web_projekti_r13-db-1

# Check health endpoint
curl http://localhost:3001/health
```

### Verify Database Initialization

The database schema is automatically initialized from `init_moviedb.sql` on first startup. To verify:

```powershell
# Connect to the database
docker-compose exec db psql -U postgres -d moviedb

# Inside psql, list all tables
\dt

# Exit psql
\q
```

You should see tables like `users`, `groups`, `reviews`, `favorite_lists`, etc.

### Stop the Application

```powershell
# Stop all services (keeps data)
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

---

## Testing

### Automated Backend Testing

The project includes a comprehensive PowerShell testing suite with **69 automated tests** covering all API endpoints.

#### Run All Tests

```powershell
# Run complete test suite
.\Test-Backend.ps1

# Save results to file
.\Test-Backend.ps1 > test-results.txt
```

#### Test Coverage

**69 Tests covering:**
- Health check (1 test)
- Movie endpoints - search, browse, details, credits, videos (17 tests)
- TV show endpoints - search, browse, seasons, credits (11 tests)
- Genre endpoints - movie/TV genres, discovery (3 tests)
- Search & discovery - multi-search, people, trending (10 tests)
- User authentication - register, login, profile (7 tests)
- Review system - CRUD operations, ratings (11 tests)
- Error handling - validation, 404s, edge cases (6 tests)
- Pagination - different pages return different results (1 test)

#### Test Script Features

- ✅ Color-coded output (green = pass, red = fail)
- ✅ Detailed error messages with response previews
- ✅ Exit code validation (0 = all passed, >0 = failures)
- ✅ CI/CD ready (can be integrated with GitHub Actions later)
- ✅ Automatic authentication token management
- ✅ Request/response time tracking
- ✅ PSScriptAnalyzer compliant

#### Manual API Testing

You can also test endpoints manually using curl or Postman:

```powershell
# Health check
curl http://localhost:3001/health

# Search movies
curl "http://localhost:3001/api/movies/search?q=inception"

# Get movie details
curl http://localhost:3001/api/movies/550

# Register user
curl -X POST http://localhost:3001/api/users/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'
```

---

## Database Schema

### Visual Overview

**ER Diagram:**

<img width="855" height="771" alt="ER Diagram" src="https://github.com/user-attachments/assets/ae9d8636-b424-4235-95f0-07a0e5bb5268" />

**Wireframe:**

<img width="478" height="761" alt="Wireframe" src="https://github.com/user-attachments/assets/8c255e9a-42ca-4582-bf83-00d2f8deba88" />

### Core Tables

- **users** - User accounts with email, username, and password hash
- **groups** - Movie groups with visibility settings
- **group_members** - Membership with roles (owner, admin, member)
- **group_join_requests** - Pending join requests with status
- **group_movies** - Movies associated with groups (stores TMDB IDs)
- **reviews** - User movie reviews with 1-5 star ratings
- **favorite_lists** - User-created movie lists
- **favorite_list_items** - Movies in lists with positioning
- **favorite_list_shares** - Shareable links with expiration

### Key Features

- ✅ UUID primary keys for all tables
- ✅ Cascading deletes for data integrity
- ✅ Performance-optimized indexes
- ✅ Enum types for roles and statuses
- ✅ Timestamp tracking
- ✅ Unique constraints to prevent duplicates

---

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Implemented Endpoints

#### Movies
- `GET /api/movies/search?q=query&page=1` - Search movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/:id/credits` - Get movie cast and crew
- `GET /api/movies/:id/videos` - Get movie trailers and videos
- `GET /api/movies/:id/similar` - Get similar movies
- `GET /api/movies/:id/recommendations` - Get movie recommendations
- `GET /api/movies/list/:type` - Get movies by category (popular, now_playing, top_rated, upcoming)
- `GET /api/movies/genres` - Get all movie genres
- `GET /api/movies/discover` - Discover movies with filters

#### TV Shows
- `GET /api/tv/search?q=query` - Search TV shows
- `GET /api/tv/:id` - Get TV show details
- `GET /api/tv/:id/season/:number` - Get season details
- `GET /api/tv/:id/credits` - Get TV show cast and crew
- `GET /api/tv/:id/videos` - Get TV show videos
- `GET /api/tv/:id/similar` - Get similar TV shows
- `GET /api/tv/:id/recommendations` - Get TV show recommendations
- `GET /api/tv/list/:type` - Get TV shows by category (popular, top_rated, on_the_air, airing_today)

#### Genres
- `GET /api/genres/movie` - Get all movie genres
- `GET /api/genres/tv` - Get all TV genres
- `GET /api/discover/tv` - Discover TV shows with filters

#### Search & Discovery
- `GET /api/search/multi?q=query` - Multi-search (movies, TV, people)
- `GET /api/search/person?q=query` - Search people
- `GET /api/person/:id` - Get person details
- `GET /api/person/:id/movie_credits` - Get person's movie credits
- `GET /api/person/:id/tv_credits` - Get person's TV credits
- `GET /api/trending/:media_type/:time_window` - Get trending content

#### Authentication (Protected with JWT)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:id` - Get user profile (protected)
- `PUT /api/users/:id` - Update user profile (protected)

#### Reviews (Protected operations require JWT)
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie (public)
- `GET /api/reviews/movie/:movieId/average` - Get average rating (public)
- `POST /api/reviews` - Create a review (protected)
- `PUT /api/reviews/:id` - Update own review (protected)
- `DELETE /api/reviews/:id` - Delete own review (protected)

### Authentication

Protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

Get token by logging in via `/api/users/login`

### Error Responses

All errors return JSON with an `error` property:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Project Structure

```
Web_projekti_R13/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express backend
│   ├── routes/                # API route definitions
│   │   ├── movieRouter.js
│   │   ├── tvRouter.js
│   │   ├── searchRouter.js
│   │   ├── reviewRouter.js
│   │   ├── genreRouter.js
│   │   └── userRouter.js
│   ├── controllers/           # Request handlers
│   │   ├── TMDBMovieController.js
│   │   ├── TMDBTVController.js
│   │   ├── searchController.js
│   │   ├── reviewController.js
│   │   ├── genreController.js
│   │   └── userController.js
│   ├── services/              # Business logic
│   │   └── userService.js
│   ├── models/                # Database models
│   │   └── userModel.js
│   ├── helpers/               # Utility functions
│   │   ├── db.js              # Database connection
│   │   ├── auth.js            # JWT middleware
│   │   └── tmdbHelper.js      # TMDB API helper
│   ├── Dockerfile
│   ├── index.js               # Server entry point
│   └── package.json
├── init_moviedb.sql           # Database schema initialization
├── docker-compose.yml         # Multi-container configuration
├── Test-Backend.ps1           # Automated testing suite (69 tests)
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── README.md                  # This file
└── DEBUGGING.md               # Troubleshooting guide
```

---

## Development Workflow

### Making Changes

1. **Backend changes** - Edit files in `server/` directory
   - Nodemon will automatically restart the server
   - Test endpoint manually or run full test suite
   
2. **Frontend changes** - Edit files in `client/src/` directory
   - Vite HMR will update the browser automatically
   - No restart needed for most changes

3. **Database changes** - Edit `init_moviedb.sql`
   - Requires container restart: `docker-compose down -v && docker-compose up --build`
   - **Warning:** This deletes all data

### Viewing Logs

```powershell
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs server
docker-compose logs client
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f server

# View last 50 lines
docker-compose logs --tail=50 server
```

### Running Tests During Development

```powershell
# Run tests after making changes
.\Test-Backend.ps1

# Quick test specific endpoint
curl http://localhost:3001/api/movies/550

# Test with verbose output
.\Test-Backend.ps1 -Verbose
```

---

## Additional Resources

### Documentation
- **[DEBUGGING.md](./DEBUGGING.md)** - Comprehensive troubleshooting guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Detailed API reference with examples
- **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Backend fixes and improvements log
- **TMDB API** - [Documentation](https://developers.themoviedb.org/3)
- **React** - [Documentation](https://react.dev/)
- **Express** - [Documentation](https://expressjs.com/)
- **PostgreSQL** - [Documentation](https://www.postgresql.org/docs/)

### Useful Commands

```powershell
# Rebuild specific service
docker-compose build server
docker-compose up server

# Execute commands in running container
docker-compose exec server npm install package-name
docker-compose exec db psql -U postgres -d moviedb

# Clean restart
docker-compose down -v
docker-compose up --build

# Run tests
.\Test-Backend.ps1
```

---

## Team

- **Juho-Pekka Salo** - [GitHub Profile](https://github.com/Jusalo24)
- **Tomi Roumio**
- **Leevi Määttä**
- **Konsta Ahvonen**

---

## License

This project is created for educational purposes as part of a web development course.

---

## Contributing

This is a student project, but contributions and suggestions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
6. Run tests before submitting: `.\Test-Backend.ps1`

---

**Last Updated:** November 18, 2025

For questions or issues, please refer to [DEBUGGING.md](./DEBUGGING.md) or create an issue on the GitHub repository.
