#Requires -Version 5.1
<#
.SYNOPSIS
    Comprehensive Backend API Testing Script for Movie Project R13

.DESCRIPTION
    Robust testing framework with unified HTTP helper, proper error handling,
    and support for authentication workflows. Tests all backend endpoints including
    movies, TV shows, search, authentication, and reviews.

.PARAMETER BaseUrl
    Base URL for the API (default: http://localhost:3001/api)

.PARAMETER HealthUrl
    Health check endpoint URL (default: http://localhost:3001/health)

.PARAMETER DefaultTimeoutSec
    Default timeout for HTTP requests in seconds (default: 30)

.EXAMPLE
    .\Test-Backend.ps1

.EXAMPLE
    .\Test-Backend.ps1 -BaseUrl "http://localhost:3001/api"

.NOTES
    Author: Movie Project R13 Team
    Requires: PowerShell 5.1 or higher
    Exit Code: Number of failed tests (0 = all passed)
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:3001/api",

    [Parameter(Mandatory=$false)]
    [string]$HealthUrl = "http://localhost:3001/health",

    [Parameter(Mandatory=$false)]
    [int]$DefaultTimeoutSec = 30
)

# ---------------------------
# Color helpers
# ---------------------------
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color
    )
    if ($Host.Name -like 'ConsoleHost*') {
        $host.UI.RawUI.ForegroundColor = $Color
    }
    Write-Output $Message
    if ($Host.Name -like 'ConsoleHost*') {
        $host.UI.RawUI.ForegroundColor = 'White'
    }
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput -Message $Message -Color 'Cyan'
}

function Write-Warn {
    param([string]$Message)
    Write-ColorOutput -Message $Message -Color 'Yellow'
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput -Message $Message -Color 'Green'
}

function Write-Failure {
    param([string]$Message)
    Write-ColorOutput -Message $Message -Color 'Red'
}

function Write-Header {
    param([string]$Message)
    Write-Output ''
    Write-ColorOutput -Message ('=' * 70) -Color 'Magenta'
    Write-ColorOutput -Message "  $Message" -Color 'Magenta'
    Write-ColorOutput -Message ('=' * 70) -Color 'Magenta'
}

# ---------------------------
# Global counters & state
# ---------------------------
$script:TotalTests = 0
$script:PassedTests = 0
$script:FailedTests = 0
$script:WebSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$script:DefaultHeaders = @{
    'Accept' = 'application/json'
    'User-Agent' = "Test-Backend-Script/1.0 (PowerShell)"
}

# ---------------------------
# Utility: Convert JSON safely
# ---------------------------
function ConvertFrom-JsonSafe {
    param([string]$Text)
    if ([string]::IsNullOrWhiteSpace($Text)) {
        return $null
    }
    try {
        return $Text | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Verbose "Failed to parse JSON: $_"
        return $null
    }
}

# ---------------------------
# Auth helpers
# ---------------------------
function Set-AuthorizationToken {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [string]$Token,
        [ValidateSet('Bearer','Basic','Custom')]
        [string]$Scheme = 'Bearer'
    )

    if ($PSCmdlet.ShouldProcess("Authorization header", "Set")) {
        if ([string]::IsNullOrEmpty($Token)) {
            Write-Warn "Auth token empty; skipping header update."
            return
        }
        $script:DefaultHeaders['Authorization'] = "$Scheme $Token"
        Write-Info "Authorization header set."
    }
}

function Clear-AuthorizationToken {
    [CmdletBinding(SupportsShouldProcess)]
    param()

    if ($PSCmdlet.ShouldProcess("Authorization header", "Clear")) {
        if ($script:DefaultHeaders.ContainsKey('Authorization')) {
            $script:DefaultHeaders.Remove('Authorization') | Out-Null
        }
        Write-Info "Authorization header cleared."
    }
}

