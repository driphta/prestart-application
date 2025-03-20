# Script to deploy backend code to Azure App Service
# This script should be run in PowerShell with Azure CLI installed and logged in

# Configuration variables - modify these as needed
$resourceGroupName = "PrestartApp-RG"  # Your existing resource group
$appServiceName = "prestart-api1"  # Your existing App Service name
$backendDir = "../backend"  # Path to backend directory
$deploymentZip = "backend-deployment.zip"  # Name of the deployment zip file

# Check if the App Service exists
$appServiceExists = az webapp show --name $appServiceName --resource-group $resourceGroupName --query "name" 2>$null
if (-not $appServiceExists) {
    Write-Host "App Service $appServiceName does not exist in resource group $resourceGroupName."
    exit 1
}

# Change to the backend directory
Write-Host "Installing dependencies..."
Set-Location $backendDir
npm install

# Create deployment package
Write-Host "Creating deployment package..."
if (Test-Path $deploymentZip) {
    Remove-Item $deploymentZip
}

# Create a zip file with the backend code
Compress-Archive -Path * -DestinationPath $deploymentZip -Force

# Deploy to Azure App Service
Write-Host "Deploying to Azure App Service $appServiceName..."
az webapp deployment source config-zip --resource-group $resourceGroupName --name $appServiceName --src $deploymentZip

# Configure App Service settings
Write-Host "Configuring App Service settings..."
az webapp config set --name $appServiceName --resource-group $resourceGroupName --web-sockets-enabled false
az webapp config set --name $appServiceName --resource-group $resourceGroupName --always-on true
# Node version setting - commented out due to CLI compatibility issues
# az webapp config set --name $appServiceName --resource-group $resourceGroupName --node-version "~16"

# Configure CORS (may not be needed if handled in code, but good as a fallback)
Write-Host "Configuring CORS..."
az webapp cors add --name $appServiceName --resource-group $resourceGroupName --allowed-origins "https://prestart-app.azurewebsites.net" "https://green-pond-0e70dff00.3.azurestaticapps.net" "http://localhost:3000"

# Restart the app to apply settings
Write-Host "Restarting App Service..."
az webapp restart --name $appServiceName --resource-group $resourceGroupName

# Clean up
Remove-Item $deploymentZip

# Return to the original directory
Set-Location -Path $PSScriptRoot

Write-Host "Deployment completed successfully."
Write-Host "`nNext steps:"
Write-Host "1. Configure environment variables using the configure-function-app.ps1 script"
Write-Host "2. Test the API endpoints"
Write-Host "3. Update your frontend to use the API"
