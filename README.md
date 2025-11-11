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
- [Troubleshooting](#troubleshooting)
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

```bash
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

```bash
git clone https://github.com/Jusalo24/Web_projekti_R13.git
cd Web_projekti_R13
```

### 2. Set Up Environment Variables

#### Server Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
touch .env
```

Add the following content to `server/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=moviedb

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here

# JWT Configuration (if implementing authentication)
JWT_SECRET=your_secure_jwt_secret_here
```

**Important:** Replace `your_tmdb_api_key_here` with your actual TMDB API key.

#### Client Environment Variables (Optional)

If needed, create a `.env` file in the root directory for frontend environment variables:

```bash
cd ..
touch .env
```

Add any frontend-specific variables:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Initialize the Database Schema

The database schema will be automatically created when you first run the application. The schema file is located at `server/database/schema.sql`.

Create the directory structure:

```bash
mkdir -p server/database
```

Create `server/database/schema.sql` and copy the database schema from the project documentation.

---

## Running the Application

### Start All Services with Docker Compose

From the project root directory:

```bash
# Build and start all services (database, server, client)
docker-compose up --build
```

This command will:
1. Pull the PostgreSQL 16 image
2. Build the Node.js server container
3. Build the React client container
4. Start all services with networking configured

### Access the Application

Once all containers are running, you can access:

- **Frontend (React):** http://localhost:5173
- **Backend API (Express):** http://localhost:3001
- **PostgreSQL Database:** localhost:5432

### Initialize the Database

After the containers are running for the first time, initialize the database schema:

**Option 1: From your local machine**
```bash
psql -h localhost -U postgres -d moviedb -f server/database/schema.sql
# Password: postgres
```

**Option 2: Using Docker exec**
```bash
# Copy schema file to container
docker cp server/database/schema.sql <container_id>:/tmp/schema.sql

# Run schema in database
docker-compose exec db psql -U postgres -d moviedb -f /tmp/schema.sql
```

**Option 3: Connect to database directly**
```bash
docker-compose exec db psql -U postgres -d moviedb
# Then paste the schema content
```

### Stop the Application

```bash
# Stop all services (keeps data)
docker-compose down

# Stop all services and remove volumes (deletes database data)
docker-compose down -v
```

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

### Wireframe

![Wireframe](https://github.com/user-attachments/assets/8c255e9a-42ca-4582-bf83-00d2f8deba88)

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

```bash
# Check what's using the port
lsof -i :3001  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # Database

# Kill the process
kill -9 <PID>
```

### Docker Build Issues

```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues

1. Ensure the database container is running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs db
   ```

3. Verify environment variables in `server/.env`

4. Test database connection:
   ```bash
   docker-compose exec db psql -U postgres -d moviedb -c "SELECT version();"
   ```

### TMDB API Issues

1. Verify your API key is correct in `server/.env`
2. Check TMDB API status: https://www.themoviedb.org/talk/category/5047958519c29526b50017d6
3. Ensure you're not exceeding rate limits (40 requests per 10 seconds)
4. Test API key:
   ```bash
   curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_API_KEY"
   ```

### Module Not Found Errors

```bash
# Reinstall dependencies in container
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs server
docker-compose logs client

# Remove all containers and start fresh
docker-compose down -v
docker-compose up --build
```

---

## Project Structure

```
Web_projekti_R13/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── Dockerfile        # Frontend container config
│   └── package.json
├── server/               # Express backend
│   ├── routes/           # API routes
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Database models
│   ├── middleware/       # Express middleware
│   ├── database/         # Database schema and migrations
│   │   └── schema.sql    # Database schema
│   ├── Dockerfile        # Backend container config
│   └── package.json
├── docker-compose.yml    # Multi-container configuration
├── architecture_guide.md # Detailed architecture documentation
├── CONTRIBUTING.md       # Contribution guidelines
└── README.md             # This file
```

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

We welcome contributions from all team members! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our development workflow, code style, and pull request process.

---

## License

This project is created for educational purposes as part of a web development course.

---

**Last Updated:** November 11, 2025

For questions or issues, please create an issue on the GitHub repository or refer to the [Contributing Guide](./CONTRIBUTING.md).