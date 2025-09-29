

## Overview
This job portal frontend is now fully integrated with API services for seamless backend communication. The application supports three user roles: Candidates, Employers, and Admins.

## API Integration Structure

### Configuration
- **Development**: `http://localhost:5173/api`
- **Production**: `https://your-aws-api-url.com/api`
- Environment-based configuration in `src/config/api.js`

### Services Architecture
All API calls are organized into dedicated service modules:

#### Core Services
- `authService` - Authentication & authorization
- `userService` - User management
- `candidateService` - Candidate operations
- `employerService` - Employer operations
- `jobService` - Job posting & management
- `applicationService` - Job applications
- `savedJobService` - Saved jobs functionality

#### Additional Services
- `notificationService` - Notifications
- `planService` - Subscription plans
- `tokenService` - Token management
- `paymentService` - Payment processing
- `statsService` - Analytics & statistics

### Database Schema Integration
The API endpoints are designed to work with the provided database schema:

#### Tables Supported
- **Users** - Common user table for all roles
- **Candidates** - Candidate-specific data
- **Employers** - Employer/company data
- **Jobs** - Job postings
- **Applications** - Job applications
- **Saved Jobs** - Candidate saved jobs
- **Admin Actions** - Admin operations log
- **Notifications** - System notifications
- **Skill Master** - Skills management
- **Subscription/Plans** - Membership plans
- **Tokens** - Token system
- **Payments** - Payment transactions

## Usage Examples

### Authentication
```javascript
import { authService } from './services';

// Login
const response = await authService.login('user@example.com', 'password', 'Candidate');

// Register
const response = await authService.register({
  full_name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'Candidate'
});
```

### Job Operations
```javascript
import { jobService } from './services';

// Get all jobs
const jobs = await jobService.getAllJobs();

// Create job
const newJob = await jobService.createJob({
  title: 'Frontend Developer',
  description: 'Job description...',
  salary_min: 500000,
  salary_max: 800000,
  job_type: 'Full-time',
  location: 'Mumbai'
});

// Search jobs
const searchResults = await jobService.searchJobs({
  location: 'Mumbai',
  skills: ['React', 'JavaScript'],
  salary_min: 500000
});
```

### Application Management
```javascript
import { applicationService } from './services';

// Apply for job
const application = await applicationService.createApplication({
  job_id: 1,
  candidate_id: 1,
  cover_letter: 'I am interested in this position...'
});

// Update application status (for employers)
await applicationService.updateApplicationStatus(1, 'Shortlisted', 'Great candidate');
```

### Custom Hooks
```javascript
import { useApi } from './hooks/useApi';
import { jobService } from './services';

// In your component
const { data: jobs, loading, error, execute } = useApi(jobService.getAllJobs);

// Execute API call
useEffect(() => {
  execute();
}, []);
```

## Environment Setup

### Development
1. Set your backend API URL in `src/config/api.js`
2. Ensure CORS is configured on your backend
3. Start the development server: `npm run dev`

### Production
1. Update the production API URL in `src/config/api.js`
2. Build the application: `npm run build`
3. Deploy to your AWS hosting service

## Key Features

### Authentication Flow
- JWT token-based authentication
- Automatic token refresh
- Role-based access control
- Password reset functionality

### Error Handling
- Global error interceptor
- Automatic logout on 401 errors
- User-friendly error messages

### File Uploads
- Resume upload for candidates
- Company logo upload for employers
- File type and size validation

### Real-time Features
- Notifications system
- Application status updates
- Dashboard statistics

### Payment Integration
- Subscription plans
- Token purchase system
- Payment gateway integration ready

## API Response Format
All API responses follow this structure:
```javascript
{
  success: boolean,
  data: object | array,
  message: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

## Error Handling
API errors are automatically handled with:
- 401: Automatic logout and redirect to login
- 403: Access denied messages
- 500+: Server error logging
- Network errors: User-friendly messages

## Testing
Test your API integration:
1. Start your backend server
2. Update API configuration
3. Test authentication flow
4. Verify CRUD operations
5. Check error handling

## Support
For API integration issues:
1. Check browser network tab
2. Verify API endpoints
3. Check authentication tokens
4. Review error messages in console




Configuration & Setup
src/config/api.js - Environment-based API configuration (localhost for dev, AWS URL for production)
src/services/apiClient.js - Axios instance with interceptors for auth tokens and error handling
package.json - Updated with axios dependency
�� Service Modules (One service per module as requested)
authService.js - Login, register, logout, password reset
userService.js - User CRUD operations
candidateService.js - Candidate profile, resume upload, skills
employerService.js - Company profile, job management
jobService.js - Job posting, search, filtering
applicationService.js - Job applications, status updates
savedJobService.js - Save/unsave jobs functionality
notificationService.js - Notifications management
planService.js - Subscription plans
tokenService.js - Token purchase and usage
paymentService.js - Payment processing
statsService.js - Analytics and dashboard stats
�� Database Schema Integration
All services are designed to work with your provided database schema:
Users table (common for all roles)
Candidates, Employers, Jobs, Applications tables
Saved Jobs, Admin Actions, Notifications tables
Skills Master, Subscription Plans, Tokens, Payments tables
🛠 Utility Functions
src/utils/constants.js - All enums, options, and constants
src/utils/helpers.js - Currency formatting, date handling, validation, etc.
src/hooks/useApi.js - Custom hooks for API calls with loading states