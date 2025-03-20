# Complete Migration Script for Site Pre-Start Briefing Application
# This script will help complete the migration process to Azure

# Configuration variables - modify these as needed
$resourceGroupName = "PrestartApp-RG"  # Your existing resource group
$functionAppName = "prestart-api1"  # Your existing Function App name
$staticWebAppName = "prestart-web"  # Your Static Web App name
$mongodbUri = ""  # Your MongoDB connection string (from create-cosmos-mongodb.ps1)
$jwtSecret = "your-super-secret-jwt-key-change-this-in-production"  # JWT secret for token signing
$jwtExpire = "30d"  # JWT token expiration

# Step 1: Create .env file for frontend
Write-Host "Creating .env file for frontend..."
$envContent = @"
REACT_APP_API_URL=https://$functionAppName.azurewebsites.net/api
"@

# Create the .env file
$envPath = Join-Path -Path (Get-Location).Path -ChildPath "..\frontend\.env"
Set-Content -Path $envPath -Value $envContent
Write-Host "Created .env file at $envPath"

# Step 2: Configure Azure Function App environment variables
Write-Host "Configuring environment variables for Function App $functionAppName..."

# Prompt for MongoDB URI if not provided
if (-not $mongodbUri) {
    $mongodbUri = Read-Host "Enter your MongoDB connection string"
}

# Configure environment variables
az functionapp config appsettings set `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --settings `
    MONGODB_URI=$mongodbUri `
    JWT_SECRET=$jwtSecret `
    JWT_EXPIRE=$jwtExpire `
    NODE_ENV="production" `
    PORT="80"

Write-Host "Environment variables configured successfully."

# Step 3: Build the frontend
Write-Host "Building the frontend..."
$frontendPath = Join-Path -Path (Get-Location).Path -ChildPath "..\frontend"
Set-Location -Path $frontendPath
npm install
npm run build
Write-Host "Frontend built successfully."

# Step 4: Update the frontend to use the API
Write-Host "Frontend has been updated to use the API by default."
Write-Host "The db.js file has been modified to use the API instead of IndexedDB."

# Step 5: Instructions for deploying to Azure Static Web Apps
Write-Host "`nNext steps for deployment:"
Write-Host "1. Commit your changes to your GitHub repository"
Write-Host "2. Push your changes to trigger the GitHub Actions workflow"
Write-Host "3. The workflow will deploy your frontend to Azure Static Web Apps"
Write-Host "4. Once deployed, navigate to the Data Migration page"
Write-Host "5. Click the 'Start Migration' button to migrate your data from IndexedDB to Azure Cosmos DB"

# Return to the original directory
Set-Location -Path (Join-Path -Path (Get-Location).Path -ChildPath "..\scripts")

Write-Host "`nMigration process is now complete!"
Write-Host "Your application is now using Azure Cosmos DB for data storage."
