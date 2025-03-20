# Site Pre-Start Briefing Application

## Project Overview

This web application digitizes the pre-shift briefing process for construction and industrial sites, replacing paper-based forms with a streamlined digital solution. The application handles two primary workflows:

1. **Supervisor Workflow**: Creating daily briefing forms with site details, safety information, and work scope
2. **Team Member Workflow**: Digital sign-on process with BAC recording and time tracking

The application will primarily function as a client-side solution, using browser storage for data persistence and generating PDFs for email distribution to project managers.

## Deployment Status

The application is currently deployed to Azure Static Web Apps and can be accessed at:
https://black-glacier-0e616cd10.6.azurestaticapps.net

## Key Features

### Supervisor Features
- Create and manage daily pre-shift briefings
- Record site conditions, safety topics, and work scope
- Track personnel attendance and compliance
- Generate reports and export data

### Team Member Features
- Digital sign-on/sign-off process
- BAC (Blood Alcohol Content) recording
- Digital signature capture
- Time tracking

### Automation Features
- Weather and UV index auto-population
- Reusable templates for common briefing elements
- Automated notifications and reminders
- Compliance reporting

## Technology Stack

- **Frontend**: React.js with Material UI
- **Storage**: Browser localStorage/IndexedDB
- **PDF Generation**: jsPDF or similar library
- **Email Integration**: Azure Communication Services (future implementation)
- **Backend**: Azure services for future expansion (if needed)

## Development Roadmap

### Phase 1: Foundation (Completed)
- [x] Project setup and documentation
- [x] Frontend application structure
- [x] Browser storage implementation
- [x] Basic UI components
- [x] Azure Static Web App deployment

### Phase 2: Core Functionality (Completed)
- [x] Supervisor briefing form creation
- [x] Team member sign-on interface
- [x] Digital signature implementation
- [x] Form validation
- [x] PDF generation

### Phase 3: Azure Integration (Current)
- [ ] Azure Cosmos DB implementation
- [ ] Azure Functions API layer
- [ ] Data migration from browser storage
- [x] Basic authentication system
- [x] Pre-populated user information

### Phase 3.5: User Authentication Implementation (Current)
- [x] Create login and registration pages
- [x] Implement JWT-based authentication
- [x] Create user context provider
- [x] Update user model with password and email
- [x] Implement role-based access control (Project Manager & Site Supervisor)
- [x] Secure API endpoints with authentication
- [x] Filter briefings based on user role (PM sees all, Supervisor sees own)
- [x] Update UI to reflect user roles and permissions
- [x] Add user profile and settings page

### Phase 4: Advanced Features
- [ ] Comprehensive reporting
- [ ] Export options enhancement
- [ ] Email scheduling
- [ ] Mobile responsiveness optimization
- [ ] Offline capability improvements

## Database Schema

> Note: While initially using browser storage, the following schema represents the data structure that will be used.

### Storage Structure

#### Users
- `_id`: ObjectId
- `email`: String (unique)
- `password`: String (hashed)
- `name`: String
- `role`: String (enum: "site_supervisor", "project_manager", "team_member", "admin")
- `company`: String
- `signature`: String (base64 encoded image)
- `preferences`: Object (user settings and preferences)
- `lastLogin`: Date
- `createdBriefings`: Array (for site_supervisor role)
- `accessibleProjects`: Array (for project_manager role)
- `createdAt`: Date
- `updatedAt`: Date

#### Projects
- `_id`: ObjectId
- `name`: String
- `location`: String
- `projectManager`: String
- `active`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

#### Briefings
- `_id`: ObjectId
- `date`: Date
- `time`: String
- `location`: String
- `projectId`: ObjectId (ref: Projects)
- `projectManager`: String
- `projectManagerId`: ObjectId (ref: Users)
- `supervisor`: String
- `supervisorId`: ObjectId (ref: Users)
- `weather`: String
- `uvIndex`: Number
- `temperature`: String
- `communication`: Object
  - `siteNotices`: String
  - `siteVisitors`: String
  - `newStarters`: String
  - `daaTesting`: String
  - `peopleFlying`: Object
    - `in`: String
    - `out`: String
- `hseIssues`: Object
  - `reportedHazards`: String
  - `incidents`: String
  - `injuries`: String
  - `take5Count`: Number
  - `jhaCount`: Number
  - `otherIssues`: String
- `safetyTopic`: Array of Strings
- `permitsRequired`: Array of Objects
  - `permitType`: String
  - `permitNumber`: String