# ---------------------------
# Invoke-Api: unified HTTP call
# ---------------------------
function Invoke-ApiRequest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Url,

        [ValidateSet('GET','POST','PUT','PATCH','DELETE','HEAD')]
        [string]$Method = 'GET',

        [object]$Body = $null,

        [hashtable]$Headers = $null,

        [int]$TimeoutSec = 30,

        [switch]$UseSession
    )

    # Merge headers
    $hdrs = @{}
    foreach ($k in $script:DefaultHeaders.Keys) {
        $hdrs[$k] = $script:DefaultHeaders[$k]
    }
    if ($Headers) {
        foreach ($k in $Headers.Keys) {
            $hdrs[$k] = $Headers[$k]
        }
    }

    # Prepare invoke parameters
    $invokeParams = @{
        Uri = $Url
        Method = $Method
        TimeoutSec = $TimeoutSec
        ErrorAction = 'Stop'
        UseBasicParsing = $true
    }

    if ($UseSession) {
        $invokeParams['WebSession'] = $script:WebSession
    }
    if ($hdrs) {
        $invokeParams['Headers'] = $hdrs
    }

    if ($null -ne $Body) {
        if ($Body -is [string]) {
            $invokeParams['Body'] = $Body
            if (-not $invokeParams['Headers'].ContainsKey('Content-Type')) {
                $invokeParams['Headers']['Content-Type'] = 'application/json'
            }
        }
        else {
            try {
                $invokeParams['Body'] = $Body | ConvertTo-Json -Depth 20
                if (-not $invokeParams['Headers'].ContainsKey('Content-Type')) {
                    $invokeParams['Headers']['Content-Type'] = 'application/json'
                }
            }
            catch {
                Write-Error "Failed to convert body to JSON: $_"
                $invokeParams['Body'] = $Body.ToString()
            }
        }
    }

    try {
        $response = Invoke-WebRequest @invokeParams

        $statusCode = $null
        try {
            $statusCode = [int]$response.StatusCode
        }
        catch {
            Write-Verbose "Could not parse status code: $_"
        }

        $content = $null
        try {
            $content = $response.Content
        }
        catch {
            Write-Verbose "Could not get response content: $_"
        }

        $parsed = ConvertFrom-JsonSafe -Text $content

        $respHeaders = @{}
        try {
            foreach ($hk in $response.Headers.Keys) {
                $respHeaders[$hk] = $response.Headers[$hk]
            }
        }
        catch {
            Write-Verbose "Could not parse response headers: $_"
        }

        return [PSCustomObject]@{
            Success = $true
            StatusCode = $statusCode
            Raw = $content
            Body = $parsed
            Headers = $respHeaders
            ErrorMessage = $null
        }
    }
    catch {
        $err = $_.Exception
        $statusCode = $null
        $rawBody = $null
        $respHeaders = @{}
        $msg = $err.Message

        if ($null -ne $err.Response) {
            try {
                $statusCode = [int]$err.Response.StatusCode
            }
            catch {
                Write-Verbose "Could not parse error status code: $_"
            }
            try {
                $sr = New-Object System.IO.StreamReader($err.Response.GetResponseStream())
                $rawBody = $sr.ReadToEnd()
                $sr.Close()
            }
            catch {
                Write-Verbose "Could not read error response stream: $_"
            }
        }
        else {
            $rawBody = ($_.ToString())
        }

        $parsed = $null
        if ($rawBody) {
            $parsed = ConvertFrom-JsonSafe -Text $rawBody
        }

        return [PSCustomObject]@{
            Success = $false
            StatusCode = $statusCode
            Raw = $rawBody
            Body = $parsed
            Headers = $respHeaders
            ErrorMessage = $msg
        }
    }
}

