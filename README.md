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
