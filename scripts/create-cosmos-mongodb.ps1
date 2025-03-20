# Script to create a new Azure Cosmos DB account with MongoDB API
# This script should be run in PowerShell with Azure CLI installed and logged in

# Configuration variables - modify these as needed
$resourceGroupName = "PrestartApp-RG"  # Your existing resource group
$location = "australiaeast"  # Your preferred Azure region
$accountName = "prestart-mongodb"  # New Cosmos DB account name
$databaseName = "site-prestart"  # Database name
$collections = @("users", "projects", "briefings", "attendances", "tokens")  # Collections to create

# Check if the resource group exists
$rgExists = az group exists --name $resourceGroupName
if ($rgExists -eq "false") {
    Write-Host "Resource group $resourceGroupName does not exist. Creating it..."
    az group create --name $resourceGroupName --location $location
    Write-Host "Resource group created."
} else {
    Write-Host "Resource group $resourceGroupName already exists."
}

# Check if the Cosmos DB account already exists
$cosmosExists = az cosmosdb check-name-exists --name $accountName
if ($cosmosExists -eq "true") {
    Write-Host "A Cosmos DB account with name $accountName already exists. Please choose a different name."
    exit 1
}

# Create the Cosmos DB account with MongoDB API
Write-Host "Creating Cosmos DB account $accountName with MongoDB API..."
az cosmosdb create `
    --resource-group $resourceGroupName `
    --name $accountName `
    --kind MongoDB `
    --server-version 4.0 `
    --default-consistency-level Session `
    --locations regionName=$location failoverPriority=0 isZoneRedundant=False `
    --capabilities EnableMongo `
    --enable-free-tier true

# Create the database
Write-Host "Creating database $databaseName..."
az cosmosdb mongodb database create `
    --resource-group $resourceGroupName `
    --account-name $accountName `
    --name $databaseName `
    --throughput 400

# Create collections
foreach ($collection in $collections) {
    Write-Host "Creating collection $collection..."
    az cosmosdb mongodb collection create `
        --resource-group $resourceGroupName `
        --account-name $accountName `
        --database-name $databaseName `
        --name $collection `
        --shard "_id" `
        --throughput 400
}

# Get the connection string
$connectionString = az cosmosdb keys list `
    --resource-group $resourceGroupName `
    --name $accountName `
    --type connection-strings `
    --query "connectionStrings[0].connectionString" `
    --output tsv

# Output the connection string
Write-Host "MongoDB Connection String (save this for your .env file):"
Write-Host $connectionString

# Instructions for next steps
Write-Host "`nNext steps:"
Write-Host "1. Add this connection string to your Function App's environment variables:"
Write-Host "   az functionapp config appsettings set --name prestart-api1 --resource-group $resourceGroupName --settings MONGODB_URI='$connectionString'"
Write-Host "2. Add other required environment variables (JWT_SECRET, JWT_EXPIRE)"
Write-Host "3. Update your backend code to connect to MongoDB"
Write-Host "4. Update your frontend to use the API instead of IndexedDB"
