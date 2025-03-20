# Script to configure environment variables in Azure App Service
# This script should be run in PowerShell with Azure CLI installed and logged in

# Configuration variables - modify these as needed
$resourceGroupName = "PrestartApp-RG"  # Your existing resource group
$appServiceName = "prestart-api1"  # Your existing App Service name
$appSettingsFile = "app-settings.json"  # App settings JSON file

# Check if the App Service exists
$appServiceExists = az webapp show --name $appServiceName --resource-group $resourceGroupName --query "name" 2>$null
if (-not $appServiceExists) {
    Write-Host "App Service $appServiceName does not exist in resource group $resourceGroupName."
    exit 1
}

# Configure environment variables
Write-Host "Configuring environment variables for App Service $appServiceName..."
az webapp config appsettings set --name $appServiceName --resource-group $resourceGroupName --settings @$appSettingsFile

Write-Host "Environment variables configured successfully."
Write-Host "`nNext steps:"
Write-Host "1. Make sure your backend code is properly connecting to MongoDB using the connection string"
Write-Host "2. Deploy your backend code to the App Service"
Write-Host "3. Update your frontend to use the API instead of IndexedDB"
