# Azure Migration Scripts

This directory contains scripts to help migrate your application to Azure Cosmos DB with MongoDB API.

## Prerequisites

- Azure CLI installed and logged in
- PowerShell (for Windows)
- Node.js and npm (for testing MongoDB connection)

## Scripts

### 1. Create Cosmos DB with MongoDB API

This script creates a new Azure Cosmos DB account with MongoDB API, a database, and collections.

```powershell
# Run in PowerShell
.\create-cosmos-mongodb.ps1
```

Make sure to review and modify the configuration variables at the top of the script before running.

### 2. Configure Function App Environment Variables

This script sets up the necessary environment variables in your Azure Function App.

```powershell
# Run in PowerShell
.\configure-function-app.ps1
```

You'll need to provide your MongoDB connection string when prompted, or you can edit the script to include it directly.

### 3. Test MongoDB Connection

This script tests the connection to your Azure Cosmos DB with MongoDB API.

```bash
# First, install dependencies
npm install

# Create a .env file from the example
cp .env.example .env

# Edit the .env file to include your MongoDB connection string
# Then run the test
npm run test-connection
```

## Next Steps After Running These Scripts

1. Complete your backend implementation with proper models and controllers
2. Deploy your backend code to the Azure Function App
3. Update your frontend to use the API instead of IndexedDB
4. Implement the data migration utility to transfer data from IndexedDB to Cosmos DB
