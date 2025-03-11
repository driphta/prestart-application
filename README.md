# Site Pre-Start Briefing Application

## Project Overview

This web application digitizes the pre-shift briefing process for construction and industrial sites, replacing paper-based forms with a streamlined digital solution. The application handles two primary workflows:

1. **Supervisor Workflow**: Creating daily briefing forms with site details, safety information, and work scope
2. **Team Member Workflow**: Digital sign-on process with BAC recording and time tracking

The application will primarily function as a client-side solution, using browser storage for data persistence and generating PDFs for email distribution to project managers.

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
- [ ] Basic authentication system
- [ ] Pre-populated user information

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
- `role`: String (enum: "supervisor", "team_member", "admin")
- `company`: String
- `signature`: String (base64 encoded image)
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
- `supervisor`: String
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

- **Azure Account**: Active Azure subscription (ID: 15a943e0-94ac-41e7-af2d-a76f98ad61de)
- **GitHub Account**: For source code repository (recommended for CI/CD)
- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher
- **Azure CLI**: Latest version
- **Visual Studio Code**: With Azure extensions (recommended)

### Step 1: Prepare Your Application

1. Ensure your application is working correctly locally
2. Update any environment-specific configurations
3. Create a production build of your React application:
   ```bash
   cd frontend
   npm run build
   ```

### Step 2: Set Up GitHub Repository (Recommended)

1. Create a new GitHub repository
2. Initialize Git in your local project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Connect to your GitHub repository:
   ```bash
   git remote add origin https://github.com/yourusername/prestart-application.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Azure Static Web Apps

Azure Static Web Apps is the recommended service for hosting this React application since it's primarily a frontend application using browser storage.

#### Deploy via GitHub (Recommended)

1. In the Azure Portal (https://portal.azure.com), sign in with your account
2. Search for "Static Web Apps" and click "Create"
3. Configure the basics:
   - **Subscription**: 15a943e0-94ac-41e7-af2d-a76f98ad61de
   - **Resource Group**: Create new > "PrestartApp-RG"
   - **Name**: Prestart Application
   - **Region**: Australia East (best for Australian users)
   - **SKU**: Free (or Standard if you need custom domains)

4. Sign in with GitHub and select:
   - **Organization**: Your GitHub username
   - **Repository**: prestart-application (or your repository name)
   - **Branch**: main

5. Configure the build settings:
   - **Build Preset**: React
   - **App location**: `/frontend`
   - **Api location**: Leave empty
   - **Output location**: `build`

6. Click "Review + create" and then "Create"
7. Wait for the deployment to complete (this may take a few minutes)

### Step 4: Configure Custom Domain (Optional)

1. In the Azure Portal, navigate to your Static Web App
2. Go to "Custom domains"
3. Add your domain and follow the verification process

### Step 5: Set Up GitHub Actions for Continuous Deployment

The GitHub Actions workflow file will be automatically created in your repository when you deploy to Azure Static Web Apps. This workflow will:

1. Automatically build and deploy your application when changes are pushed to the main branch
2. Create preview environments for pull requests
3. Remove preview environments when pull requests are closed

You can find the workflow file in your GitHub repository under `.github/workflows/`.

### Step 6: Test Your Deployed Application

1. In the Azure Portal, navigate to your Static Web App
2. Click on the URL provided in the overview page
3. Verify that your application is working correctly, including:
   - Browser storage (IndexedDB) functionality
   - PDF generation
   - All UI components and features

### Step 7: Future Azure Service Integration

As the application grows, you may want to integrate additional Azure services:

- **Azure Functions**: For server-side logic if needed
- **Azure Communication Services**: For email integration (to send PDFs to Project Managers)
- **Azure AD B2C**: For authentication
- **Azure Cosmos DB**: If you decide to move from browser storage to cloud storage

### Troubleshooting

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

- **Security Measures**:
  - HTTPS enforcement
  - Token expiration and refresh
  - Input validation and sanitization
  - Rate limiting

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
