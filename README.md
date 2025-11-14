# Movie Project R13

A full-stack movie web application built with React, Node.js/Express, PostgreSQL, and TMDB API.

**Team Members:** Juho-Pekka Salo, Tomi Roumio, Leevi Määttä, Konsta Ahvonen

---

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Running the Application](#running-the-application)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Additional Resources](#additional-resources)

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
- **Vite 7** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js 22** - Runtime environment
- **Express 5** - Web framework
- **PostgreSQL 16** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nodemon** - Development auto-reload

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Git** - [Download](https://git-scm.com/downloads)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
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
- **PostgreSQL Database:** localhost:5432

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

Three containers should be running. To verify:

```powershell
# Lists running containers on your system.
docker ps
```

You should see containers with names like `web_projekti_r13-client-1`, `web_projekti_r13-server-1` and `web_projekti_r13-db-1`.

### Stop the Application

```powershell
# Stop all services (keeps data)
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
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

### Planned Endpoints

#### Movies
- `GET /api/movies/now_playing` - Get now playing movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/search?q=query` - Search movies

#### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

#### Groups
- `GET /api/groups` - Get all public groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group (admin/owner only)
- `DELETE /api/groups/:id` - Delete group (owner only)
- `POST /api/groups/:id/members` - Add member to group
- `POST /api/groups/:id/join-request` - Request to join group
- `GET /api/groups/:id/movies` - Get group's movie collection

#### Reviews
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie
- `POST /api/reviews` - Create a review
- `PUT /api/reviews/:id` - Update own review
- `DELETE /api/reviews/:id` - Delete own review

#### Favorite Lists
- `GET /api/favorites` - Get user's favorite lists
- `POST /api/favorites` - Create favorite list
- `POST /api/favorites/:id/movies` - Add movie to list
- `DELETE /api/favorites/:id/movies/:movieId` - Remove movie from list
- `GET /api/favorites/share/:token` - View shared list (public)

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
│   │   └── userRouter.js
│   ├── controllers/           # Request handlers (to be implemented)
│   ├── services/              # Business logic (to be implemented)
│   ├── middleware/            # Express middleware (to be implemented)
│   ├── db/                    # Database connection (to be implemented)
│   ├── Dockerfile
│   ├── index.js               # Server entry point
│   └── package.json
├── init_moviedb.sql           # Database schema initialization
├── docker-compose.yml         # Multi-container configuration
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── README.md                  # This file
└── DEBUGGING.md               # Troubleshooting guide

**Note:** Directories marked "to be implemented" are part of the planned architecture.
```

---

## Development Workflow

### Making Changes

1. **Backend changes** - Edit files in `server/` directory
   - Nodemon will automatically restart the server
   
2. **Frontend changes** - Edit files in `client/src/` directory
   - Vite HMR will update the browser automatically

3. **Database changes** - Edit `init_moviedb.sql`
   - Requires container restart: `docker-compose down -v && docker-compose up --build`

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
```

---

## Additional Resources

### Documentation
- **[DEBUGGING.md](./DEBUGGING.md)** - Troubleshooting common issues
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

**Last Updated:** November 13, 2025

For questions or issues, please refer to [DEBUGGING.md](./DEBUGGING.md) or create an issue on the GitHub repository.