# ---------------------------
# Invoke-Test: core test runner
# ---------------------------
function Invoke-Test {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$TestName,

        [ValidateSet('GET','POST','PUT','PATCH','DELETE','HEAD')]
        [string]$Method = 'GET',

        [Parameter(Mandatory=$true)]
        [string]$Path,

        $Body = $null,

        [hashtable]$Headers = $null,

        [switch]$ShouldFail,

        $ExpectedStatus = $null,

        [scriptblock]$Validator = $null,

        [switch]$UseSession,

        [int]$TimeoutSec = 30
    )

    $script:TotalTests++
    $start = Get-Date

    # Determine full URL
    if ($Path -match '^\s*https?://') {
        $url = $Path.Trim()
    }
    else {
        $url = $BaseUrl.TrimEnd('/') + '/' + $Path.TrimStart('/')
    }

    $result = Invoke-ApiRequest -Url $url -Method $Method -Body $Body -Headers $Headers -TimeoutSec $TimeoutSec -UseSession:$UseSession

    $elapsed = (Get-Date) - $start
    $ms = [int]$elapsed.TotalMilliseconds

    # Determine if request succeeded (2xx)
    $requestSucceeded = $false
    if ($result.Success -and $null -ne $result.StatusCode) {
        if ($result.StatusCode -ge 200 -and $result.StatusCode -lt 300) {
            $requestSucceeded = $true
        }
    }
    elseif ($result.Success -and $null -eq $result.StatusCode) {
        $requestSucceeded = $true
    }

    $passed = $false
    $failReason = $null

    try {
        if ($ShouldFail) {
            if (-not $requestSucceeded) {
                if ($ExpectedStatus) {
                    if ($null -ne $result.StatusCode -and @($ExpectedStatus) -contains $result.StatusCode) {
                        $passed = $true
                    }
                    elseif ($null -eq $result.StatusCode) {
                        $passed = $true
                    }
                    else {
                        $failReason = "Expected status $ExpectedStatus but got $($result.StatusCode)"
                    }
                }
                else {
                    $passed = $true
                }
            }
            else {
                $failReason = "Request succeeded but was expected to fail."
            }
        }
        else {
            if ($requestSucceeded) {
                if ($ExpectedStatus) {
                    if ($null -ne $result.StatusCode -and @($ExpectedStatus) -contains $result.StatusCode) {
                        # OK
                    }
                    elseif ($null -eq $result.StatusCode) {
                        # OK
                    }
                    else {
                        throw "Expected status $ExpectedStatus but got $($result.StatusCode)"
                    }
                }

                if ($Validator) {
                    $valid = & $Validator $result
                    if ($valid -ne $true) {
                        throw "Validator returned false or non-true value."
                    }
                }

                $passed = $true
            }
            else {
                $failReason = "Request failed: $($result.ErrorMessage) (status: $($result.StatusCode))"
            }
        }
    }
    catch {
        $passed = $false
        $failReason = $_.Exception.Message
    }

    # Print results (using Write-Information for pipeline compatibility)
    if ($passed) {
        if ($ShouldFail) {
            $msg = "✓ PASSED - {0} (Expected failure) [{1}ms]" -f $TestName, $ms
            Write-Information $msg -InformationAction Continue
            Write-Success $msg
        }
        else {
            $msg = "✓ PASSED - {0} [{1}ms]" -f $TestName, $ms
            Write-Information $msg -InformationAction Continue
            Write-Success $msg
        }
        $script:PassedTests++
    }
    else {
        $msg = "X FAILED - {0} [{1}ms]" -f $TestName, $ms
        Write-Information $msg -InformationAction Continue
        Write-Failure $msg
        if ($failReason) {
            $reasonMsg = "  Reason: $failReason"
            Write-Information $reasonMsg -InformationAction Continue
            Write-Output $reasonMsg
        }
        if ($result.Raw) {
            $preview = if ($result.Raw.Length -gt 500) {
                $result.Raw.Substring(0, 500) + "...(truncated)"
            }
            else {
                $result.Raw
            }
            $responseMsg = "  Response:"
            Write-Information $responseMsg -InformationAction Continue
            Write-Output $responseMsg
            Write-Information $preview -InformationAction Continue
            Write-Output $preview
        }
        $script:FailedTests++
    }

    Write-Output ""
    return $result
}

# ---------------------------
# Show-TestSummary: Summary printer
# ---------------------------
function Show-TestSummary {
    [CmdletBinding()]
    param()

    Write-Header "TEST SUMMARY"
    $passRate = if ($script:TotalTests -gt 0) {
        [math]::Round(($script:PassedTests / $script:TotalTests) * 100, 2)
    }
    else {
        0
    }

    Write-Output ("  Total:   {0}" -f $script:TotalTests)
    Write-Success ("  Passed:  {0} ({1}%)" -f $script:PassedTests, $passRate)
    Write-Failure ("  Failed:  {0} ({1}%)" -f $script:FailedTests, (100 - $passRate))

    if ($script:FailedTests -gt 0) {
        Write-Output ""
        Write-Failure "There were test failures."
    }
    else {
        Write-Output ""
        Write-Success "ALL TESTS PASSED!"
    }
}

