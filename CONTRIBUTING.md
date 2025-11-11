# Contributing to Movie Project R13

Thank you for contributing to our movie web application project! This guide will help you understand our development workflow and best practices.

---

## Table of Contents
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Git Workflow](#git-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Working with Docker](#working-with-docker)
- [Database Changes](#database-changes)
- [Testing](#testing)
- [Communication](#communication)

---

## Getting Started

Before you start contributing, make sure you have:

1. ✅ Completed the project setup as described in [README.md](./README.md)
2. ✅ Read the [Architecture Guide](./architecture_guide.md)
3. ✅ Joined the team communication channel
4. ✅ Been assigned or chosen a task to work on

---

## Development Workflow

### Running Individual Services

During development, you might want to run services separately for faster iteration:

#### Frontend Only
```bash
cd client
npm install
npm run dev
# Access at http://localhost:5173
```

#### Backend Only
```bash
cd server
npm install
npm run devStart
# API available at http://localhost:3001
```

#### Database Only
```bash
docker-compose up db
# PostgreSQL available at localhost:5432
```

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f db

# View last 50 lines
docker-compose logs --tail=50 server
```

### Accessing Containers

```bash
# Access server container shell
docker-compose exec server sh

# Access database container
docker-compose exec db psql -U postgres -d moviedb

# Access client container shell
docker-compose exec client sh

# Run commands in container
docker-compose exec server npm install new-package
```

### Hot Reloading

- **Frontend:** Vite provides automatic hot module replacement (HMR)
- **Backend:** Nodemon automatically restarts the server on file changes
- **Database:** Schema changes require manual migration (see [Database Changes](#database-changes))

---

## Git Workflow

### 1. Syncing Your Local Repository

Always start by syncing with the main branch:

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main
```

### 2. Creating a Feature Branch

Create a descriptive branch for your work:

```bash
# Branch naming convention: type/short-description
git checkout -b feature/movie-search
git checkout -b fix/login-bug
git checkout -b refactor/api-service
git checkout -b docs/update-readme
```

**Branch Naming Conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Adding or updating tests
- `style/` - Code style/formatting changes

### 3. Making Changes

Work on your changes, committing regularly:

```bash
# Check status
git status

# Stage changes
git add .
# Or stage specific files
git add src/components/MovieCard.jsx

# Commit with descriptive message
git commit -m "Add: movie search functionality with filters"
```

### 4. Keeping Your Branch Updated

Regularly sync with main to avoid conflicts:

```bash
# Fetch latest changes
git fetch origin main

# Rebase your branch on main
git rebase origin/main

# Or merge if you prefer
git merge origin/main
```

### 5. Pushing Your Changes

```bash
# Push to your feature branch
git push origin feature/movie-search

# If you rebased, you might need to force push (use with caution)
git push --force-with-lease origin feature/movie-search
```

### 6. Creating a Pull Request

1. Go to the [GitHub repository](https://github.com/Jusalo24/Web_projekti_R13)
2. Click "Pull Requests" → "New Pull Request"
3. Select your branch
4. Fill in the PR template:
   - **Title:** Clear, descriptive title
   - **Description:** What changes were made and why
   - **Related Issues:** Link any related issues
   - **Testing:** How to test the changes
   - **Screenshots:** If UI changes were made

---

## Code Style Guidelines

### JavaScript/React

```javascript
// ✅ Good: Use ES6+ features
const getMovies = async () => {
  const response = await fetch('/api/movies');
  return response.json();
};

// ✅ Good: Functional components with hooks
import { useState, useEffect } from 'react';

const MovieCard = ({ movie }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <div className="movie-card">
      <h3>{movie.title}</h3>
    </div>
  );
};

// ✅ Good: Destructuring props
const MovieList = ({ movies, onSelect }) => { /* ... */ };

// ❌ Bad: Class components (avoid unless necessary)
class MovieCard extends React.Component { /* ... */ }
```

### File Naming Conventions

```
✅ Components: PascalCase
   MovieCard.jsx
   UserProfile.jsx
   NavBar.jsx

✅ Utilities: camelCase
   formatDate.js
   apiClient.js
   validateEmail.js

✅ Constants: UPPER_SNAKE_CASE
   API_ENDPOINTS.js
   ERROR_MESSAGES.js

✅ CSS: kebab-case or match component
   movie-card.css
   MovieCard.css
```

### Component Structure

```javascript
// ✅ Good component structure
import { useState, useEffect } from 'react';
import './MovieCard.css';

const MovieCard = ({ movie, onFavorite }) => {
  // 1. State declarations
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Side effects
  useEffect(() => {
    // Component logic
  }, [movie]);
  
  // 3. Event handlers
  const handleClick = () => {
    onFavorite(movie.id);
  };
  
  // 4. Early returns for loading/error states
  if (isLoading) return <div>Loading...</div>;
  
  // 5. Main render
  return (
    <div className="movie-card" onClick={handleClick}>
      <img src={movie.poster} alt={movie.title} />
      <h3>{movie.title}</h3>
    </div>
  );
};

export default MovieCard;
```

### Backend Code Style

```javascript
// ✅ Good: Async/await with error handling
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await movieService.findById(id);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ Good: Separate concerns
// routes/movieRoutes.js → controller → service → database
```

### Error Handling

```javascript
// ✅ Always use try-catch for async operations
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}

// ✅ Provide meaningful error messages
if (!user) {
  throw new Error('User not found');
}

// ✅ Return consistent error responses
res.status(404).json({ 
  error: 'Resource not found',
  details: 'Movie with ID 123 does not exist'
});
```

---

## Commit Message Convention

Use clear, descriptive commit messages following this format:

### Format
```
Type: Brief description (50 chars or less)

Optional longer description explaining what and why
(wrap at 72 characters)
```

### Types

| Type | Usage | Example |
|------|-------|---------|
| `Add:` | New features or files | `Add: movie search functionality` |
| `Fix:` | Bug fixes | `Fix: login form validation error` |
| `Update:` | Updates to existing features | `Update: improve movie card styling` |
| `Refactor:` | Code refactoring | `Refactor: extract API calls to service layer` |
| `Remove:` | Removing code/files | `Remove: unused utility functions` |
| `Docs:` | Documentation only | `Docs: update API endpoint documentation` |
| `Style:` | Formatting, whitespace | `Style: format code with prettier` |
| `Test:` | Adding/updating tests | `Test: add unit tests for movie service` |
| `Chore:` | Maintenance tasks | `Chore: update dependencies` |

### Examples

```bash
# ✅ Good commits
git commit -m "Add: user authentication with JWT tokens"
git commit -m "Fix: movie poster images not loading on Safari"
git commit -m "Refactor: split monolithic component into smaller parts"
git commit -m "Update: improve error messages for API responses"
git commit -m "Docs: add JSDoc comments to utility functions"

# ❌ Bad commits (avoid these)
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "changes"
git commit -m "asdf"
```

### Multi-line Commits

For complex changes, add more detail:

```bash
git commit -m "Add: movie filtering and sorting

- Add filter by genre functionality
- Add sort by rating and release date
- Update UI to show active filters
- Add clear filters button

Closes #42"
```

---

## Pull Request Process

### Before Creating a PR

- [ ] Code follows our style guidelines
- [ ] All tests pass locally
- [ ] No console.log or debugging code left in
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] Tested in multiple browsers (if frontend)
- [ ] Database migrations tested (if applicable)

### PR Title Format

Use the same convention as commit messages:

```
Add: Movie search with filters
Fix: User authentication bug on login page
Update: Improve group creation form validation
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does and why.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation update
- [ ] Other (please describe)

## Changes Made
- Bullet point list of specific changes
- Another change
- And another

## How to Test
1. Step-by-step instructions
2. To test the changes
3. Including any setup needed

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
Related to #456

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex parts of my code
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested these changes locally
```

### Code Review Process

1. **At least one team member must review** before merging
2. **Address all review comments** before merging
3. **Reviewer responsibilities:**
   - Check code quality and style
   - Verify functionality
   - Suggest improvements
   - Approve when satisfied

4. **Author responsibilities:**
   - Respond to all comments
   - Make requested changes
   - Re-request review after changes

### Merging

- Use "Squash and merge" for cleaner history
- Delete branch after merging
- Pull latest main after your PR is merged

---

## Working with Docker

### Rebuilding After Changes

```bash
# Rebuild specific service
docker-compose build server
docker-compose build client

# Rebuild all services
docker-compose build

# Rebuild without cache (clean build)
docker-compose build --no-cache
```

### Managing Dependencies

```bash
# Add new npm package to backend
docker-compose exec server npm install package-name
docker-compose restart server

# Add new npm package to frontend
docker-compose exec client npm install package-name
docker-compose restart client

# Or rebuild after adding to package.json
docker-compose down
docker-compose build
docker-compose up
```

### Cleaning Up Docker

```bash
# Remove stopped containers
docker-compose down

# Remove containers and volumes (deletes database data!)
docker-compose down -v

# Clean up all unused Docker resources
docker system prune -a
```

---

## Database Changes

### Creating Migrations

When you need to change the database schema:

1. **Create a migration file:**
   ```bash
   # Name format: YYYYMMDD_description.sql
   touch server/database/migrations/20251111_add_movie_ratings.sql
   ```

2. **Write the migration:**
   ```sql
   -- server/database/migrations/20251111_add_movie_ratings.sql
   
   -- Add new column
   ALTER TABLE movies ADD COLUMN average_rating DECIMAL(3,2);
   
   -- Create index
   CREATE INDEX idx_movies_rating ON movies(average_rating);
   ```

3. **Test the migration:**
   ```bash
   # Run in database container
   docker-compose exec db psql -U postgres -d moviedb -f /app/migrations/20251111_add_movie_ratings.sql
   ```

4. **Document the change** in architecture_guide.md

### Rollback Strategy

Always create a rollback script:

```sql
-- server/database/migrations/20251111_add_movie_ratings_rollback.sql

-- Remove index
DROP INDEX IF EXISTS idx_movies_rating;

-- Remove column
ALTER TABLE movies DROP COLUMN IF EXISTS average_rating;
```

### Database Management Commands

```bash
# Backup database
docker-compose exec db pg_dump -U postgres moviedb > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T db psql -U postgres moviedb < backup_20251111.sql

# Reset database (WARNING: Deletes all data!)
docker-compose down -v
docker-compose up -d db
docker-compose exec db psql -U postgres -d moviedb -f /app/database/schema.sql

# View database size
docker-compose exec db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('moviedb'));"
```

---

## Testing

### Running Tests

```bash
# Backend tests (Mocha + Chai)
cd server
npm test

# Or in Docker
docker-compose exec server npm test

# Run specific test file
docker-compose exec server npm test -- tests/userService.test.js
```

### Writing Tests

```javascript
// Example test structure
import { expect } from 'chai';
import { getUserById } from '../services/userService.js';

describe('User Service', () => {
  describe('getUserById', () => {
    it('should return user when valid ID provided', async () => {
      const user = await getUserById(1);
      expect(user).to.have.property('id');
      expect(user.id).to.equal(1);
    });
    
    it('should return null when user not found', async () => {
      const user = await getUserById(99999);
      expect(user).to.be.null;
    });
  });
});
```

### Test Coverage Goals

- Aim for 70%+ code coverage
- All new features should include tests
- Critical paths must be tested

---

## Communication

### Team Coordination

- **Daily Updates:** Share what you're working on
- **Blockers:** Communicate issues early
- **Questions:** No question is too small - ask!
- **Code Reviews:** Respond within 24 hours

### Avoiding Conflicts

- **Communicate** what you're working on
- **Check** if someone is already working on similar feature
- **Update** the architecture guide when making structural changes
- **Sync** your branch regularly with main

### File Ownership

Track who is working on what to avoid merge conflicts:

| Component | Current Owner | Status |
|-----------|---------------|--------|
| Backend Routes | TBD | Planning |
| Frontend Components | TBD | In Progress |
| Database Schema | TBD | Completed |
| TMDB Integration | TBD | Planning |

*(Update this table as work progresses)*

---

## Questions or Issues?

- **Technical Questions:** Create a GitHub issue with the `question` label
- **Bugs:** Create a GitHub issue with the `bug` label
- **Feature Ideas:** Create a GitHub issue with the `enhancement` label
- **Team Communication:** Use your team's preferred communication channel

---

## Additional Resources

- [Architecture Guide](./architecture_guide.md)
- [React Best Practices](https://react.dev/learn)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Git Best Practices](https://www.git-scm.com/book/en/v2)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Remember:** Good code is code that is easy to read, maintain, and extend. When in doubt, ask your teammates!

**Last Updated:** November 11, 2025