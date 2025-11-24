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
- [Development Status](#development-status)

---

## Features

### 🎬 Movie & TV Show Discovery
- Browse and search movies and TV shows using TMDB API
- Advanced filtering system with multiple criteria:
  - Filter by genre (movies and TV shows)
  - Filter by release year
  - Filter by cast members (movies only)
  - Sort by popularity, rating, release date, title, revenue, and vote count
  - Switch between movie and TV show discovery
- Real-time search with debounced input and dropdown suggestions
- Detailed movie/TV show pages with:
  - Full movie/series information
  - Trailers and videos
  - Cast and crew information
  - Similar content recommendations
  - Production company details

### 👥 User Management & Authentication
- User registration and login with JWT authentication
- Secure password hashing with bcryptjs
- Password strength validation (8+ characters, uppercase, number required)
- Protected routes requiring authentication
- User profile management
- Password change functionality
- Token-based session management

### 👫 Groups Feature
- **Create and manage movie groups** - Users can create groups with names and descriptions
- **Public and private groups** - Control group visibility settings
- **Group membership system** with roles:
  - **Owner** - Full control over the group
  - **Admin** - Can manage members
  - **Member** - Can view and add movies
- **Join request system** - Users request to join, owners approve/reject
- **Group movie collections** - Add movies/TV shows to group libraries
- **Group details page** - View members, roles, and shared movie collections

### ⭐ Favorite Lists
- Create and manage personal favorite movie lists
- Add movies to custom lists
- List sharing functionality (backend infrastructure ready)
- Organize your movie collection

### 🎭 Reviews System
- Rate movies on a 1-5 star scale
- Write detailed text reviews
- View reviews by movie or user
- Calculate average ratings
- Update and delete your own reviews
- Full CRUD operations via protected API endpoints

### 🔍 Advanced Search
- Multi-search functionality (movies, TV shows, and people)
- Person search with department information
- Trending content (daily/weekly)
- Search by actor/director credits
- Smart dropdown with thumbnails and metadata

### 🌐 Responsive Design
- Modern, dark-themed UI with gradient accents
- Horizontal scrolling movie grids on main pages
- Grid layouts for search and discovery pages
- Mobile-friendly navigation
- Smooth animations and transitions
- CSS custom properties for consistent theming

---

## Technology Stack

### Frontend
- **React 19.1.1** - UI framework with latest features
- **Vite 7.2.2** - Lightning-fast build tool and dev server
- **React Router 7.9.5** - Client-side routing with data loading
- **Axios 1.13.2** - HTTP client for API requests
- **CSS Variables** - Consistent theming and dark mode

### Backend
- **Node.js 22** - Runtime environment (Alpine-based Docker image)
- **Express 5.1.0** - Modern web framework
- **PostgreSQL 16** - Relational database with UUID support
- **JWT (jsonwebtoken 9.0.2)** - Secure authentication
- **bcryptjs 3.0.3** - Password hashing
- **Axios 1.13.2** - TMDB API integration

### DevOps
- **Docker & Docker Compose** - Complete containerization
- **Nodemon 3.1.10** - Development auto-reload
- **Multi-stage Docker setup** - Optimized for development

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
# For Windows PowerShell
New-Item -Path ".env" -ItemType File

# For macOS/Linux
touch .env
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

# Vite Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001
```

**Important:** 
- Replace `your_tmdb_api_key_here` with your actual TMDB API key
- Replace `your_secure_random_string_here` with a strong random string for JWT (e.g., generate with `openssl rand -base64 32`)

### 3. Start Docker Desktop

Ensure Docker Desktop is running before proceeding.

---

## Running the Application

### Start All Services

From the project root directory:

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

**First-time setup takes 2-5 minutes.** Subsequent starts are much faster.

### Access the Application

Once all containers are running:

- **Frontend (React):** http://localhost:5173
- **Backend API (Express):** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **PostgreSQL Database:** localhost:5432

### Verify Services

Check running containers:

```powershell
docker ps
```

You should see three containers:
- `web_projekti_r13-client-1` (React frontend)
- `web_projekti_r13-server-1` (Express backend)
- `web_projekti_r13-db-1` (PostgreSQL database)

### Verify Database Initialization

```powershell
# Connect to the database
docker-compose exec db psql -U postgres -d moviedb

# Inside psql, list all tables
\dt

# You should see: users, groups, group_members, group_join_requests, 
# group_movies, reviews, favorite_lists, favorite_list_items, favorite_list_shares

# Exit psql
\q
```

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

### Core Tables

#### Users & Authentication
- **users** - User accounts with email, username, and password hash
  - UUID primary key
  - Unique constraints on email and username
  - Case-insensitive indexes for lookups

#### Groups & Membership
- **groups** - Movie groups with visibility settings
  - Owner reference, name, description
  - `is_visible` flag for public/private groups
  - Automatic owner addition via trigger

- **group_members** - Membership with roles (owner, admin, member)
  - Composite primary key (group_id, user_id)
  - Role enum for access control

- **group_join_requests** - Pending join requests with status
  - Status enum: pending, accepted, rejected
  - Unique constraint on pending requests

- **group_movies** - Movies associated with groups (stores TMDB IDs)
  - Supports both movies and TV shows via `media_type`
  - Tracks who added each item

#### Reviews & Ratings
- **reviews** - User movie reviews with 1-5 star ratings
  - Unique constraint: one review per user per movie
  - Text reviews optional, rating required
  - Indexed by movie ID for fast lookups

#### Favorite Lists
- **favorite_lists** - User-created movie lists
  - Title and description
  - Unique per user (user_id, title)

- **favorite_list_items** - Movies in lists with positioning
  - Position field for custom ordering
  - Unique constraint prevents duplicates

- **favorite_list_shares** - Shareable links with expiration
  - Share tokens for public access
  - Expiration and active status tracking

### Key Features

- ✅ UUID primary keys for all tables
- ✅ Cascading deletes for data integrity
- ✅ Performance-optimized indexes
- ✅ Enum types for roles and statuses
- ✅ Timestamp tracking (created_at, joined_at)
- ✅ Unique constraints to prevent duplicates
- ✅ Automatic owner membership via database trigger
- ✅ Case-insensitive email/username lookups

---

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### User Management
- `POST /api/users/register` - Register new user
  - Body: `{ email, username, password }`
  - Password requirements: 8+ chars, 1 uppercase, 1 number
  - Returns: User object (without password)

- `POST /api/users/login` - User login
  - Body: `{ email, password }`
  - Returns: `{ user, token }` (JWT token for authorization)

- `GET /api/users/me` - Get current logged-in user (protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Current user profile

- `GET /api/users/:id` - Get user profile (protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: User profile data

- `PUT /api/users/:id` - Update user profile (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: Fields to update (email, username)
  - Returns: Updated user

- `PUT /api/users/:id/password` - Change password (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ oldPassword, newPassword }`
  - Returns: Success message

### Movie Endpoints

#### Movie Discovery & Search
- `GET /api/movies/byId/:id` - Get movie details by TMDB ID

- `GET /api/movies/:searchType` - Get movies by category
  - Valid types: `popular`, `now_playing`, `top_rated`, `upcoming`
  - Query params: `page`, `region` (e.g., `?region=FI`)

- `GET /api/movies/search?q=query&page=1` - Search movies

- `GET /api/movies/discover` - Discover movies with filters
  - Query params: `with_genres`, `sort_by`, `page`, `year`, `with_cast`, `with_crew`, `vote_average_gte`, `vote_average_lte`

- `GET /api/movies/:id/credits` - Get movie cast and crew

- `GET /api/movies/:id/videos` - Get movie trailers and videos

- `GET /api/movies/:id/similar?page=1` - Get similar movies

- `GET /api/movies/:id/recommendations?page=1` - Get movie recommendations

- `GET /api/movies/genres` - Get all movie genres

### TV Show Endpoints

#### TV Discovery & Search
- `GET /api/tv/:id` - Get TV show details by TMDB ID

- `GET /api/tv/list/:searchType` - Get TV shows by category
  - Valid types: `popular`, `top_rated`, `on_the_air`, `airing_today`

- `GET /api/tv/search?q=query&page=1` - Search TV shows

- `GET /api/tv/discover` - Discover TV shows with filters
  - Query params: `with_genres`, `sort_by`, `page`, `year`, `vote_average_gte`, `vote_average_lte`, `with_networks`

- `GET /api/tv/:id/season/:season_number` - Get TV season details

- `GET /api/tv/:id/credits` - Get TV show cast and crew

- `GET /api/tv/:id/videos` - Get TV show trailers

- `GET /api/tv/:id/similar?page=1` - Get similar TV shows

- `GET /api/tv/:id/recommendations?page=1` - Get TV show recommendations

### Genre Endpoints
- `GET /api/genres/movie` - Get all movie genres
- `GET /api/genres/tv` - Get all TV genres
- `GET /api/discover/tv` - Discover TV shows (alternative endpoint)

### Search & Trending Endpoints
- `GET /api/search/multi?q=query&page=1` - Multi-search (movies, TV, people)
- `GET /api/search/person?q=name&page=1` - Search people (actors, directors)
- `GET /api/person/:id` - Get person details
- `GET /api/person/:id/movie_credits` - Get person's movie credits
- `GET /api/person/:id/tv_credits` - Get person's TV credits
- `GET /api/trending/:media_type/:time_window` - Get trending content
  - media_type: `all`, `movie`, `tv`, `person`
  - time_window: `day`, `week`

### Review Endpoints

**Public Endpoints:**
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie
  - Query params: `page`, `limit`

- `GET /api/reviews/movie/:movieId/average` - Get average rating

- `GET /api/reviews/user/:userId` - Get user's reviews
  - Query params: `page`, `limit`

**Protected Endpoints:**
- `POST /api/reviews` - Create review (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ user_id, movie_external_id, rating, review_text }`

- `PUT /api/reviews/:id` - Update review (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ rating, review_text }`

- `DELETE /api/reviews/:id` - Delete review (protected)
  - Headers: `Authorization: Bearer <token>`

### Group Endpoints (Protected)

**Group Management:**
- `GET /api/groups` - Get all public groups

- `GET /api/groups/my` - Get user's groups (member or owner)
  - Headers: `Authorization: Bearer <token>`

- `GET /api/groups/:id` - Get single group details
  - Headers: `Authorization: Bearer <token>`
  - Returns: Group with members array

- `POST /api/groups` - Create new group
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, description }`

- `PUT /api/groups/:id` - Update group (owner only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name?, description?, isVisible? }`

