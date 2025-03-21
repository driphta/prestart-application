# Script to deploy frontend code to Azure Static Web App
# This script should be run in PowerShell with Azure CLI installed and logged in

# Configuration variables - modify these as needed
$resourceGroupName = "PrestartApp-RG"  # Your existing resource group
$staticWebAppName = "PrestartApplication"  # Your existing Static Web App name
$frontendDir = "../frontend"  # Path to frontend directory
$apiUrl = "https://prestart-api1.azurewebsites.net/api"  # URL to your backend API

# Change to the frontend directory
Write-Host "Installing dependencies..."
Set-Location $frontendDir
npm install

# Build the frontend
Write-Host "Building the frontend..."
$env:REACT_APP_API_URL = $apiUrl
npm run build

# Check if the Azure CLI command exists
$azCliVersion = az --version 2>$null
if (-not $azCliVersion) {
    Write-Host "Azure CLI is not installed. Please install it and try again."
    exit 1
}

# Check if the Static Web App exists
$staticWebAppExists = az staticwebapp show --name $staticWebAppName --resource-group $resourceGroupName --query "name" 2>$null
if (-not $staticWebAppExists) {
    Write-Host "Static Web App $staticWebAppName does not exist in resource group $resourceGroupName."
    exit 1
}

# Deploy to Azure Static Web App using the appropriate method
# First try the newer CLI command
$deployResult = az staticwebapp deploy --name $staticWebAppName --resource-group $resourceGroupName --source-path "build" 2>$null
if (-not $deployResult) {
    # If that fails, try using the SWA CLI
    Write-Host "Falling back to SWA CLI for deployment..."
    
    # Check if SWA CLI is installed
    $swaCli = npx swa -v 2>$null
    if (-not $swaCli) {
        Write-Host "Installing SWA CLI..."
        npm install -g @azure/static-web-apps-cli
    }
    
    # Get the deployment token
    $deploymentToken = az staticwebapp secrets list --name $staticWebAppName --resource-group $resourceGroupName --query "properties.apiKey" -o tsv
    
    # Deploy using SWA CLI
    npx swa deploy build --deployment-token $deploymentToken
}

# Return to the original directory
Set-Location -Path $PSScriptRoot

Write-Host "Deployment completed successfully."
Write-Host "`nNext steps:"
Write-Host "1. Test the frontend application"
Write-Host "2. Verify API integration"
Write-Host "3. Test user authentication and authorization"
