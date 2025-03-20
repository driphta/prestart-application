# Test API Endpoints Script
# This script tests the API endpoints to ensure they are working correctly

$API_BASE_URL = "https://prestart-api1.azurewebsites.net"
$token = $null

Write-Host "Testing API endpoints at $API_BASE_URL" -ForegroundColor Cyan

# Test root endpoint
try {
    Write-Host "Testing root endpoint..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$API_BASE_URL" -Method GET -ErrorAction Stop
    Write-Host "Root endpoint response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Root endpoint error: $_" -ForegroundColor Red
}

# Test health endpoint
try {
    Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/health" -Method GET -ErrorAction Stop
    Write-Host "Health endpoint response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Health endpoint error: $_" -ForegroundColor Red
}

# Test registration
try {
    Write-Host "`nTesting registration endpoint..." -ForegroundColor Yellow
    $userData = @{
        name = "Test User"
        email = "testuser@example.com"
        password = "Password123!"
        role = "site-supervisor"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/auth/register" -Method POST -Body $userData -ContentType "application/json" -ErrorAction Stop
    Write-Host "Registration response: $($response | ConvertTo-Json)" -ForegroundColor Green
    
    # Save token for subsequent requests
    $token = $response.token
} catch {
    Write-Host "Registration error: $_" -ForegroundColor Red
}

# Test login
if (-not $token) {
    try {
        Write-Host "`nTesting login endpoint..." -ForegroundColor Yellow
        $loginData = @{
            email = "testuser@example.com"
            password = "Password123!"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
        Write-Host "Login response: $($response | ConvertTo-Json)" -ForegroundColor Green
        
        # Save token for subsequent requests
        $token = $response.token
    } catch {
        Write-Host "Login error: $_" -ForegroundColor Red
    }
}

# Test get users (requires authentication)
if ($token) {
    try {
        Write-Host "`nTesting get users endpoint..." -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
        }

        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/users" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "Get users response: $($response | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        Write-Host "Get users error: $_" -ForegroundColor Red
    }

    # Test create project
    try {
        Write-Host "`nTesting create project endpoint..." -ForegroundColor Yellow
        $projectData = @{
            name = "Test Project"
            location = "Test Location"
            description = "Test project description"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/projects" -Method POST -Body $projectData -ContentType "application/json" -Headers $headers -ErrorAction Stop
        Write-Host "Create project response: $($response | ConvertTo-Json)" -ForegroundColor Green
        
        # Save project ID for subsequent requests
        $projectId = $response._id
        
        # Test get project by ID
        if ($projectId) {
            try {
                Write-Host "`nTesting get project by ID endpoint..." -ForegroundColor Yellow
                $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/projects/$projectId" -Method GET -Headers $headers -ErrorAction Stop
                Write-Host "Get project by ID response: $($response | ConvertTo-Json)" -ForegroundColor Green
            } catch {
                Write-Host "Get project by ID error: $_" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "Create project error: $_" -ForegroundColor Red
    }

    # Test get projects
    try {
        Write-Host "`nTesting get projects endpoint..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/projects" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "Get projects response: $($response | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        Write-Host "Get projects error: $_" -ForegroundColor Red
    }
}

Write-Host "`nAPI testing completed." -ForegroundColor Cyan