- `workCrewInteractions`: String
- `scopeOfWorks`: Array of Strings
- `additionalInformation`: String
- `createdBy`: ObjectId (ref: Users)
- `createdAt`: Date
- `updatedAt`: Date

#### Attendances
- `_id`: ObjectId
- `briefingId`: ObjectId (ref: Briefings)
- `userId`: ObjectId (ref: Users)
- `name`: String
- `timeOn`: String
- `timeOff`: String
- `bac`: Number
- `signOnTimestamp`: Date
- `signOffTimestamp`: Date
- `signOnSignature`: String (base64 encoded image)
- `signOffSignature`: String (base64 encoded image)
- `createdAt`: Date
- `updatedAt`: Date

## Authentication and Authorization

### Authentication Flow
1. User registers or logs in through the login page
2. Backend validates credentials and issues a JWT token
3. Token is stored in localStorage and included in subsequent API requests
4. Token expiration is checked on each request; user is redirected to login if expired

### Role-Based Access Control
- **Project Manager**
  - Can view all briefings across all projects
  - Can access reports and analytics
  - Cannot create new briefings
  - Can export and share briefing data

- **Site Supervisor**
  - Can only view briefings they have created
  - Can create, edit, and delete their own briefings
  - Can manage sign-on sheets for their briefings
  - Limited access to reporting features

- **Future Roles**
  - **Admin**: Full system access, user management
  - **Read-Only**: View-only access for compliance and auditing

### Security Measures
- Password hashing with bcrypt
- JWT tokens with expiration
- HTTPS for all communications
- Input validation and sanitization
- Role verification on all protected routes and API endpoints

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Development Setup
1. Clone the repository
   ```
   git clone <repository-url>
   cd site-prestart-app
   ```

2. Install frontend dependencies
   ```
   cd frontend
   npm install
   ```

3. Run the development server
   ```
   npm start
   ```

### Production Deployment
1. Build the frontend
   ```
   npm run build
   ```

2. Deploy to static hosting service of choice (Azure Static Web Apps recommended)

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Submit a pull request to `develop`

## License

[MIT License](LICENSE)

## Contact

For questions or support, please contact [Project Manager Name] at [email@example.com].

## Azure Deployment Guide

### Prerequisites

- Azure account with active subscription
- GitHub account for source control
- Node.js and npm installed locally

### Deployment Steps

1. **Create an Azure Static Web App**:
   - Go to the Azure Portal
   - Create a new Static Web App resource
   - Connect to your GitHub repository
   - Configure build settings:
     - App location: `/frontend`
     - API location: (leave empty or specify `/api` if using Azure Functions)
     - Output location: `build`

2. **Set up GitHub Actions**:
   - The deployment workflow is automatically created in `.github/workflows/`
   - Ensure the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is configured in GitHub

3. **Deploy Updates**:
   - Push changes to your main branch
   - GitHub Actions will automatically build and deploy your application

## Azure Service Enhancements

After successfully deploying the application to Azure Static Web Apps, the following enhancements will be implemented to leverage Azure cloud services for improved functionality, data persistence, and reporting capabilities.

### 1. Database Migration (Azure Cosmos DB)

The application will transition from browser-based storage (IndexedDB) to Azure Cosmos DB for robust data persistence:

- **Account Setup**:
  - SQL API for flexible querying
  - Australia East region for optimal performance
  - Session consistency level for balance of performance and consistency

- **Data Structure**:
  - Database: `PrestartApp`
  - Containers:
    - `briefings`: Stores all briefing documents
    - `attendances`: Records sign-on/sign-off information
    - `users`: Stores supervisor and worker information
    - `projects`: Maintains project and location data

- **Migration Process**:
  - Develop data migration utility
  - Implement data validation during transfer
  - Maintain backward compatibility during transition

### 2. API Layer (Azure Functions)

A serverless API layer will be implemented using Azure Functions to handle data operations:

- **Function App Structure**:
  - HTTP-triggered functions for CRUD operations
  - Timer-triggered functions for scheduled reports
  - Queue-triggered functions for background processing

- **API Endpoints**:
  - `/api/briefings`: Manage briefing documents
  - `/api/attendances`: Handle sign-on/sign-off records
  - `/api/users`: Manage user information
  - `/api/projects`: Handle project data
  - `/api/reports`: Generate and retrieve reports

### 3. Authentication System

