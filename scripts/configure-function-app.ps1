# Script to configure environment variables in Azure Function App
# This script should be run in PowerShell with Azure CLI installed and logged in

# Configuration variables - modify these as needed
$resourceGroupName = "PrestartApp-RG"  # Your existing resource group
$functionAppName = "prestart-api1"  # Your existing Function App name
$mongodbUri = ""  # Paste your MongoDB connection string here
$jwtSecret = "your-super-secret-jwt-key-change-this-in-production"  # JWT secret for token signing
$jwtExpire = "30d"  # JWT token expiration
$nodeEnv = "production"  # Node.js environment
$port = "80"  # Port for the Function App

# Check if the Function App exists
$functionAppExists = az functionapp show --name $functionAppName --resource-group $resourceGroupName --query "name" 2>$null
if (-not $functionAppExists) {
    Write-Host "Function App $functionAppName does not exist in resource group $resourceGroupName."
    exit 1
}

# Prompt for MongoDB URI if not provided
if (-not $mongodbUri) {
    $mongodbUri = Read-Host "Enter your MongoDB connection string"
}

# Configure environment variables
Write-Host "Configuring environment variables for Function App $functionAppName..."
az functionapp config appsettings set `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --settings `
    MONGODB_URI=$mongodbUri `
    JWT_SECRET=$jwtSecret `
    JWT_EXPIRE=$jwtExpire `
    NODE_ENV=$nodeEnv `
    PORT=$port

Write-Host "Environment variables configured successfully."
Write-Host "`nNext steps:"
Write-Host "1. Make sure your backend code is properly connecting to MongoDB using the connection string"
Write-Host "2. Deploy your backend code to the Function App"
Write-Host "3. Update your frontend to use the API instead of IndexedDB"