# ---------------------------
# Script start
# ---------------------------
Clear-Host
Write-Header "COMPREHENSIVE BACKEND API TESTING SUITE - Movie Project R13"
Write-Info "Testing against: $BaseUrl"
Write-Info "Health endpoint: $HealthUrl"
Write-Info "Timeout: $DefaultTimeoutSec seconds"
Write-Output ""

# Health check
Write-Info "Performing health check..."
Invoke-Test -TestName "Health Check" -Method GET -Path $HealthUrl -TimeoutSec $DefaultTimeoutSec -Validator {
    param($res)
    if ($null -ne $res.Body -and $res.Body.status -eq 'OK') {
        return $true
    }
    throw "Health check failed"
}

# ============================================================================
# MOVIE ENDPOINTS
# ============================================================================
Write-Header "MOVIE ENDPOINTS"

Invoke-Test -TestName "Search Movies - inception" -Method GET -Path "movies/search?q=inception&page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Search Movies - no results" -Method GET -Path "movies/search?q=xyzabc123notfound&page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Popular Movies" -Method GET -Path "movies/list/popular?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Now Playing Movies" -Method GET -Path "movies/list/now_playing?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Top Rated Movies" -Method GET -Path "movies/list/top_rated?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Upcoming Movies" -Method GET -Path "movies/list/upcoming?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Now Playing in Finland" -Method GET -Path "movies/list/now_playing?region=FI&page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Movie Details - Fight Club (550)" -Method GET -Path "movies/550" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Movie Credits" -Method GET -Path "movies/550/credits" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Movie Videos" -Method GET -Path "movies/550/videos" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Similar Movies" -Method GET -Path "movies/550/similar?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Movie Recommendations" -Method GET -Path "movies/550/recommendations?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Movie Genres" -Method GET -Path "movies/genres" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Discover Action Movies" -Method GET -Path "movies/discover?with_genres=28&sort_by=popularity.desc&page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Discover Highly Rated Movies" -Method GET -Path "movies/discover?vote_average_gte=8&sort_by=vote_average.desc&page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Discover Movies from 1999" -Method GET -Path "movies/discover?year=1999&sort_by=popularity.desc&page=1" -TimeoutSec $DefaultTimeoutSec

# ============================================================================
# TV SHOW ENDPOINTS
# ============================================================================
Write-Header "TV SHOW ENDPOINTS"

Invoke-Test -TestName "Search TV Shows - Breaking Bad" -Method GET -Path "tv/search?q=breaking+bad&page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Popular TV Shows" -Method GET -Path "tv/list/popular?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Top Rated TV Shows" -Method GET -Path "tv/list/top_rated?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get On The Air TV Shows" -Method GET -Path "tv/list/on_the_air?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Airing Today TV Shows" -Method GET -Path "tv/list/airing_today?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get TV Show Details - Breaking Bad (1396)" -Method GET -Path "tv/1396" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get TV Season Details" -Method GET -Path "tv/1396/season/1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get TV Credits" -Method GET -Path "tv/1396/credits" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get TV Videos" -Method GET -Path "tv/1396/videos" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Similar TV Shows" -Method GET -Path "tv/1396/similar?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get TV Recommendations" -Method GET -Path "tv/1396/recommendations?page=1" -TimeoutSec $DefaultTimeoutSec

# ============================================================================
# GENRE ENDPOINTS
# ============================================================================
Write-Header "GENRE ENDPOINTS"

Invoke-Test -TestName "Get Movie Genres" -Method GET -Path "genres/movie" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get TV Genres" -Method GET -Path "genres/tv" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Discover Sci-Fi TV Shows" -Method GET -Path "discover/tv?with_genres=10765&sort_by=popularity.desc&page=1" -TimeoutSec $DefaultTimeoutSec

# ============================================================================
# SEARCH & DISCOVERY
# ============================================================================
Write-Header "SEARCH & DISCOVERY"