A basic authentication system will be implemented using Azure Easy Auth:

- **Authentication Flow**:
  - Username/password authentication
  - JWT token-based session management
  - Role-based access control (Supervisor, Worker, Admin)

### 4. Pre-populated Information

The application will be enhanced to support pre-populated information for supervisors and workers:

- **User Management**:
  - Bulk import of user data
  - User profile management
  - Active/inactive status tracking

- **UI Enhancements**:
  - Searchable dropdowns for user selection
  - Auto-complete fields for supervisor names
  - Quick-select for frequent team compositions

### 5. Reporting Functionality

Comprehensive reporting capabilities will be added:

- **Report Types**:
  - Attendance reports (by project, date range, supervisor)
  - Safety compliance reports (hazards, incidents, BAC compliance)
  - Project management reports (briefing completion, work scope tracking)

- **Export Options**:
  - PDF export (enhanced from current functionality)
  - Excel export for data analysis
  - Email scheduling for automated report distribution

### Implementation Timeline

| Phase | Duration | Features |
|-------|----------|----------|
| 1 | 2-3 weeks | Azure Cosmos DB setup, Basic API layer, Data migration |
| 2 | 2-3 weeks | Authentication system, User management, Pre-populated dropdowns |
| 3 | 3-4 weeks | Reporting functionality, Export options, Email integration |

## Troubleshooting

- **Browser Storage**: Ensure IndexedDB works correctly in the deployed environment
- **CORS Issues**: If integrating with other services, check CORS configurations
- **Routing**: If you encounter routing issues, you may need to add a `routes.json` file in your app's public folder:
  ```json
  {
    "routes": [
      {
        "route": "/*",
        "serve": "/index.html",
        "statusCode": 200
      }
    ]
  }
  ```

## Azure Migration Guide

This guide outlines the steps to migrate the Site Pre-Start Briefing Application from local browser storage to Azure services, specifically using Azure Cosmos DB for data persistence.

### Prerequisites

- Azure Account (Free tier is sufficient to start)
- Azure CLI installed locally
- Node.js and npm installed

### Step 1: Set Up Azure Resources

