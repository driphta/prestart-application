# Known Issues and Future Work

## Azure App Service Backend Issues

The backend API deployed to Azure App Service is currently experiencing connectivity issues. These need to be addressed before the application is fully functional.

### Current Issues

1. **API Connectivity**: The backend API is returning 502 errors when accessed directly or from the frontend.
   - Possible causes: App Service configuration, web.config issues, or Node.js version compatibility problems
   - Attempted fixes: Updated web.config, improved CORS configuration, and enhanced error logging

2. **User Creation**: The frontend is unable to create users due to the API connectivity issues.
   - This will be resolved once the backend API is properly configured and responding

### Next Steps

1. **App Service Investigation**:
   - Review Azure App Service logs through the Azure Portal
   - Check if App Service is properly starting the Node.js application
   - Consider using Azure Functions instead if App Service continues to be problematic

2. **Alternative Deployment Options**:
   - Deploy the backend to a different service like Azure Functions
   - Consider containerizing the application and using Azure Container Instances
   - Evaluate using Azure API Management as a gateway

3. **Local Development**:
   - The application can still be developed and tested locally
   - Use the setupProxy.js for local API connection during development

## Deployment Script Issues

The deployment scripts have been improved but still have some issues:

1. **Azure CLI Version Compatibility**: Some Azure CLI commands used in the deployment scripts might not be compatible with all CLI versions.
   - Added fallbacks and improved error handling, but more work might be needed

2. **Frontend Deployment**: The frontend deployment script may not consistently work with older Azure CLI versions.
   - Added alternative deployment methods using the SWA CLI

## Documentation Improvements

1. **Complete the Troubleshooting Guide**: Add more detailed troubleshooting steps for common issues
2. **Environment Variables Documentation**: Document all required environment variables for both frontend and backend
3. **Local Development Setup**: Enhance documentation for setting up the development environment

## Future Work

1. **MongoDB Integration**: Complete the integration with Azure Cosmos DB using the MongoDB API
2. **User Authentication**: Implement the role-based authentication system as planned
3. **Data Migration**: Finish and test the data migration utility for transferring data from IndexedDB to Cosmos DB