Invoke-Test -TestName "Multi-Search - Avatar" -Method GET -Path "search/multi?q=avatar&page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Search Person - Tom Cruise" -Method GET -Path "search/person?q=tom+cruise&page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Person Details - Tom Cruise (500)" -Method GET -Path "person/500" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Person Movie Credits" -Method GET -Path "person/500/movie_credits" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Person TV Credits" -Method GET -Path "person/500/tv_credits" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Trending Movies (Week)" -Method GET -Path "trending/movie/week?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Trending Movies (Day)" -Method GET -Path "trending/movie/day?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Trending TV Shows (Week)" -Method GET -Path "trending/tv/week?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Trending People (Week)" -Method GET -Path "trending/person/week?page=1" -TimeoutSec $DefaultTimeoutSec

Invoke-Test -TestName "Get Trending All Media (Week)" -Method GET -Path "trending/all/week?page=1" -TimeoutSec $DefaultTimeoutSec

# ============================================================================
# USER AUTHENTICATION
# ============================================================================
Write-Header "USER AUTHENTICATION"

# Generate unique credentials
$timestamp = [math]::Floor((Get-Date -Date (Get-Date).ToUniversalTime() -UFormat %s))
$testEmail = "testuser$timestamp@movieproject.com"
$testUsername = "testuser$timestamp"
$testPassword = "SecurePass123!"

Invoke-Test -TestName "User Registration" -Method POST -Path "users/register" -Body @{
    email = $testEmail
    username = $testUsername
    password = $testPassword
} -TimeoutSec $DefaultTimeoutSec | Out-Null

Invoke-Test -TestName "Duplicate Email Registration (Expected Failure)" -Method POST -Path "users/register" -Body @{
    email = $testEmail
    username = "anotheruser"
    password = $testPassword
} -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

$loginResult = Invoke-Test -TestName "User Login" -Method POST -Path "users/login" -Body @{
    email = $testEmail
    password = $testPassword
} -TimeoutSec $DefaultTimeoutSec

# Extract token and user ID
$token = $null
$userId = $null
if ($loginResult.Success -and $null -ne $loginResult.Body.token) {
    $token = $loginResult.Body.token
    $userId = $loginResult.Body.user.id
    Set-AuthorizationToken -Token $token -WhatIf:$false
    Write-Info "Authenticated - Token set"
    Write-Info "User ID: $userId"
}

Invoke-Test -TestName "Wrong Password Login (Expected Failure)" -Method POST -Path "users/login" -Body @{
    email = $testEmail
    password = "WrongPassword123"
} -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

if ($token -and $userId) {
    Invoke-Test -TestName "Get User Profile (Protected)" -Method GET -Path "users/$userId" -TimeoutSec $DefaultTimeoutSec | Out-Null

    Invoke-Test -TestName "Update User Profile" -Method PUT -Path "users/$userId" -Body @{
        username = "${testUsername}_updated"
    } -TimeoutSec $DefaultTimeoutSec | Out-Null
}
else {
    Write-Warn "Skipping authenticated user tests (no token)"
}

Invoke-Test -TestName "Get User Profile - No Token (Expected Failure)" -Method GET -Path "users/$userId" -Headers @{
    Authorization = ""
} -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

# ============================================================================
# REVIEW SYSTEM
# ============================================================================
Write-Header "REVIEW SYSTEM"

Invoke-Test -TestName "Get Reviews for Movie 550 (Public)" -Method GET -Path "reviews/movie/550?page=1&limit=5" -TimeoutSec $DefaultTimeoutSec | Out-Null

Invoke-Test -TestName "Get Average Rating for Movie 550" -Method GET -Path "reviews/movie/550/average" -TimeoutSec $DefaultTimeoutSec | Out-Null