1. **Create a Resource Group**
   - Log in to the [Azure Portal](https://portal.azure.com)
   - Create a new Resource Group (e.g., `site-prestart-app-rg`)

2. **Create an Azure Cosmos DB Account**
   - Select Azure Cosmos DB for MongoDB API (compatible with Mongoose)
   - Serverless capacity mode (best for free tier/low usage)
   - Name: `site-prestart-db`
   - Select the Resource Group created earlier
   - Choose the region closest to your users

3. **Create a Database and Collections**
   - Database name: `site-prestart`
   - Collections (initial): `users`, `projects`, `briefings`, `attendances`, `tokens`
   - Set throughput to minimum (autoscale with 400 RU/s minimum for free tier)

### Step 2: Configure Backend

1. **Complete Backend Implementation**
   - Create the missing configuration files:
   
   ```javascript
   // backend/src/config/db.js
   const mongoose = require('mongoose');

   const connectDB = async () => {
     try {
       const conn = await mongoose.connect(process.env.MONGODB_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       });
       console.log(`MongoDB Connected: ${conn.connection.host}`);
     } catch (error) {
       console.error(`Error connecting to MongoDB: ${error.message}`);
       process.exit(1);
     }
   };

   module.exports = connectDB;
   ```

2. **Create Environment Variables**
   - Create a `.env` file in the backend directory:
   
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_cosmos_db_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

3. **Implement Models**
   - Ensure all models match the schema defined in this README
   - Example User model:
   
   ```javascript
   // backend/src/models/User.js
   const mongoose = require('mongoose');
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');

   const UserSchema = new mongoose.Schema({
     email: {
       type: String,
       required: [true, 'Please add an email'],
       unique: true,
       match: [
         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
         'Please add a valid email'
       ]
     },
     password: {
       type: String,
       required: [true, 'Please add a password'],
       minlength: 6,
       select: false
     },
     name: {
       type: String,
       required: [true, 'Please add a name']
     },
     role: {
       type: String,
       enum: ['site_supervisor', 'project_manager', 'team_member', 'admin'],
       default: 'site_supervisor'
     },
     company: String,
     signature: String,
     preferences: {
       type: Object,
       default: {}
     },
     lastLogin: Date,
     createdAt: {
       type: Date,
       default: Date.now
     },
     updatedAt: {
       type: Date,
       default: Date.now
     }
   });

   // Encrypt password using bcrypt
   UserSchema.pre('save', async function(next) {
     if (!this.isModified('password')) {
       next();
     }
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
   });

   // Sign JWT and return
   UserSchema.methods.getSignedJwtToken = function() {
     return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
       expiresIn: process.env.JWT_EXPIRE
     });
   };

   // Match user entered password to hashed password in database
   UserSchema.methods.matchPassword = async function(enteredPassword) {
     return await bcrypt.compare(enteredPassword, this.password);
   };

   module.exports = mongoose.model('User', UserSchema);
   ```

### Step 3: Update Frontend to Connect to Backend API

1. **Create API Service**
   - Create a new file `frontend/src/utils/api.js`:
   
   ```javascript
   // Base URL for API
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

   // Helper function for making API requests
   const fetchWithAuth = async (endpoint, options = {}) => {
     // Get token from localStorage
     const token = localStorage.getItem('token');
     
     // Set headers
     const headers = {
       'Content-Type': 'application/json',
       ...options.headers
     };
     
     // Add authorization header if token exists
     if (token) {
       headers.Authorization = `Bearer ${token}`;
     }
     
     // Make request
     const response = await fetch(`${API_URL}${endpoint}`, {
       ...options,
       headers
     });
     
     // Parse JSON response
     const data = await response.json();
     
     // If response is not ok, throw error
     if (!response.ok) {
       throw new Error(data.message || 'Something went wrong');
     }
     
     return data;
   };

   // Auth services
   export const login = async (email, password) => {
     return fetchWithAuth('/auth/login', {
       method: 'POST',
       body: JSON.stringify({ email, password })
     });
   };

   export const register = async (userData) => {
     return fetchWithAuth('/auth/register', {
       method: 'POST',
       body: JSON.stringify(userData)
     });
   };

   // User services
   export const getCurrentUser = async () => {
     return fetchWithAuth('/auth/me');
   };

   // Briefing services
   export const getAllBriefings = async () => {
     return fetchWithAuth('/briefings');
   };

   export const getBriefing = async (id) => {
     return fetchWithAuth(`/briefings/${id}`);
   };

   export const createBriefing = async (briefingData) => {
     return fetchWithAuth('/briefings', {
       method: 'POST',
       body: JSON.stringify(briefingData)
     });
   };

   export const updateBriefing = async (id, briefingData) => {
     return fetchWithAuth(`/briefings/${id}`, {
       method: 'PUT',
       body: JSON.stringify(briefingData)
     });
   };

   // Attendance services
   export const getBriefingAttendances = async (briefingId) => {
     return fetchWithAuth(`/attendances/briefing/${briefingId}`);
   };

   export const createAttendance = async (attendanceData) => {
     return fetchWithAuth('/attendances', {
       method: 'POST',
       body: JSON.stringify(attendanceData)
     });
   };

   export const updateAttendance = async (id, attendanceData) => {
     return fetchWithAuth(`/attendances/${id}`, {
       method: 'PUT',
       body: JSON.stringify(attendanceData)
     });
   };

   export const deleteAttendance = async (id) => {
     return fetchWithAuth(`/attendances/${id}`, {
       method: 'DELETE'
     });
   };

   // Project services
   export const getAllProjects = async () => {
     return fetchWithAuth('/projects');
   };
   ```

2. **Update Frontend Environment Variables**
   - Create a `.env` file in the frontend directory:
   
   ```
   REACT_APP_API_URL=https://your-azure-function-app-url/api
   ```

3. **Modify Frontend to Use API Instead of IndexedDB**
   - Update `frontend/src/utils/db.js` to use the API service instead of Dexie:
   
   ```javascript
   import * as api from './api';

   let useApi = true; // Set to true by default now

   export const setUseApi = (value) => {
     useApi = value;
   };

   // User operations
   export const getUserByEmail = async (email) => {
     try {
       // This would need to be implemented on the backend
       const users = await api.getAllUsers();
       return users.find(user => user.email === email);
     } catch (error) {
       console.error('Error getting user by email:', error);
       return null;
     }
   };

   export const createUser = async (userData) => {
     try {
       return await api.register(userData);
     } catch (error) {
       console.error('Error creating user:', error);
       throw error;
     }
   };

   // Briefing operations
   export const getAllBriefings = async () => {
     try {
       return await api.getAllBriefings();
     } catch (error) {
       console.error('Error getting all briefings:', error);
       return [];
     }
   };

   export const getBriefing = async (id) => {
     try {
       return await api.getBriefing(id);
     } catch (error) {
       console.error('Error getting briefing:', error);
       return null;
     }
   };

   export const saveBriefing = async (briefing) => {
     try {
       if (briefing.id || briefing._id) {
         const id = briefing.id || briefing._id;
         return await api.updateBriefing(id, briefing);
       } else {
         return await api.createBriefing(briefing);
       }
     } catch (error) {
       console.error('Error saving briefing:', error);
       throw error;
     }
   };

   // Attendance operations
   export const getBriefingAttendances = async (briefingId) => {
     try {
       return await api.getBriefingAttendances(briefingId);
     } catch (error) {
       console.error('Error getting briefing attendances:', error);
       return [];
     }
   };

   export const saveAttendance = async (attendance) => {
     try {
       if (attendance.id || attendance._id) {
         const id = attendance.id || attendance._id;
         return await api.updateAttendance(id, attendance);
       } else {
         return await api.createAttendance(attendance);
       }
     } catch (error) {
       console.error('Error saving attendance:', error);
       throw error;
     }
   };

   export const deleteAttendance = async (id) => {
     try {
       await api.deleteAttendance(id);
       return { success: true };
     } catch (error) {
       console.error('Error deleting attendance:', error);
       throw error;
     }
   };

   // Project operations
   export const getAllProjects = async () => {
     try {
       return await api.getAllProjects();
     } catch (error) {
       console.error('Error getting all projects:', error);
       return [];
     }
   };

   // Implement other methods as needed...
   ```

### Step 4: Deploy to Azure

1. **Deploy Backend API to Azure Functions**
   - Create an Azure Function App
   - Configure it to use Node.js
   - Deploy the backend code
   - Set environment variables in the Function App Configuration

2. **Update Static Web App Configuration**
   - Update the GitHub workflow file to include backend deployment
   - Configure API proxying in the Static Web App

3. **Configure CORS**
   - Ensure CORS is properly configured in the Azure Function App to allow requests from the Static Web App

### Step 5: Data Migration

1. **Create a Data Migration Script**
   - Create a script to export data from IndexedDB
   - Create a script to import data into Cosmos DB

   ```javascript
   // Example migration script (frontend/src/utils/migrateData.js)
   import Dexie from 'dexie';
   import * as api from './api';

   export const migrateDataToAzure = async () => {
     try {
       // Get all databases
       const databases = await window.indexedDB.databases();
       let latestDb = null;
       let latestTimestamp = 0;
       
       // Find the latest database
       for (const { name } of databases) {
         if (name && name.startsWith('site_prestart_')) {
           const timestamp = parseInt(name.split('_')[2]);
           if (timestamp > latestTimestamp) {
             latestTimestamp = timestamp;
             latestDb = name;
           }
         }
       }
       
       if (!latestDb) {
         console.log('No database found to migrate');
         return { success: false, message: 'No database found to migrate' };
       }
       
       // Open the database
       const db = new Dexie(latestDb);
       db.version(1).stores({
         users: '++id, email',
         projects: '++id',
         briefings: '++id',
         attendances: '++id, briefingId',
         tokens: '++id, token'
       });
       
       await db.open();
       
       // Migrate users
       const users = await db.users.toArray();
       for (const user of users) {
         try {
           await api.createUser(user);
           console.log(`Migrated user: ${user.email}`);
         } catch (error) {
           console.error(`Error migrating user ${user.email}:`, error);
         }
       }
       
       // Migrate projects
       const projects = await db.projects.toArray();
       for (const project of projects) {
         try {
           await api.createProject(project);
           console.log(`Migrated project: ${project.name}`);
         } catch (error) {
           console.error(`Error migrating project ${project.name}:`, error);
         }
       }
       
       // Migrate briefings
       const briefings = await db.briefings.toArray();
       for (const briefing of briefings) {
         try {
           await api.createBriefing(briefing);
           console.log(`Migrated briefing: ${briefing.id}`);
         } catch (error) {
           console.error(`Error migrating briefing ${briefing.id}:`, error);
         }
       }
       
       // Migrate attendances
       const attendances = await db.attendances.toArray();
       for (const attendance of attendances) {
         try {
           await api.createAttendance(attendance);
           console.log(`Migrated attendance: ${attendance.id}`);
         } catch (error) {
           console.error(`Error migrating attendance ${attendance.id}:`, error);
         }
       }
       
       db.close();
       
       return { success: true, message: 'Data migration completed successfully' };
     } catch (error) {
       console.error('Error migrating data:', error);
       return { success: false, message: `Error migrating data: ${error.message}` };
     }
   };
   ```

2. **Add Migration UI to the Application**
   - Create a migration page in the admin section
   - Add a button to trigger the migration
   - Show progress and results

### Step 6: Testing and Validation

1. **Test the Application Locally**
   - Run the backend locally with MongoDB
   - Connect the frontend to the local backend
   - Verify all functionality works as expected

2. **Test the Application on Azure**
   - Deploy to Azure
   - Test all functionality
   - Verify data migration

### Step 7: Monitoring and Maintenance

1. **Set Up Azure Application Insights**
   - Add Application Insights to the Function App
   - Configure logging and monitoring

2. **Set Up Alerts**
   - Configure alerts for errors and performance issues

3. **Backup Strategy**
   - Configure regular backups of the Cosmos DB

### Cost Considerations for Free Tier

When using the free tier of Azure services, keep in mind the following limitations:

1. **Azure Cosmos DB Free Tier**
   - 1000 RU/s provisioned throughput
   - 25 GB of storage
   - Consider using serverless capacity mode to minimize costs

2. **Azure Functions Free Tier**
   - 1 million executions per month
   - 400,000 GB-s of resource consumption

3. **Azure Static Web Apps Free Tier**
   - 100 GB bandwidth per month
   - 2 custom domains
   - 500,000 API requests per month

To stay within the free tier limits:
- Implement efficient queries to minimize RU consumption
- Use caching strategies to reduce database calls
- Consider implementing pagination for large data sets
- Monitor usage regularly to avoid unexpected charges

### Additional Resources

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

## Azure Deployment Configuration

This application is deployed using Azure services:

1. **Frontend**: Azure Static Web App
2. **Backend**: Azure App Service
3. **Database**: Azure Cosmos DB with MongoDB API

### Deployment Prerequisites

- Azure CLI installed and configured
- Node.js and npm installed
- PowerShell for running deployment scripts

### Deployment Process

#### Backend Deployment

1. Deploy the backend to Azure App Service:
   ```powershell
   cd scripts
   .\deploy-backend.ps1
   ```

2. Configure environment variables in Azure App Service:
   - `MONGODB_URI`: Connection string to your Cosmos DB
   - `JWT_SECRET`: Secret key for JWT authentication
   - `NODE_ENV`: Set to "production"

3. Troubleshooting backend deployment:
   - Check App Service logs in Azure Portal
   - Verify web.config configuration
   - Ensure CORS is properly configured
   - Test API endpoints directly using the `/api/health` endpoint

#### Frontend Deployment

1. Deploy the frontend to Azure Static Web App:
   ```powershell
   cd scripts
   .\deploy-frontend.ps1
   ```

2. Configure environment variables for the frontend:
   - `REACT_APP_API_URL`: URL to your backend API (https://prestart-api1.azurewebsites.net/api)

3. Troubleshooting frontend deployment:
   - Check browser console for CORS errors
   - Verify Static Web App configuration in the Azure Portal
   - Test API connectivity using browser developer tools

### Known Issues and Troubleshooting

#### API Connectivity Issues

If you encounter "Failed to fetch" errors:

1. **CORS Configuration**: Ensure CORS is properly configured in both Azure App Service and in the backend code
2. **API Timeouts**: The App Service may be in a cold start state - try restarting the App Service
3. **Network Issues**: Verify network connectivity between Static Web App and App Service
4. **Authentication**: Check if authentication tokens are being correctly sent and processed

#### User Creation Issues

If user creation fails:

1. Check the request payload in browser developer tools
2. Verify the backend route is correctly handling the request
3. Check for validation errors in the API response
4. Ensure database connection is working properly

#### Deployment Script Issues

If deployment scripts fail:

1. **Azure CLI Version**: The script includes fallbacks for different Azure CLI versions
2. **Permissions**: Ensure you have proper permissions for Azure resources
3. **Resource Availability**: Verify that Azure resources exist and are accessible

### Local Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Configure environment variables:
   - Create `.env` files in both frontend and backend directories
   - Follow the examples in `.env.example` files

4. Run the applications:
   ```bash
   # Start backend
   cd backend
   npm run dev

   # Start frontend
   cd ../frontend
   npm start
   ```
