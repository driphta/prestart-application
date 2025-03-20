# Script to deploy frontend code to Azure Static Web Apps
# This script should be run in PowerShell with Azure CLI installed and logged in

# Configuration variables - modify these as needed
$resourceGroupName = "PrestartApp-RG"  # Your existing resource group
$staticWebAppName = "prestart-app"  # Your existing Static Web App name
$frontendDir = "../frontend"  # Path to frontend directory
$buildDir = "../frontend/build"  # Path to frontend build directory

# Change to the frontend directory
Write-Host "Installing dependencies..."
Set-Location $frontendDir
npm install

# Build the frontend
Write-Host "Building the frontend..."
$env:REACT_APP_API_URL = "https://prestart-api1.azurewebsites.net/api"
npm run build

# Deploy to Azure Static Web Apps using the Azure CLI
Write-Host "Deploying to Azure Static Web App $staticWebAppName..."

# Create a deployment package
$deploymentZip = "frontend-deployment.zip"
if (Test-Path $deploymentZip) {
    Remove-Item $deploymentZip
}

# Create a zip file with the build directory content
Set-Location $buildDir
Compress-Archive -Path * -DestinationPath "../$deploymentZip" -Force
Set-Location ..

# Use the Azure CLI to deploy the static site
# There are multiple ways to deploy depending on your Azure CLI version
# Try the newer CLI method first
$cliCommand = "az staticwebapp deploy --name $staticWebAppName --resource-group $resourceGroupName --source-path $buildDir"
$deployResult = Invoke-Expression $cliCommand 2>&1

# If the first method fails, try the alternate method (for older CLI versions)
if ($deployResult -like "*'deploy' is misspelled or not recognized by the system*") {
    Write-Host "Using alternative deployment method for older Azure CLI versions..."
    
    # For older CLI versions or SWA CLI
    # Check if the SWA CLI is installed
    $swaInstalled = npm list -g @azure/static-web-apps-cli 2>$null
    
    if (-not $swaInstalled) {
        Write-Host "Installing Azure Static Web Apps CLI..."
        npm install -g @azure/static-web-apps-cli
    }
    
    # Deploy using the SWA CLI
    swa deploy $buildDir --env production --deployment-token (az staticwebapp secrets list --name $staticWebAppName --resource-group $resourceGroupName --query "properties.apiKey" -o tsv)
}

# Return to the original directory
Set-Location -Path $PSScriptRoot

Write-Host "Deployment completed successfully."
Write-Host "`nNext steps:"
Write-Host "1. Test the frontend application"
Write-Host "2. Verify API integration"
Write-Host "3. Test user authentication and authorization"