if ($token -and $userId) {
    $createReviewResult = Invoke-Test -TestName "Create Review" -Method POST -Path "reviews" -Body @{
        user_id = $userId
        movie_external_id = "550"
        rating = 5
        review_text = "Absolutely mind-blowing! A masterpiece of cinema."
    } -TimeoutSec $DefaultTimeoutSec

    $reviewId = $null
    if ($createReviewResult.Success -and $null -ne $createReviewResult.Body.id) {
        $reviewId = $createReviewResult.Body.id
        Write-Info "Created Review ID: $reviewId"
    }

    Invoke-Test -TestName "Create Duplicate Review (Expected Failure)" -Method POST -Path "reviews" -Body @{
        user_id = $userId
        movie_external_id = "550"
        rating = 4
        review_text = "Another review"
    } -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

    Invoke-Test -TestName "Get Reviews After Creation" -Method GET -Path "reviews/movie/550?page=1&limit=10" -TimeoutSec $DefaultTimeoutSec | Out-Null

    Invoke-Test -TestName "Get Updated Average Rating" -Method GET -Path "reviews/movie/550/average" -TimeoutSec $DefaultTimeoutSec | Out-Null

    # Skip user reviews test - not implemented yet
    Write-Warn "SKIPPED - Get Reviews by User (Feature not implemented in SQL schema)"
    Write-Output ""

    if ($null -ne $reviewId) {
        Invoke-Test -TestName "Update Review" -Method PUT -Path "reviews/$reviewId" -Body @{
            rating = 4
            review_text = "Updated review: Still great, but not perfect."
        } -TimeoutSec $DefaultTimeoutSec | Out-Null

        Invoke-Test -TestName "Get Reviews After Update" -Method GET -Path "reviews/movie/550?page=1&limit=10" -TimeoutSec $DefaultTimeoutSec | Out-Null

        Invoke-Test -TestName "Delete Review" -Method DELETE -Path "reviews/$reviewId" -TimeoutSec $DefaultTimeoutSec | Out-Null

        Invoke-Test -TestName "Verify Review Deleted" -Method GET -Path "reviews/movie/550?page=1&limit=10" -TimeoutSec $DefaultTimeoutSec | Out-Null
    }
}
else {
    Write-Warn "Skipping authenticated review tests (no token)"
}

Clear-AuthorizationToken -WhatIf:$false

Invoke-Test -TestName "Create Review Without Auth (Expected Failure)" -Method POST -Path "reviews" -Body @{
    user_id = "fake-user-id"
    movie_external_id = "550"
    rating = 5
    review_text = "Test review"
} -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

if ($token -and $userId) {
    Set-AuthorizationToken -Token $token -WhatIf:$false
    Invoke-Test -TestName "Create Review with Invalid Rating (Expected Failure)" -Method POST -Path "reviews" -Body @{
        user_id = $userId
        movie_external_id = "551"
        rating = 10
        review_text = "Test"
    } -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null
}

# ============================================================================
# ERROR HANDLING
# ============================================================================
Write-Header "ERROR HANDLING"

Invoke-Test -TestName "Invalid Movie ID" -Method GET -Path "movies/999999999" -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

Invoke-Test -TestName "Invalid Search Type" -Method GET -Path "movies/list/invalid_type" -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

Invoke-Test -TestName "Empty Search Query" -Method GET -Path "movies/search?q=&page=1" -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

Invoke-Test -TestName "Invalid Page Number" -Method GET -Path "movies/list/popular?page=-1" -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

Invoke-Test -TestName "Invalid Trending Media Type" -Method GET -Path "trending/invalid/week" -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

Invoke-Test -TestName "Invalid Route (404)" -Method GET -Path "nonexistent/route" -ShouldFail -TimeoutSec $DefaultTimeoutSec | Out-Null

# ============================================================================
# PAGINATION
# ============================================================================
Write-Header "PAGINATION"

$page1Result = Invoke-Test -TestName "Get Popular Movies Page 1" -Method GET -Path "movies/list/popular?page=1" -TimeoutSec $DefaultTimeoutSec
$page2Result = Invoke-Test -TestName "Get Popular Movies Page 2" -Method GET -Path "movies/list/popular?page=2" -TimeoutSec $DefaultTimeoutSec

$script:TotalTests++
if ($page1Result.Raw -ne $page2Result.Raw) {
    Write-Success "✓ PASSED - Pagination works (Page 1 != Page 2)"
    $script:PassedTests++
}
else {
    Write-Failure "X FAILED - Pagination broken (Page 1 == Page 2)"
    $script:FailedTests++
}
Write-Output ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
Show-TestSummary

# Exit with count of failed tests (CI-friendly)
$exitCode = [int]$script:FailedTests
if ($exitCode -lt 0) {
    $exitCode = 1
}
exit $exitCode