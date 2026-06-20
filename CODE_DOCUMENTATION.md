# Job Portal Application - Code Documentation

## Overview
This is a comprehensive Job Portal application built with React (frontend) and a backend API. The application supports three main user roles: Candidates (Students), Recruiters (Employers), and Administrators.

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with Vite
- **HTTP Client**: Axios for API communication
- **State Management**: React Context API
- **Routing**: React Router
- **Styling**: CSS Modules
- **UI Components**: Custom components with Lucide React icons
- **Notifications**: React Toastify
- **Build Tool**: Vite

### Project Structure
```
src/
├── Components/          # Reusable UI components
│   ├── Admin/          # Admin-specific components
│   ├── Candidate/      # Candidate-specific components
│   └── Recruiter/      # Recruiter-specific components
├── Contexts/           # React Context providers
├── Pages/              # Page components organized by user role
├── services/           # API service layer
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── Styles/             # CSS Modules
└── assets/             # Static assets
```

## API Architecture

### API Client (`src/services/apiClient.js`)
The main API client is built using Axios with the following features:

#### Key Features:
- **Base Configuration**: Centralized API base URL and timeout settings
- **Authentication**: Automatic JWT token injection via request interceptor
- **Error Handling**: Comprehensive error handling with response interceptor
- **Request/Response Transformation**: Automatic data extraction from responses

#### Request Interceptor:
```javascript
// Automatically adds Bearer token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Response Interceptor:
```javascript
// Handles common errors and extracts response data
apiClient.interceptors.response.use(
  (response) => response.data,  // Extract data from successful responses
  (error) => {
    // Handle 403, 5xx errors
    return Promise.reject(error.response?.data || error.message);
  }
);
```

### API Configuration (`src/config/api.js`)
Centralized API endpoint management with environment-specific configurations.

#### Environment Configuration:
```javascript
const API_CONFIG = {
  development: {
    baseURL: 'https://api.bigsources.in/api',
    timeout: 10000
  },
  production: {
    baseURL: 'https://api.bigsources.in/api',
    timeout: 15000
  }
};
```

#### API Endpoints Structure:
The configuration includes comprehensive endpoints for:
- **Authentication**: Login, logout, password reset
- **Users**: Students, Recruiters, Admins
- **Jobs**: CRUD operations, search, filtering
- **Applications**: Job applications management
- **Saved Jobs**: Bookmark functionality
- **Notifications**: User notifications
- **Payments**: Payment processing
- **Admin Operations**: User management, analytics

## Authentication System

### Auth Service (`src/services/authService.js`)
Handles all authentication-related operations:

#### Key Features:
- **Multi-role Support**: Separate login endpoints for candidates, recruiters, and admins
- **Session Management**: 24-hour session expiry with automatic logout
- **Token Management**: JWT token storage and refresh
- **Password Operations**: Forgot/reset password functionality

#### Session Management:
```javascript
// Check if session has expired (24 hours)
isSessionExpired() {
  const loginTimestamp = this.getLoginTimestamp();
  if (!loginTimestamp) return true;

  const currentTime = Date.now();
  const sessionDuration = currentTime - parseInt(loginTimestamp);
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return sessionDuration >= twentyFourHours;
}
```

### Auth Context (`src/Contexts/AuthContext.jsx`)
React Context provider for authentication state management:

#### Features:
- **Global State**: Authentication status, user data, loading states
- **Auto-logout**: Periodic session expiry checks (every 5 minutes)
- **User Updates**: Centralized user data management
- **Error Handling**: Integrated with toast notifications

#### Context Structure:
```javascript
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication methods: login, register, logout, etc.
};
```

## Service Layer Architecture

### Service Organization
Services are organized by functionality and user roles:

#### Core Services:
- `apiClient.js` - Main HTTP client
- `authService.js` - Authentication operations
- `candidateService.js` - Candidate-specific operations
- `recruiterService.js` - Recruiter-specific operations
- `adminService.js` - Admin-specific operations

#### External Services:
- `candidateExternalService.js` - External API integrations for candidates
- `recruiterExternalService.js` - External API integrations for recruiters

### Service Pattern
Each service follows a consistent pattern:

```javascript
export const serviceName = {
  // CRUD operations
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.endpoint.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.endpoint.create, data);
      return response;
    } catch (error) {
      throw error;
    }
  }
};
```

## Custom Hooks

### useApi Hook (`src/hooks/useApi.js`)
Custom hook for managing API call states:

#### Features:
- **Loading States**: Automatic loading state management
- **Error Handling**: Centralized error state
- **Execution Control**: Manual execution with `execute` function

#### Usage:
```javascript
const { data, loading, error, execute } = useApi(apiFunction);