- `DELETE /api/groups/:id` - Delete group (owner only)
  - Headers: `Authorization: Bearer <token>`

**Join Request System:**
- `POST /api/groups/:id/join-request` - Send join request
  - Headers: `Authorization: Bearer <token>`

- `GET /api/groups/:id/join-requests` - Get pending requests (owner only)
  - Headers: `Authorization: Bearer <token>`

- `PATCH /api/groups/:id/join-requests/:requestId/accept` - Accept request (owner only)
  - Headers: `Authorization: Bearer <token>`

- `PATCH /api/groups/:id/join-requests/:requestId/reject` - Reject request (owner only)
  - Headers: `Authorization: Bearer <token>`

**Group Movies:**
- `POST /api/groups/:id/movies` - Add movie to group (members only)
  - Headers: `Authorization: Bearer <token>`
  - Query params: `movieId`, `mediaType`

- `DELETE /api/groups/:id/movies` - Remove movie from group (members only)
  - Headers: `Authorization: Bearer <token>`
  - Query params: `movieId`, `mediaType`

- `GET /api/groups/:id/movies` - List group movies (members only)
  - Headers: `Authorization: Bearer <token>`

### Favorite List Endpoints (Protected)
- `POST /api/favorite-lists` - Create favorite list
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title, description }`

- `GET /api/favorite-lists` - Get user's lists
  - Headers: `Authorization: Bearer <token>`

- `GET /api/favorite-lists/:listId/items` - Get items in list
  - Headers: `Authorization: Bearer <token>`

- `POST /api/favorite-lists/:listId/items` - Add movie to list
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ movieId, position }`

