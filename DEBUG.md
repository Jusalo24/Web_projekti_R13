# Debugging Guide

Comprehensive troubleshooting guide for common development issues in the Movie Project R13.

---

## Table of Contents
- [Quick Diagnostics](#quick-diagnostics)
- [Testing Issues](#testing-issues)
- [Docker Issues](#docker-issues)
- [Database Issues](#database-issues)
- [Backend Server Issues](#backend-server-issues)
- [Frontend Issues](#frontend-issues)
- [Network & Connection Issues](#network--connection-issues)
- [TMDB API Issues](#tmdb-api-issues)
- [Environment Variable Issues](#environment-variable-issues)
- [Performance Issues](#performance-issues)

---

## Quick Diagnostics

### Check All Services Status

```powershell
# Check if all containers are running
docker-compose ps

# Expected output should show 3 running containers:
# - web_projekti_r13-db-1 (Up)
# - web_projekti_r13-server-1 (Up)
# - web_projekti_r13-client-1 (Up)
```

### Run Automated Tests

```powershell
# Quick health check
curl http://localhost:3001/health

# Run full test suite (69 tests)
.\Test-Backend.ps1

# Expected: 69/69 tests passing
```

### View Recent Logs

```powershell
# All services
docker-compose logs --tail=50

# Specific service
docker-compose logs --tail=50 server
docker-compose logs --tail=50 client
docker-compose logs --tail=50 db
```

### Quick Restart

```powershell
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart server
```

---

## Testing Issues

### Issue: Test Script Won't Run

**Symptom:**
```
Test-Backend.ps1 cannot be loaded because running scripts is disabled
```

**Solution:**

```powershell
# One-time fix: Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run tests
.\Test-Backend.ps1
```

### Issue: Tests Fail - "Server Not Running"

**Symptom:**
```
X ERROR: Server is not running at http://localhost:3001/health
```

**Solution:**

```powershell
# 1. Start Docker containers
docker-compose up -d

# 2. Wait for services to start (30 seconds)
Start-Sleep -Seconds 30

# 3. Verify server is running
docker-compose ps server
curl http://localhost:3001/health

# 4. Run tests again
.\Test-Backend.ps1
```

### Issue: Tests Fail - Authentication Issues

**Symptom:**
```
X FAILED - User Registration
X FAILED - Wrong Password Login
```

**Solution:**

```powershell
# 1. Check if .env has JWT_SECRET
cat .env | Select-String "JWT_SECRET"

# 2. Verify database is running
docker-compose ps db

# 3. Restart server
docker-compose restart server

# 4. Run tests again
.\Test-Backend.ps1
```

### Issue: Tests Fail - TMDB API Errors

**Symptom:**
```
X FAILED - Search Movies
{"status_code":7,"status_message":"Invalid API key"}
```

**Solution:**

```powershell
# 1. Verify TMDB_API_KEY in .env
cat .env | Select-String "TMDB_API_KEY"

# 2. Test API key directly
curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY"

# 3. Restart server to reload env vars
docker-compose restart server

# 4. Run tests again
.\Test-Backend.ps1
```

### Issue: Test Script Has Warnings

**Symptom:**
```
PSScriptAnalyzer found warnings in Test-Backend.ps1
```

**Solution:**

```powershell
# Install PSScriptAnalyzer
Install-Module -Name PSScriptAnalyzer -Force -Scope CurrentUser

# Check for issues
Invoke-ScriptAnalyzer -Path .\Test-Backend.ps1

# The current script should have zero warnings
# If warnings appear, check for:
# - Write-Host usage (should use Write-Information)
# - Unapproved verbs (use approved PowerShell verbs)
# - Global variables (should be script-scoped)
```

### Issue: Cannot Save Test Results

**Symptom:** Redirect to file fails or creates empty file

**Solution:**

```powershell
# Use proper output redirection
.\Test-Backend.ps1 > test-results.txt

# Or use Tee-Object to see output AND save
.\Test-Backend.ps1 | Tee-Object -FilePath test-results.txt

# Check file was created
Get-Content test-results.txt
```

### Issue: Tests Timeout

**Symptom:** Tests hang or timeout waiting for responses

**Solution:**

```powershell
# 1. Check if server is responsive
curl http://localhost:3001/health

# 2. Check server logs for errors
docker-compose logs server --tail=50

# 3. Increase timeout in test script (if needed)
# Edit Test-Backend.ps1 and change:
# -DefaultTimeoutSec 30  →  -DefaultTimeoutSec 60

# 4. Restart services
docker-compose restart
```

---

## Docker Issues

### Issue: "Port is already allocated"

**Symptom:**
```
Error: bind: address already in use
```

**Solution:**

```powershell
# Find what's using the port
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :5432

# Kill the process (replace <PID> with the actual process ID)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
# Example: "3002:3001" instead of "3001:3001"
```

### Issue: "Cannot connect to Docker daemon"

**Symptom:**
```
error during connect: This error may indicate that the docker daemon is not running
```

**Solution:**

1. Open Docker Desktop
2. Wait for it to fully start (whale icon should be steady)
3. In PowerShell, verify:
   ```powershell
   docker ps
   ```

### Issue: Containers Won't Start

**Symptom:** Containers exit immediately or show "Exited (1)" status

**Solution:**

```powershell
# Check logs for error messages
docker-compose logs server
docker-compose logs client

# Common fixes:
# 1. Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up

# 2. Check for syntax errors in code
# 3. Verify environment variables in .env
# 4. Check Dockerfile configuration

# 5. After fixing, run tests
.\Test-Backend.ps1
```

### Issue: "No space left on device"

**Symptom:** Build fails with disk space error

**Solution:**

```powershell
# Remove unused Docker resources
docker system prune -a --volumes

# Warning: This removes ALL unused containers, images, and volumes
# Backup any important data first!

# More conservative approach (removes only stopped containers and unused images)
docker container prune
docker image prune
```

### Issue: Changes Not Reflecting

**Symptom:** Code changes don't appear in running application

**Solution:**

```powershell
# For backend changes (if nodemon isn't working):
docker-compose restart server

# For frontend changes (if HMR isn't working):
docker-compose restart client

# For dependency changes (package.json):
docker-compose down
docker-compose build --no-cache
docker-compose up

# Verify changes with tests
.\Test-Backend.ps1
```

---

## Database Issues

### Issue: Database Connection Failed

**Symptom:**
```
Error: connect ECONNREFUSED
FATAL: password authentication failed
```

**Solution:**

```powershell
# 1. Verify database is running
docker-compose ps db

# 2. Check database logs
docker-compose logs db

# 3. Verify credentials in .env match docker-compose.yml
# POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

# 4. Test connection manually
docker-compose exec db psql -U postgres -d moviedb

# 5. If connection string is wrong in server code, use:
# Host: db (NOT localhost when inside Docker)
# Port: 5432
# Example: postgresql://postgres:postgres@db:5432/moviedb

# 6. Test database connectivity via tests
.\Test-Backend.ps1
```

### Issue: Tables Don't Exist

**Symptom:**
```
ERROR: relation "users" does not exist
```

**Solution:**

```powershell
# 1. Connect to database
docker-compose exec db psql -U postgres -d moviedb

# 2. Check if tables exist
\dt

# 3. If no tables, the init script didn't run. Manually run it:
# (Stay in psql)
# Copy and paste contents from init_moviedb.sql

# 4. Or restart with volume removed
docker-compose down -v
docker-compose up

# 5. Verify tables exist
docker-compose exec db psql -U postgres -d moviedb -c "\dt"

# 6. Run tests to verify database is working
.\Test-Backend.ps1
```

### Issue: Database Schema Out of Sync

**Symptom:** Old schema, missing columns, or outdated constraints

**Solution:**

```powershell
# Option 1: Fresh start (DESTROYS ALL DATA)
docker-compose down -v
docker-compose up --build

# Option 2: Run migration manually
docker-compose exec db psql -U postgres -d moviedb

# Then paste the specific ALTER commands or new schema
# Example:
# ALTER TABLE users ADD COLUMN new_field VARCHAR(100);

# Verify with tests
.\Test-Backend.ps1
```

### Issue: Cannot Delete Database Volume

**Symptom:**
```
Error response from daemon: remove web_projekti_r13_pgdata: volume is in use
```

**Solution:**

```powershell
# Stop all containers first
docker-compose down

# Then remove volume
docker volume rm web_projekti_r13_pgdata

# Or force remove all
docker-compose down -v
```

### Issue: UUID Extension Not Found

**Symptom:**
```
ERROR: function uuid_generate_v4() does not exist
```

**Solution:**

```powershell
# The init script should create this, but if missing:
docker-compose exec db psql -U postgres -d moviedb

# In psql:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## Backend Server Issues

### Issue: Server Won't Start

**Symptom:**
```
Error: Cannot find module 'express'
```

**Solution:**

```powershell
# 1. Check if node_modules exists in container
docker-compose exec server ls -la node_modules

# 2. Rebuild with clean install
docker-compose down
docker-compose build --no-cache server
docker-compose up

# 3. Verify server is running
curl http://localhost:3001/health

# 4. Run tests
.\Test-Backend.ps1
```

### Issue: "Module Not Found" Error

**Symptom:**
```
Error: Cannot find module './routes/movieRouter.js'
```

**Solution:**

```powershell
# 1. Check if file exists
docker-compose exec server ls -la routes/

# 2. Verify import path syntax
# ES6: import movieRouter from './routes/movieRouter.js'
# Note: .js extension is REQUIRED for ES6 modules

# 3. Check package.json has "type": "module"

# 4. Verify file is being copied to container (check Dockerfile)

# 5. Test with automated tests
.\Test-Backend.ps1
```

### Issue: Nodemon Not Restarting

**Symptom:** Changes to server code don't trigger restart

**Solution:**

```powershell
# 1. Check nodemon is installed
docker-compose exec server npm list nodemon

# 2. Verify volume mapping in docker-compose.yml
# Should have: - ./server:/app

# 3. Check nodemon config (if exists)
# or add to package.json:
# "nodemonConfig": {
#   "watch": ["*.js"],
#   "ext": "js,json"
# }

# 4. Manual restart as workaround
docker-compose restart server

# 5. Verify with tests
.\Test-Backend.ps1
```

### Issue: CORS Errors

**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

In `server/index.js`, ensure CORS is properly configured:

```javascript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));
```

Test CORS with curl:
```powershell
curl -H "Origin: http://localhost:5173" http://localhost:3001/api/movies/550
```

### Issue: JWT Token Errors

**Symptom:**
```
JsonWebTokenError: invalid signature
```

**Solution:**

```powershell
# 1. Verify JWT_SECRET is set in .env
cat .env | Select-String "JWT_SECRET"

# 2. Ensure same secret is used for signing and verifying

# 3. Restart server after changing JWT_SECRET
docker-compose restart server

# 4. Clear browser cookies/localStorage

# 5. Run authentication tests
.\Test-Backend.ps1
```

### Issue: API Endpoints Return 404

**Symptom:** All API calls return 404 Not Found

**Solution:**

```powershell
# 1. Check server logs for route registration
docker-compose logs server | Select-String "route"

# 2. Verify routers are imported in index.js
# Should have: app.use('/api', movieRouter)

# 3. Check route path in router files
# Should be: router.get('/movies/:id', ...) not router.get('/api/movies/:id', ...)

# 4. Test health endpoint first
curl http://localhost:3001/health

# 5. Run full test suite to identify issues
.\Test-Backend.ps1
```

---

## Frontend Issues

### Issue: Frontend Won't Load

**Symptom:** Blank page or connection refused at http://localhost:5173

**Solution:**

```powershell
# 1. Check if client container is running
docker-compose ps client

# 2. Check client logs
docker-compose logs client

# 3. Common issues:
# - Syntax error in JSX
# - Missing dependency
# - Vite config error

# 4. Rebuild
docker-compose restart client

# 5. Hard refresh browser (Ctrl + Shift + R)
```

### Issue: Vite HMR Not Working

**Symptom:** Changes to React components don't reflect in browser

**Solution:**

```powershell
# 1. Check browser console for HMR errors

# 2. Verify vite.config.js has proper server config:
# export default defineConfig({
#   plugins: [react()],
#   server: {
#     host: '0.0.0.0',
#     port: 5173,
#     watch: {
#       usePolling: true // Important for Docker on Windows
#     }
#   }
# })

# 3. Hard refresh browser (Ctrl + Shift + R)

# 4. Restart client
docker-compose restart client
```

### Issue: "React is not defined"

**Symptom:**
```
ReferenceError: React is not defined
```

**Solution:**

In React 19, you don't need to import React in every file, but if error persists:

```javascript
// Add to files with JSX:
import React from 'react';
```

Or ensure vite.config.js has:
```javascript
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Issue: Router Not Working

**Symptom:** 404 errors or routes not rendering

**Solution:**

```javascript
// Ensure App.jsx has proper router setup:
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Network & Connection Issues

### Issue: Client Can't Reach Server

**Symptom:**
```
AxiosError: Network Error
ERR_CONNECTION_REFUSED
```

**Solution:**

```powershell
# 1. Verify server is running
docker-compose ps server

# 2. Check server is listening
docker-compose logs server | Select-String "listening"

# 3. Test server directly
curl http://localhost:3001/health

# 4. Test API endpoint
curl http://localhost:3001/api/movies/550

# 5. Check API URL in frontend code
# Should be: http://localhost:3001 (not http://server:3001)

# 6. Verify CORS is enabled on server

# 7. Run tests to verify all endpoints
.\Test-Backend.ps1
```

### Issue: Server Can't Reach Database

**Symptom:**
```
Error: getaddrinfo ENOTFOUND db
```

**Solution:**

```powershell
# From server code, use hostname 'db' NOT 'localhost'
# Correct: postgresql://postgres:postgres@db:5432/moviedb
# Wrong: postgresql://postgres:postgres@localhost:5432/moviedb

# Docker Compose creates network, use service names as hostnames

# Verify network exists
docker network ls

# Check if containers are on same network
docker-compose exec server ping db

# Test with backend tests
.\Test-Backend.ps1
```

### Issue: Cannot Access Application from Another Device

**Symptom:** Works on localhost but not from other devices on network

**Solution:**

```powershell
# 1. Find your local IP address
ipconfig | Select-String "IPv4"

# 2. Update vite.config.js (already done if using --host flag)
# server: { host: '0.0.0.0' }

# 3. Access from other device using:
# http://<your-ip>:5173

# 4. Ensure Windows Firewall allows connections
```

---

## TMDB API Issues

### Issue: "Invalid API Key"

**Symptom:**
```
{"success":false,"status_code":7,"status_message":"Invalid API key"}
```

**Solution:**

```powershell
# 1. Verify API key in .env is correct
cat .env | Select-String "TMDB_API_KEY"
# No quotes, no extra spaces

# 2. Ensure .env is being loaded
docker-compose logs server | Select-String "TMDB"

# 3. Restart server after changing .env
docker-compose restart server

# 4. Test API key directly:
curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY"

# 5. Run TMDB-related tests
.\Test-Backend.ps1
```

### Issue: Rate Limit Exceeded

**Symptom:**
```
{"status_code":25,"status_message":"Your request count (41) is over the allowed limit of 40."}
```

**Solution:**

```javascript
// Implement rate limiting in your API service
// Add delay between requests
// Cache frequently accessed data

// Example:
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchMovies() {
  await delay(250); // 4 requests per second max
  return axios.get(url);
}
```

### Issue: 404 Not Found from TMDB

**Symptom:**
```
{"status_code":34,"status_message":"The resource you requested could not be found."}
```

**Solution:**

```javascript
// 1. Verify endpoint URL is correct
// Correct: https://api.themoviedb.org/3/movie/popular
// Wrong: https://api.themoviedb.org/movie/popular (missing /3/)

// 2. Check if movie ID exists
// 3. Verify URL parameters are correct
```

Test TMDB endpoints:
```powershell
# Test with test suite
.\Test-Backend.ps1

# Manual test
curl http://localhost:3001/api/movies/550
```

---

## Environment Variable Issues

### Issue: Environment Variables Not Loading

**Symptom:** `undefined` values or "API key not found"

**Solution:**

```powershell
# 1. Verify .env file exists in correct location
Test-Path .\.env

# 2. Check .env syntax (no quotes, no spaces around =)
# Correct: TMDB_API_KEY=abc123
# Wrong: TMDB_API_KEY = "abc123"

# 3. Verify .env is listed in docker-compose.yml
# env_file:
#   - ./.env

# 4. Restart after changes
docker-compose down
docker-compose up

# 5. Test inside container
docker-compose exec server printenv | Select-String "TMDB"

# 6. Verify with tests
.\Test-Backend.ps1
```

### Issue: Wrong Environment in Production

**Symptom:** Development settings used in production

**Solution:**

```powershell
# Use separate .env files:
# .env.development
# .env.production

# In docker-compose.yml, specify:
# env_file:
#   - ./.env.${NODE_ENV}

# Or use environment-specific compose files:
docker-compose -f docker-compose.prod.yml up
```

---

## Performance Issues

### Issue: Slow Database Queries

**Symptom:** API responses take several seconds

**Solution:**

```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@test.com';

-- Add missing indexes
CREATE INDEX idx_table_column ON table_name(column_name);

-- Check existing indexes
\di
```

Test query performance:
```powershell
# Time API calls
Measure-Command { curl http://localhost:3001/api/movies/search?q=inception }

# Run performance tests
.\Test-Backend.ps1
```

### Issue: Container Using Too Much Memory

**Symptom:** Docker Desktop shows high memory usage

**Solution:**

```powershell
# Check resource usage
docker stats

# Limit container memory in docker-compose.yml:
# services:
#   server:
#     mem_limit: 512m
#     cpus: 0.5

# Restart Docker Desktop if memory leak suspected
```

### Issue: Build Takes Forever

**Symptom:** `docker-compose build` is very slow

**Solution:**

```powershell
# Use Docker BuildKit
$env:DOCKER_BUILDKIT=1
docker-compose build

# Check .dockerignore includes:
# - node_modules
# - .git
# - dist

# Use smaller base image
# FROM node:22-alpine (not node:22)
```

---

## General Debugging Tips

### Enable Debug Logging

**Backend:**
```javascript
// In index.js or specific route
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Frontend:**
```javascript
// In API service
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

### Check Container Shell

```powershell
# Access server container shell
docker-compose exec server sh

# Inside container:
ls -la                    # List files
cat .env                  # View environment
npm list                  # List installed packages
node --version           # Check Node version
exit                     # Exit shell
```

### Test Database Manually

```powershell
docker-compose exec db psql -U postgres -d moviedb

# Useful psql commands:
\dt                      # List tables
\d users                 # Describe users table
SELECT * FROM users;     # Query data
\q                       # Quit
```

### Run Automated Tests First

Before deep debugging, always run the automated test suite:

```powershell
# Run all 69 tests
.\Test-Backend.ps1

# This will quickly identify:
# - Which endpoints are broken
# - Authentication issues
# - Database connectivity problems
# - TMDB API issues
# - Error handling bugs
```

### Fresh Start Checklist

When nothing else works:

```powershell
# 1. Stop everything
docker-compose down -v

# 2. Clean Docker
docker system prune -a
docker volume prune

# 3. Delete node_modules locally (if any)
Remove-Item -Recurse -Force node_modules

# 4. Rebuild from scratch
docker-compose build --no-cache
docker-compose up

# 5. Check all services are running
docker-compose ps

# 6. Wait for startup (30 seconds)
Start-Sleep -Seconds 30

# 7. Run tests to verify everything works
.\Test-Backend.ps1
```

---

## Getting Help

If you're still stuck:

1. **Run automated tests first:** `.\Test-Backend.ps1`
2. **Check logs:** `docker-compose logs`
3. **Search error message** on Google/Stack Overflow
4. **Read documentation** for the specific technology
5. **Ask team members** - they might have seen it before
6. **Create a GitHub issue** with:
   - What you tried to do
   - What actually happened
   - Error messages
   - Test results from `Test-Backend.ps1`
   - Output of `docker-compose ps` and `docker-compose logs`

---

**Last Updated:** November 18, 2025
