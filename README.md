# Movie Project R13

A full-stack movie web application built with React, Node.js/Express, PostgreSQL, and TMDB API.

**Team Members:** Juho-Pekka Salo, Tomi Roumio, Leevi Määttä, Konsta Ahvonen

---

## Table of Contents
- [Features](#features)
- [Security Features](#security-features)
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
- Secure password hashing with bcryptjs (12 salt rounds)
- Strong password validation (8+ characters, uppercase, lowercase, number)
- Protected routes requiring authentication
- User profile management
- Secure password change functionality
- Token-based session management with logout
- Rate limiting to prevent brute force attacks
- Input sanitization and validation

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

## Security Features

### 🔒 Authentication & Authorization

- **JWT Token Management**
  - Token blacklisting for secure logout
  - Token expiration validation
  - Token age verification (prevents old tokens)
  - Secure secret validation on startup

- **Password Security**
  - Strong password requirements: 8+ characters, uppercase, lowercase, number
  - Bcrypt hashing with 12 salt rounds
  - Password reuse prevention
  - Timing attack protection
  - Generic error messages (no user enumeration)

### 🛡️ Rate Limiting

Protection against brute force and DOS attacks:

- **Login attempts**: 5 per 15 minutes per IP
- **Registration**: 3 accounts per hour per IP
- **Password changes**: 5 attempts per hour per IP
- **General API**: 100 requests per 15 minutes per IP

### ✅ Input Validation & Sanitization

- Email format validation
- Username validation (alphanumeric + underscores, 3-30 characters)
- Input sanitization to prevent XSS attacks
- Length limits to prevent DOS
- SQL injection protection via parameterized queries

### 🔐 HTTP Security

- **Helmet.js** security headers:
  - Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - XSS Protection
  - Frame Options (clickjacking prevention)
  - DNS Prefetch Control
- **HTTPS redirect** in production
- **CORS** with whitelist configuration

### 🎯 Access Control

- Role-based permissions for groups (owner/admin/member)
- Users can only access/modify their own data
- Protected routes require valid authentication
- Separate endpoint for sensitive operations (password changes)

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
- **bcryptjs 3.0.3** - Password hashing (12 salt rounds)
- **Axios 1.13.2** - TMDB API integration
- **Helmet 7.1.0** - Security headers middleware
- **express-rate-limit 7.1.5** - Rate limiting for brute force protection
- **validator 13.11.0** - Input validation and sanitization

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
NODE_ENV=development

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here

# PostgreSQL Configuration
POSTGRES_HOST=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=moviedb
POSTGRES_PORT=5432

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_secure_random_string_at_least_32_characters_long

# Vite Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001
```

**Important Security Notes:**

- Replace `your_tmdb_api_key_here` with your actual TMDB API key
- **CRITICAL**: Generate a strong JWT_SECRET using the command above
- JWT_SECRET must be at least 32 characters for security
- Never commit the `.env` file to version control
- Use different secrets for development/production

### 3. Generate Secure JWT Secret

```powershell
# Generate a cryptographically secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and use it as JWT_SECRET in your .env file
```

### 4. Start Docker Desktop

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
6. Apply security middleware (Helmet, rate limiting)
7. Validate JWT_SECRET length on startup

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

### Verify Security Setup

Check server logs for security confirmation:

```powershell
docker-compose logs server | Select-String "Security"

# You should see:
# 🔒 Security: Helmet enabled, Rate limiting active
# 🔑 JWT Secret: Configured ✓
```

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
  - Bcrypt password hashing (12 salt rounds)

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
- ✅ SQL injection protection via parameterized queries

---

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Rate Limiting

All API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Login (`/users/login`) | 5 attempts | 15 minutes |
| Registration (`/users/register`) | 3 accounts | 1 hour |
| Password Change (`/users/:id/password`) | 5 attempts | 1 hour |
| Account Deletion (`/users/:id`) | 5 attempts | 1 hour |
| General API | 100 requests | 15 minutes |

Rate limit headers are returned in responses:
- `RateLimit-Limit` - Maximum requests allowed
- `RateLimit-Remaining` - Requests remaining
- `RateLimit-Reset` - Seconds until limit resets

### Authentication Endpoints

#### User Management

- `POST /api/users/register` - Register new user (rate limited: 3/hour)
  - Body: `{ email, username, password }`
  - Password requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
  - Returns: User object (without password)

- `POST /api/users/login` - User login (rate limited: 5/15min)
  - Body: `{ email, password }`
  - Returns: `{ user, token }` (JWT token for authorization)
  - Token expires in 7 days
  - Refresh tokens: Not currently implemented. The server issues a single JWT access token (7d) and uses token blacklisting on logout. For production we recommend implementing rotating refresh tokens (stored in a secure httpOnly cookie and persisted server-side, e.g., Redis) to issue short-lived access tokens and support safe token rotation/revocation.

- `POST /api/users/logout` - Logout user (blacklist token)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message
  - Invalidates the current token immediately

- `GET /api/users/me` - Get current logged-in user (protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Current user profile

- `GET /api/users/:id` - Get user profile (protected)
  - Headers: `Authorization: Bearer <token>`
  - Access control: Users can only view their own profile
  - Returns: User profile data

- `PUT /api/users/:id` - Update user profile (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: Fields to update (email, username)
  - Access control: Users can only update their own profile
  - Input validation: Email format, username format (alphanumeric + underscores)
  - Returns: Updated user

- `PUT /api/users/:id/password` - Change password (protected, rate limited: 5/hour)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ oldPassword, newPassword }`
  - Access control: Users can only change their own password
  - Validates: Current password, new password strength, prevents password reuse
  - Returns: Success message

- `DELETE /api/users/:id` - Delete account (protected, rate limited: 5/hour)
  - Headers: `Authorization: Bearer <token>`
  - Access control: Users can only delete their own account
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
  - Query params: `page`, `limit`, `media_type` (required: 'movie' or 'tv')

- `GET /api/reviews/movie/:movieId/average` - Get average rating
  - Query params: `media_type` (required: 'movie' or 'tv')

- `GET /api/reviews/user/:userId` - Get user's reviews
  - Query params: `page`, `limit`

- `GET /api/reviews/:reviewId/replies` - Get all replies for a review

**Protected Endpoints:**
- `POST /api/reviews` - Create review (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ user_id, movie_external_id, media_type, rating, review_text }`
  - Validation: Rating 1-5, media_type 'movie' or 'tv'

- `POST /api/replies` - Create reply to review (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ review_id, user_id, content, parent_comment_id }`

- `PUT /api/reviews/:id` - Update review (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ rating, review_text }`
  - Access control: Users can only update their own reviews

- `DELETE /api/reviews/:id` - Delete review (protected)
  - Headers: `Authorization: Bearer <token>`
  - Access control: Users can only delete their own reviews

### Group Endpoints (Protected)

**Group Management:**

- `GET /api/groups/groups` - Get all public groups

- `GET /api/groups/my` - Get user's groups (member or owner)
  - Headers: `Authorization: Bearer <token>`

- `GET /api/groups/groups/:id` - Get single group details (members only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Group with members array

- `POST /api/groups/groups` - Create new group
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, description }`

- `PUT /api/groups/groups/:id` - Update group (owner only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name?, description?, isVisible? }`

- `DELETE /api/groups/groups/:id` - Delete group (owner only)
  - Headers: `Authorization: Bearer <token>`

**Membership Management:**

- `POST /api/groups/:id/members` - Add member to group (owner only)
  - Headers: `Authorization: Bearer <token>`
  - Query params: `userId`

- `DELETE /api/groups/:id/members` - Remove member from group (owner only)
  - Headers: `Authorization: Bearer <token>`
  - Query params: `userId`

- `DELETE /api/groups/:id/leave` - Leave group (members only)
  - Headers: `Authorization: Bearer <token>`
  - Note: Owners cannot leave (must transfer ownership or delete group)

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
  - Body: `{ movie_external_id, position }`

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
│   │   │   ├── AddToGroupModal.jsx   # Modal to add movies to groups
│   │   │   ├── AppNotification.jsx   # Global notification component
│   │   │   ├── GetCast.jsx           # Cast search with debounce                         Props: onSelect (callback), disabled (boolean)
│   │   │   ├── GetGenre.jsx          # Genre dropdown component.                         Props: onSelect (callback), selectedGenre (id), mediaType ('movie'|'tv')
│   │   │   ├── GetImage.jsx          # TMDB image component with configurable size.      Props: path (string), title (string), size (string), style (object), onClick (function)
│   │   │   ├── GetMoviesSeries.jsx   # Grid/list component for movies/TV shows.     (1/2)Props: type (string), page (number), pages (number),
│   │   │   │                                                                        (2/2)Props: imageSize (string), limit (number), query (string), discoverParams (object)
│   │   │   ├── GroupList.jsx         # Group list / preview component
│   │   │   ├── Navbar.jsx            # Main navigation bar with search
│   │   │   ├── ReplyForm.jsx         # Form for replying to reviews/comments
│   │   │   ├── ReplyThread.jsx       # Nested reply display component
│   │   │   ├── SearchBar.jsx         # Search input with dropdown suggestions.           Props: onSearch (callback)
│   │   │   └── ShareModal.jsx        # Modal to share favorite lists or links
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
│   │   ├── groupRouter.js            # Group routes with role-based access
│   │   ├── healthRouter.js           # Health check endpoint
│   │   ├── movieRouter.js            # Movie TMDB API routes
│   │   ├── replyRouter.js            # Review reply routes
│   │   ├── reviewRouter.js           # Review CRUD routes
│   │   ├── searchRouter.js           # Search and trending routes
│   │   ├── tvRouter.js               # TV show TMDB API routes
│   │   └── userRouter.js             # User authentication routes with rate limiting
│   ├── controllers/                  # Request handlers
│   │   ├── favoriteListController.js # Favorite list logic.                    Functions: createList, getUserLists, getListItems, addItemToList, deleteItem          
│   │   ├── genreController.js        # Genre fetching and TV discovery         Functions: getMovieGenres, getTVGenres, discoverTV
│   │   ├── groupController.js        # Group logic with access control    (1/2)Functions: createGroup, getGroupById, getGroups, getMyGroups, updateGroup, deleteGroup,
│   │   │                                                                  (2/2)Functions: addMember, removeMember, leaveGroup, requestJoin, getJoinRequests, acceptJoin, rejectJoin
│   │   ├── groupMovieController.js   # Group movie management                  Functions: addMovieToGroup, removeMovieFromGroup, getMoviesInGroup
│   │   ├── replyController.js        # Review reply logic                      Functions: createReply, getRepliesByReviewId
│   │   ├── reviewController.js       # Review CRUD operations             (1/2)Functions: createReview, getReviewsByMovieId, getReviewsByUserId, 
│   │   │                                                                  (2/2)Functions: updateReview, deleteReview, getMovieAverageRating
│   │   ├── searchController.js       # Search and trending logic          (1/2)Functions: multiSearch, searchPerson, getPersonById,
│   │   │                                                                  (2/2)Functions: getPersonMovieCredits, getPersonTVCredits, getTrending
│   │   ├── TMDBMovieController.js    # TMDB movie API handlers            (1/3)Functions: getMovieById, getMoviesByType, searchMovies,
│   │   │                                                                  (2/3)Functions: getMovieCredits, getMovieVideos, getSimilarMovies,
│   │   │                                                                  (3/3)Functions: getMovieRecommendations, getMovieGenres, discoverMovies
│   │   ├── TMDBTVController.js       # TMDB TV API handlers               (1/2)Functions: getTVById, getTVByType, searchTV, getTVSeason, getTVCredits,
│   │   │                                                                  (2/2)Functions: getTVVideos, getSimilarTV, getTVRecommendations, discoverTV        
│   │   └── userController.js         # User authentication handlers       (1/2)Functions: createUser, userLogin, getUserById, updateUser, 
│   │                                                                      (2/2)Functions: updatePassword, deleteUser (with input validation & access control)
│   ├── models/                       # Database models
│   │   ├── favoriteItemModel.js      # Favorite list items CRUD                Functions: addFavoriteItem, getFavoriteItemsByList, deleteFavoriteItem
│   │   ├── favoriteListModel.js      # Favorite lists CRUD                     Functions: createFavoriteList, getFavoriteListsByUser, getFavoriteListById, deleteFavoriteList
│   │   ├── groupModel.js             # Group database operations          (1/2)Functions: createGroup, getGroupById, getGroups, getGroupsForUser, isUserInGroup,
│   │   │                                                                  (2/2)Functions: updateGroup, deleteGroup, addMember, removeMember, createJoinRequest, getJoinRequests, acceptJoinRequest, rejectJoinRequest
│   │   ├── groupMovieModel.js        # Group movies CRUD                       Functions: addMovie, removeMovie, getGroupMovies    
│   │   └── userModel.js              # User database operations           (1/2)Functions: createUser, getUserByEmail, getUserById, getUserByIdWithPassword_hash,
│   │                                                                      (2/2)Functions: updateUser, updateUserPassword, deleteUserById
│   ├── services/                     # Business logic layer
│   │   ├── groupService.js           # Group business logic               (1/2)Functions: createGroup, getGroupById, getGroups, updateGroup, deleteGroup,
│   │   │                                                                  (2/2)Functions: addMember, removeMember, createJoinRequest, getJoinRequests, acceptJoin, rejectJoin, getUserGroups
│   │   ├── groupMovieService.js      # Group movie business logic              Functions: addMovie, removeMovie, getMovies
│   │   ├── passwordValidator.js      # Password validation (deprecated)        Functions: validatePassword
│   │   └── userService.js            # User authentication logic          (1/2)Functions: registerUser, loginUser, getUserProfile, updateUserProfile,
│   │                                                                      (2/2)Functions: changeUserPassword, deleteUserFromDb (with security validations)
│   ├── helpers/                      # Helper functions and middleware
│   │   ├── auth.js                   # JWT authentication middleware           Features: Token verification, blacklisting, expiration check
│   │   ├── db.js                     # PostgreSQL connection pool
│   │   ├── groupRoles.js             # Group role-based access control         Middleware: requireOwner, requireMemberOrOwner
│   │   ├── rateLimiter.js            # Rate limiting configuration             Limiters: loginLimiter, registerLimiter, apiLimiter, sensitiveOperationLimiter
│   │   ├── tmdbHelper.js             # TMDB API request wrapper                Function: tmdbRequest(endpoint, params)
│   │   └── validation.js             # Input validation & sanitization         Functions: validateEmail, validateUsername, validatePassword, validateId, validatePagination, sanitizeString
│   ├── Dockerfile
│   ├── Dockerfile.railway
│   ├── index.js                      # Server entry point                      Configures Express, CORS, Helmet, rate limiting, routes, error handling
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
- **Secure user authentication system** with JWT and bcrypt
- **Advanced security features**:
  - Rate limiting on all critical endpoints
  - Token blacklisting for logout
  - Strong password validation (12+ chars)
  - Input sanitization and validation
  - Helmet.js security headers
  - HTTPS redirect in production
- **Advanced discovery page** with genre, year, cast, and sort filters
- **Search functionality** with dropdown suggestions and multi-search
- **Detailed movie/TV pages** with trailers, cast, and recommendations
- **Reviews system** with full CRUD operations
- **Groups functionality** with complete join request workflow
- **Role-based access control** for groups (owner/admin/member)
- **Favorite lists** with backend infrastructure
- **Responsive UI** with modern dark theme
- **Person search** and credits viewing
- **Trending content** tracking
- **Password change functionality** with security validations

### 🚧 In Progress

- Group movie collections UI integration
- Account page enhancements
- Account management improvements
- Review UI components
- Favorite list management UI
- Group detail page improvements
- Movie detail page buttons

### 📋 Planned Features

- Password reset functionality via email
- Movie watchlist
- Mobile-optimized UI/UX
- Two-factor authentication (2FA)
- Redis-based token blacklist for production
- Account lockout after failed attempts
- Security event logging and monitoring

---

## Development Workflow

### Making Changes

1. **Backend changes** - Edit files in `server/` directory
   - Nodemon automatically restarts the server
   - Check security validations are in place

2. **Frontend changes** - Edit files in `client/src/` directory
   - Vite HMR updates the browser automatically

3. **Database changes** - Edit `init_moviedb.sql`
   - Requires container restart: `docker-compose down -v && docker-compose up --build`

4. **Security changes** - Update rate limits or validation rules
   - Edit `helpers/rateLimiter.js` or `helpers/validation.js`
   - Test with multiple requests to verify limits work

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

# Check for security events
docker-compose logs server | Select-String "Rate"
docker-compose logs server | Select-String "Security"
```

### Testing Security Features

```powershell
# Test rate limiting (try 6 login attempts rapidly)
for ($i=1; $i -le 6; $i++) {
    curl -Method POST http://localhost:3001/api/users/login `
         -Headers @{"Content-Type"="application/json"} `
         -Body '{"email":"test@test.com","password":"wrong"}'
}

# Test token blacklisting
# 1. Login and save token
$response = curl -Method POST http://localhost:3001/api/users/login `
                 -Headers @{"Content-Type"="application/json"} `
                 -Body '{"email":"user@test.com","password":"correct"}' | ConvertFrom-Json
$token = $response.token

# 2. Use token (should work)
curl http://localhost:3001/api/users/me `
     -Headers @{"Authorization"="Bearer $token"}

# 3. Logout (blacklist token)
curl -Method POST http://localhost:3001/api/users/logout `
     -Headers @{"Authorization"="Bearer $token"}

# 4. Try to use token again (should fail)
curl http://localhost:3001/api/users/me `
     -Headers @{"Authorization"="Bearer $token"}
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

# Check if security packages are installed
docker-compose exec server npm list helmet express-rate-limit validator
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

**JWT_SECRET too short:**

```
Server will not start if JWT_SECRET is less than 32 characters.
Generate a new one with:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Rate limit errors (429):**

- This is expected behavior when too many requests are made
- Wait for the window to reset (check `RateLimit-Reset` header)
- Adjust limits in `helpers/rateLimiter.js` if needed for development

**"Access denied" errors:**

- Verify JWT token is valid and not expired
- Check if token was blacklisted (after logout)
- Ensure user ID in URL matches logged-in user ID
- Token expires after 7 days - login again if expired

---

## Security Best Practices

### For Development

- ✅ Never commit `.env` file to git
- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Test rate limiting during development
- ✅ Validate all user inputs
- ✅ Use parameterized queries (already implemented)
- ✅ Keep dependencies updated

### For Production

- ✅ Set `NODE_ENV=production`
- ✅ Use HTTPS only (Railway/hosting provides this)
- ✅ Enable HTTPS redirect (already implemented)
- ✅ Use environment-specific secrets
- ✅ Set up database backups
- ✅ Monitor rate limit hits
- ✅ Consider Redis for token blacklist
- ✅ Review CORS allowed origins
- ✅ Enable database SSL connections
- ✅ Set up security logging

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

**Last Updated:** December 13, 2024 (Added comprehensive security features)