// Manual execution
const handleSubmit = async () => {
  const result = await execute(formData);
};
```

#### useApiEffect Hook:
```javascript
const { data, loading, error } = useApiEffect(apiFunction, dependencies);
// Automatically executes on mount or dependency change
```

## Error Handling System

### Error Handler (`src/utils/errorHandler.js`)
Comprehensive error handling with toast notifications:

#### Error Types:
- `NETWORK_ERROR` - Network connectivity issues
- `VALIDATION_ERROR` - Input validation errors
- `AUTHENTICATION_ERROR` - Login/authorization failures
- `AUTHORIZATION_ERROR` - Permission denied
- `SERVER_ERROR` - Backend server errors
- `UNKNOWN_ERROR` - Unhandled errors

#### Error Parsing:
```javascript
export const parseError = (error) => {
  if (error?.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400: return { type: ERROR_TYPES.VALIDATION, message: data?.message };
      case 401: return { type: ERROR_TYPES.AUTHENTICATION, message: data?.message };
      case 403: return { type: ERROR_TYPES.AUTHORIZATION, message: data?.message };
      // ... other status codes
    }
  }
};
```

#### Toast Notifications:
- **Success**: Green notifications for successful operations
- **Error**: Red notifications for failures
- **Info**: Blue notifications for information
- **Warning**: Yellow notifications for warnings

## Component Architecture

### Layout Components
- **CandidateLayout**: Layout for candidate pages with navigation
- **RecruiterLayout**: Layout for recruiter pages with navigation
- **AdminLayout**: Layout for admin pages with navigation

### Protected Routes
```javascript
<Route element={<ProtectedRoute role="candidate"><CandidateLayout /></ProtectedRoute>}>
  {/* Protected candidate routes */}
</Route>
```

### Page Organization
Pages are organized by user role:
```
Pages/
├── Candidate/     # Candidate-specific pages
├── Recruiter/     # Recruiter-specific pages
├── Admin/         # Admin-specific pages
└── Auth/          # Authentication pages
```

## Data Flow Patterns

### API Call Flow:
1. **Component** triggers API call via service method
2. **Service** calls `apiClient` with appropriate endpoint
3. **apiClient** adds authentication headers via interceptor
4. **Backend** processes request and returns response
5. **Response Interceptor** extracts data or handles errors
6. **Component** receives data or error for UI updates

### Authentication Flow:
1. **Login Page** collects credentials
2. **AuthService.login()** calls appropriate endpoint
3. **AuthContext** updates global state
4. **Token** stored in localStorage
5. **Protected Routes** allow access based on role
6. **Periodic Checks** validate session expiry

### State Management Flow:
1. **Context Providers** wrap the application
2. **Components** consume context via `useContext` hooks
3. **State Updates** trigger re-renders across component tree
4. **Local Storage** persists authentication data

## Key Features Implementation

### Job Management:
- **Posting Jobs**: Recruiters can create/edit job postings
- **Job Search**: Advanced filtering and search capabilities
- **Applications**: Candidates can apply to jobs
- **Saved Jobs**: Bookmark functionality for candidates

### User Management:
- **Profiles**: Comprehensive profile management for all user types
- **Membership**: Premium membership system with tokens
- **Notifications**: Real-time notifications for important events

### Admin Features:
- **User Management**: Approve/reject recruiters, manage users
- **Content Management**: Manage jobs, applications, reports
- **Analytics**: Dashboard with statistics and reports

### Payment Integration:
- **Razorpay**: Payment gateway integration
- **Membership Plans**: Token-based premium features
- **Transaction Management**: Payment tracking and verification

## Security Considerations

### Authentication Security:
- JWT tokens with 24-hour expiry
- Automatic token refresh capability
- Secure token storage in localStorage
- Session expiry validation

### API Security:
- Bearer token authentication
- Role-based access control
- Input validation on backend
- CORS configuration

### Data Protection:
- Secure password handling
- File upload validation
- SQL injection prevention
- XSS protection

## Performance Optimizations

### API Optimizations:
- Request/response interceptors for efficiency
- Error boundary implementation
- Loading states to improve UX
- Caching strategies for static data

### React Optimizations:
- Context API for state management
- Custom hooks for reusable logic
- CSS Modules for scoped styling
- Lazy loading for route components

## Development Workflow

### Code Organization:
- **Separation of Concerns**: Clear separation between UI, business logic, and API calls
- **Modular Architecture**: Services, components, and utilities are modular
- **Consistent Patterns**: Standardized patterns across the codebase

### Error Handling:
- **Centralized Error Handling**: All errors flow through the error handler
- **User-Friendly Messages**: Toast notifications for user feedback
- **Logging**: Console logging for debugging

### Testing Strategy:
- **Component Testing**: Unit tests for React components
- **Service Testing**: API service layer testing
- **Integration Testing**: End-to-end user flows

## Deployment and Environment

### Environment Configuration:
- **Development**: Local development with hot reload
- **Production**: Optimized build with minification
- **API Endpoints**: Environment-specific API URLs

### Build Process:
- **Vite**: Fast build tool with optimized bundling
- **Asset Optimization**: Image compression and optimization
- **Code Splitting**: Route-based code splitting for performance

## Future Enhancements

### Potential Improvements:
- **Real-time Features**: WebSocket integration for live updates
- **Advanced Search**: Elasticsearch integration
- **Mobile App**: React Native companion app
- **Analytics**: Advanced user behavior analytics
- **AI Features**: AI-powered job matching and recommendations

This documentation provides a comprehensive overview of the Job Portal application's architecture, data flow, and implementation patterns. The modular design and consistent patterns make the codebase maintainable and scalable.