- `DELETE /api/favorite-lists/items/:itemId` - Remove movie from list
  - Headers: `Authorization: Bearer <token>`

---

## Project Structure

```
Web_projekti_R13/
├── client/                           # React frontend
│   ├── src/
│   │   ├── assets/
│   │   │   └── favicon.ico
│   │   ├── components/               # Reusable UI components
│   │   │   ├── GetCast.jsx           # Cast search with debounce                         Props: onSelect (callback), disabled (boolean)
│   │   │   ├── GetGenre.jsx          # Genre dropdown component.                         Props: onSelect (callback), selectedGenre (id), mediaType ('movie'|'tv')
│   │   │   ├── GetImage.jsx          # TMDB image component with configurable size.      Props: path (string), title (string), size (string), style (object), onClick (function)
│   │   │   ├── GetMoviesSeries.jsx   # Grid/list component for movies/TV shows.     (1/2)Props: type (string), page (number), pages (number),
│   │   │   │                                                                        (2/2)Props: imageSize (string), limit (number), query (string), discoverParams (object)
│   │   │   ├── navbar.jsx            # Main navigation bar with search
│   │   │   └── SearchBar.jsx         # Search input with dropdown suggestions.           Props: onSearch (callback)
│   │   ├── hooks/
│   │   │   └── useSearchApi.js       # Custom hook for TMDB API calls.                   Params: type, page, pages, limit, query, discoverParams.       Returns: { movies, loading, error }
│   │   ├── pages/                    # Page components
│   │   │   ├── Account.jsx           # User profile and settings page (protected).       Features: Profile info, favorite lists, groups
│   │   │   ├── Discover.jsx          # Advanced movie/TV discovery with filters          Filters: Genre, year, cast, sort, media type
│   │   │   ├── Groups.jsx            # Groups page (placeholder)
│   │   │   ├── Home.jsx              # Homepage with categorized content                 Sections: Now playing, top rated, upcoming, popular
│   │   │   ├── Login.jsx             # User login page.                                  Stores JWT token in localStorage
│   │   │   ├── MovieDetail.jsx       # Detailed movie/TV show page.                      Features: Full info, trailer, cast, similar content            Query param: type ('movie'|'tv')
│   │   │   ├── Register.jsx          # User registration page
│   │   │   └── SearchResult.jsx      # Search results page                                                                                              Query param: search (string)
│   │   ├── styles/                   # CSS stylesheets
│   │   ├── App.jsx                   # Main app with routes
│   │   └── main.jsx                  # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── server/                           # Express backend
│   ├── routes/                       # API route definitions
│   │   ├── favoriteListRouter.js     # Favorite list routes (protected)
│   │   ├── genreRouter.js            # Genre and discover routes
│   │   ├── groupRouter.js            # Group routes (empty)
│   │   ├── movieRouter.js            # Movie TMDB API routes
│   │   ├── reviewRouter.js           # Review CRUD routes
│   │   ├── searchRouter.js           # Search and trending routes
│   │   ├── tvRouter.js               # TV show TMDB API routes
│   │   └── userRouter.js             # User authentication routes
│   ├── controllers/                  # Request handlers
│   │   ├── favoriteListController.js # Favorite list logic.                    Functions: createList, getUserLists, getListItems, addItemToList, deleteItem          
│   │   ├── genreController.js        # Genre fetching and TV discovery         Functions: getMovieGenres, getTVGenres, discoverTV
│   │   ├── groupController.js        # Group logic (empty)
│   │   ├── reviewController.js       # Review CRUD operations                  Functions: createReview, getReviewsByMovieId, getReviewsByUserId, updateReview, deleteReview, getMovieAverageRating
│   │   ├── searchController.js       # Search and trending logic               Functions: multiSearch, searchPerson, getPersonById, getPersonMovieCredits, getPersonTVCredits, getTrending
│   │   ├── TMDBMovieController.js    # TMDB movie API handlers            (1/3)Functions: getMovieById, getMoviesByType, searchMovies,
│   │   │                                                                  (2/3)Functions: getMovieCredits, getMovieVideos, getSimilarMovies,
│   │   │                                                                  (3/3)Functions: getMovieRecommendations, getMovieGenres, discoverMovies
│   │   ├── TMDBTVController.js       # TMDB TV API handlers               (1/2)Functions: getTVById, getTVByType, searchTV, getTVSeason, getTVCredits,
│   │   │                                                                  (2/2)Functions: getTVVideos, getSimilarTV, getTVRecommendations, discoverTV        
│   │   └── userController.js         # User authentication handlers            Functions: createUser, userLogin, getUserById, updateUser
│   ├── models/                       # Database models
│   │   ├── favoriteItemModel.js      # Favorite list items CRUD                Functions: addFavoriteItem, getFavoriteItemsByList, deleteFavoriteItem
│   │   ├── favoriteListModel.js      # Favorite lists CRUD                     Functions: createFavoriteList, getFavoriteListsByUser, getFavoriteListById, deleteFavoriteList    
│   │   └── userModel.js              # User database operations                Functions: createUser, getUserByEmail, getUserById, updateUser
│   ├── services/                     # Business logic layer
│   │   └── userService.js            # User authentication logic               Functions: registerUser, loginUser, getUserProfile, updateUserProfile
│   ├── helpers/                      # Helper functions and middleware
│   │   ├── auth.js                   # JWT authentication middleware           Verifies Bearer token and attaches user to req.user
│   │   ├── db.js                     # PostgreSQL connection pool
│   │   └── tmdbHelper.js             # TMDB API request wrapper                Function: tmdbRequest(endpoint, params)
│   ├── Dockerfile
│   ├── index.js                      # Server entry point                      Configures Express, CORS, routes, error handling
│   └── package.json
├── init_moviedb.sql                  # Database schema
├── docker-compose.yml                # Container orchestration
├── .env                              # Environment variables
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## Development Status

### ✅ Completed Features
- **Full TMDB API integration** for movies and TV shows
- **User authentication system** with JWT and bcrypt
- **Advanced discovery page** with genre, year, cast, and sort filters
- **Search functionality** with dropdown suggestions and multi-search
- **Detailed movie/TV pages** with trailers, cast, and recommendations
- **Reviews system** with full CRUD operations
- **Groups functionality** with complete join request workflow
- **Favorite lists** with backend infrastructure
- **Responsive UI** with modern dark theme
- **Person search** and credits viewing
- **Trending content** tracking
- **Role-based access control** for groups (owner/admin/member)
- **Password validation** and change functionality

### 🚧 In Progress
- Group movie collections UI integration
- Account page enhancements
- Account managment
- Review UI components
- Favorite list management UI
- Group detail page improvements
- Movie detail page buttons

### 📋 Planned Features
- Password reset functionality
- Movie watchlist
- Mobile friendly UI/UX

---

## Development Workflow

### Making Changes

1. **Backend changes** - Edit files in `server/` directory
   - Nodemon automatically restarts the server
   
2. **Frontend changes** - Edit files in `client/src/` directory
   - Vite HMR updates the browser automatically

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

# Remove all containers and volumes
docker-compose down -v --rmi all
```

---

## Troubleshooting

### Common Issues

**Port already in use:**
```powershell
# Check what's using the port
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # macOS/Linux

# Kill the process or change port in .env
```

**Database connection errors:**
```powershell
# Check if database container is running
docker-compose ps

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

**TMDB API errors:**
- Verify your API key in `.env`
- Check API usage limits at TMDB
- Ensure network connectivity

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

**Last Updated:** November 24, 2024