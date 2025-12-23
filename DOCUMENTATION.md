# Job Portal Frontend - Complete Technical Documentation

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Application Architecture](#4-application-architecture)
5. [User Roles & Authentication](#5-user-roles--authentication)
6. [Routing System](#6-routing-system)
7. [Components Documentation](#7-components-documentation)
8. [Services & API Integration](#8-services--api-integration)
9. [State Management (Context API)](#9-state-management-context-api)
10. [Pages & Features](#10-pages--features)
11. [Utility Functions](#11-utility-functions)
12. [Data Flow Diagrams](#12-data-flow-diagrams)
13. [API Endpoints Reference](#13-api-endpoints-reference)

---

## 1. Project Overview

### What is this Application?
This is a **Job Portal Web Application** built with React.js. It connects three types of users:
- **Candidates** (Job Seekers) - People looking for jobs
- **Recruiters** (Employers) - Companies posting jobs
- **Admins** - Platform administrators managing the system

### Key Features
- Job listings and search
- Job applications
- Save/Bookmark jobs
- User profiles management
- Membership/Premium plans
- Government job listings
- Admin dashboard for management
- Payment integration (Razorpay)

---

## 2. Technology Stack

| Technology | Purpose |
|------------|---------|
| **React.js 18** | Frontend framework |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **React Toastify** | Additional notifications |
| **Razorpay** | Payment gateway |

---

## 3. Project Structure

```
frontend-job-portal/
├── public/                    # Static assets
│   └── favicon-icon.png
├── src/                       # Source code
│   ├── assets/               # Images, videos, logos
│   ├── Components/           # Reusable UI components
│   │   ├── Admin/           # Admin-specific components
│   │   ├── Candidate/       # Candidate-specific components
│   │   ├── Recruiter/       # Recruiter-specific components
│   │   ├── Shared/          # Shared/common components
│   │   ├── Footer.jsx       # Site footer
│   │   ├── HomeNav.jsx      # Home navigation
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── JobDescriptionDetail.jsx
│   ├── config/              # Configuration files
│   │   ├── api.js          # API endpoints config
│   │   └── razorpay.js     # Payment config
│   ├── Contexts/            # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state
│   │   ├── SidebarContext.jsx # Sidebar state
│   │   └── ThemeContext.jsx # Theme state
│   ├── hooks/               # Custom React hooks
│   │   └── useApi.js
│   ├── Pages/               # Page components
│   │   ├── Admin/          # Admin pages
│   │   ├── Auth/           # Authentication pages
│   │   ├── Candidate/      # Candidate pages
│   │   ├── Recruiter/      # Recruiter pages
│   │   └── [Public pages]  # HomePage, JobListings, etc.
│   ├── services/            # API service functions
│   ├── Styles/              # CSS stylesheets
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── package.json             # Dependencies
└── vite.config.js           # Vite configuration
```

---

## 4. Application Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Candidate  │  │   Recruiter  │  │    Admin     │          │
│  │    Pages     │  │    Pages     │  │    Pages     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SHARED COMPONENTS                            │
│  JobCard │ Button │ Loader │ SkeletonJobCard │ ErrorBox         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CONTEXT PROVIDERS                            │
│  AuthContext │ SidebarContext │ ThemeContext                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                              │
│  authService │ jobService │ candidateService │ recruiterService │
│  applicationService │ paymentService │ adminService │ etc.      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API CLIENT (Axios)                        │
│  - Request interceptors (add auth token)                        │
│  - Response interceptors (error handling)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API SERVER                          │
│              https://api.bigsources.in/api                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. User Roles & Authentication

### User Types

| Role | Description | Login Path |
|------|-------------|------------|
| **Candidate** | Job seekers who can browse jobs, apply, save jobs | `/candidate/login` |
| **Recruiter** | Employers who post jobs, manage applications | `/recruiter/login` |
| **Admin** | Platform administrators with full access | `/admin/login` |

### Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Login  │────▶│ authService  │────▶│  Backend API │
│    Form      │     │   .login()   │     │   /login     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
                                          ┌──────────────┐
                                          │  Store in    │
                                          │sessionStorage│
                                          │ - authToken  │
                                          │ - user data  │
                                          │ - timestamp  │
                                          └──────────────┘
                                                │
                                                ▼
                                          ┌──────────────┐
                                          │ AuthContext  │
                                          │  updates     │
                                          │ isAuthenticated│
                                          └──────────────┘
```

### Session Management
- **Session Duration**: 24 hours
- **Storage**: SessionStorage (clears on browser close)
- **Auto-logout**: After 24 hours of inactivity
- **Session Warning**: Shown when less than 1 hour remaining

### AuthContext Functions

| Function | Purpose |
|----------|---------|
| `login(email, password, role)` | Authenticates user |
| `register(userData)` | Creates new account |
| `logout()` | Ends session, clears storage |
| `updateUser(data)` | Updates user data in context |
| `forgotPassword(email)` | Initiates password reset |
| `resetPassword(token, password, role, otp)` | Completes password reset |

---

## 6. Routing System

### Route Structure (App.jsx)

```jsx
<BrowserRouter>
  <Routes>
    {/* PUBLIC ROUTES - Accessible to everyone */}
    <Route path="/" element={<HomePage />} />
    <Route path="/jobs" element={<JobListings />} />
    <Route path="/government-jobs" element={<GovernmentJobs />} />
    <Route path="/job/:slug" element={<Jobdescription />} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/contact" element={<ContactUs />} />

    {/* CANDIDATE PROTECTED ROUTES */}
    <Route element={<ProtectedRoute role="candidate"><CandidateLayout /></ProtectedRoute>}>
      <Route path="/userdashboard" element={<UserDashboard />} />
      <Route path="/saved-jobs" element={<SavedJobs />} />
      <Route path="/my-applications" element={<AppliedJobs />} />
      <Route path="/profile" element={<ProfileManagement />} />
    </Route>

    {/* RECRUITER PROTECTED ROUTES */}
    <Route element={<ProtectedRoute role="recruiter"><RecruiterLayout /></ProtectedRoute>}>
      <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/manage-jobs" element={<ManageJobs />} />
      <Route path="/candidate-applications" element={<CandidateApplications />} />
    </Route>

    {/* ADMIN PROTECTED ROUTES */}
    <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/candidates" element={<ManageCandidates />} />
      <Route path="/admin/employers" element={<ManageEmployers />} />
      <Route path="/admin/jobs" element={<AdminManageJobs />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### ProtectedRoute Component

The `ProtectedRoute` component:
1. Checks if user is authenticated
2. Verifies user role matches required role
3. For recruiters, checks admin approval status
4. Redirects to appropriate login page if not authenticated

```
User Request → ProtectedRoute → Check Auth → Check Role → Render Page
                                    │             │
                                    ▼             ▼
                              Redirect to    Redirect to
                              Login Page     Home Page
```

---

## 7. Components Documentation

### 7.1 Shared Components

#### JobCard Component
**Location**: `src/Components/Shared/JobCard.jsx`

**Purpose**: Displays job information in a card format

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `job` | Object | required | Job data object |
| `onBookmark` | Function | - | Bookmark click handler |
| `isBookmarked` | Boolean | false | Bookmark state |
| `showBookmark` | Boolean | true | Show bookmark button |
| `className` | String | '' | Additional CSS classes |
| `isDark` | Boolean | false | Dark mode styling |

**Job Object Structure**:
```javascript
{
  job_id: "string",
  job_title: "string",
  company_name: "string",
  company_logo: "string",
  location: "string",
  employment_type: "Full-time | Part-time | Contract",
  salary_range: "string or object",
  experience_required: { min_years: number, max_years: number },
  description: "string",
  created_at: "date string",
  is_premium: boolean
}
```

#### Button Component
**Location**: `src/Components/Shared/Button.jsx`

**Purpose**: Reusable button with variants

#### Loader Component
**Location**: `src/Components/Shared/Loader.jsx`

**Purpose**: Loading spinner/indicator

#### SkeletonJobCard Component
**Location**: `src/Components/Shared/SkeletonJobCard.jsx`

**Purpose**: Loading placeholder for job cards

#### ErrorBox Component
**Location**: `src/Components/Shared/ErrorBox.jsx`

**Purpose**: Error message display

### 7.2 Layout Components

#### CandidateLayout
**Location**: `src/Components/Candidate/CandidateLayout.jsx`

**Contains**:
- CandidateNavbar
- CandidateSidebar
- Main content area (Outlet)

#### RecruiterLayout
**Location**: `src/Components/Recruiter/RecruiterLayout.jsx`

**Contains**:
- RecruiterNavbar
- RecruiterSidebar
- Main content area (Outlet)

#### AdminLayout
**Location**: `src/Components/Admin/AdminLayout.jsx`

**Contains**:
- AdminNavbar
- AdminSidebar
- Main content area (Outlet)

---

## 8. Services & API Integration

### 8.1 API Client Setup

**Location**: `src/services/apiClient.js`

```javascript
// Creates axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'https://api.bigsources.in/api',
  timeout: 10000  // 10 seconds
});

// Request interceptor - adds auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Error handling logic
  }
);
```

### 8.2 Service Files

| Service | File | Purpose |
|---------|------|---------|
| **authService** | `authService.js` | Login, logout, registration, password reset |
| **jobService** | `jobService.js` | CRUD operations for jobs |
| **candidateService** | `candidateService.js` | Candidate profile operations |
| **recruiterService** | `recruiterService.js` | Recruiter profile operations |
| **applicationService** | `applicationService.js` | Job applications |
| **savedJobService** | `savedJobService.js` | Bookmark/save jobs |
| **appliedJobService** | `appliedJobService.js` | Applied jobs tracking |
| **adminService** | `adminService.js` | Admin operations |
| **paymentService** | `paymentService.js` | Payment processing |
| **planService** | `planService.js` | Membership plans |
| **notificationService** | `notificationService.js` | User notifications |
| **statsService** | `statsService.js` | Dashboard statistics |

### 8.3 Service Example - jobService

```javascript
export const jobService = {
  // Get all jobs
  async getAllJobs(params = {}) {
    const response = await apiClient.get('/jobs', { params });
    return response;
  },

  // Get job by ID
  async getJobById(jobId) {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response;
  },

  // Create new job
  async createJob(jobData) {
    const response = await apiClient.post('/job/jobs', jobData);
    return response;
  },

  // Update job
  async updateJob(jobId, jobData) {
    const response = await apiClient.put(`/jobs/${jobId}`, jobData);
    return response;
  },

  // Delete job
  async deleteJob(jobId) {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response;
  },

  // Search jobs
  async searchJobs(searchParams) {
    const response = await apiClient.get('/jobs/search', { params: searchParams });
    return response;
  }
};
```

### 8.4 How Components Use Services

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Component     │     │    Service      │     │    API Client   │
│  (JobListings)  │────▶│  (jobService)   │────▶│    (Axios)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  1. Call service      │  2. Make HTTP        │
        │     function          │     request          │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Update State   │◀────│  Return Data    │◀────│  Backend API    │
│  (useState)     │     │                 │     │  Response       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Example Usage in Component**:
```jsx
import { jobService } from '../services';

function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobService.getAllJobs();
        setJobs(response.data || []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div>
      {jobs.map(job => <JobCard key={job.job_id} job={job} />)}
    </div>
  );
}
```

---

## 9. State Management (Context API)

### 9.1 AuthContext

**Location**: `src/Contexts/AuthContext.jsx`

**Purpose**: Manages authentication state across the application

**State Values**:
```javascript
{
  isAuthenticated: boolean,    // Is user logged in?
  user: object | null,         // Current user data
  loading: boolean,            // Auth check in progress?
  isRecruiterApproved: boolean // For recruiters only
}
```

**Usage**:
```jsx
import { useAuth } from '../Contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### 9.2 SidebarContext

**Location**: `src/Contexts/SidebarContext.jsx`

**Purpose**: Manages sidebar open/close state

### 9.3 ThemeContext

**Location**: `src/Contexts/ThemeContext.jsx`

**Purpose**: Manages light/dark theme preference

---

## 10. Pages & Features

### 10.1 Public Pages

| Page | Path | Description |
|------|------|-------------|
| HomePage | `/` | Landing page with featured jobs |
| JobListings | `/jobs` | Browse all jobs with filters |
| GovernmentJobs | `/government-jobs` | Government job listings |
| Jobdescription | `/job/:slug` | Single job details |
| AboutUs | `/about` | About the company |
| ContactUs | `/contact` | Contact form |
| Membership | `/membership` | Membership plans info |
| CareerServices | `/career-services` | Career services info |
| PrivacyPolicy | `/privacy-policy` | Privacy policy |
| TermsOfService | `/terms-of-service` | Terms of service |

### 10.2 Candidate Pages

| Page | Path | Description |
|------|------|-------------|
| CandidateLogin | `/candidate/login` | Login/Register |
| UserDashboard | `/userdashboard` | Dashboard overview |
| UserJobListings | `/userjoblistings` | Browse jobs |
| SavedJobs | `/saved-jobs` | Bookmarked jobs |
| AppliedJobs | `/my-applications` | Job applications |
| ProfileManagement | `/profile` | Edit profile |
| Settings | `/settings` | Account settings |
| MembershipPlans | `/membership-plans` | Upgrade plans |

### 10.3 Recruiter Pages

| Page | Path | Description |
|------|------|-------------|
| RecruiterLogin | `/recruiter/login` | Login/Register |
| RecruiterDashboard | `/recruiter/dashboard` | Dashboard overview |
| PostJob | `/post-job` | Create new job |
| ManageJobs | `/manage-jobs` | View/edit posted jobs |
| EditJob | `/edit-job/:jobId` | Edit specific job |
| CandidateApplications | `/candidate-applications` | View applications |
| ShortlistCandidates | `/shortlist-candidates` | Shortlisted candidates |
| CompanyProfile | `/company-profile` | Company details |
| MembershipTokens | `/membership-tokens` | Token management |
| RecruiterSettings | `/recruiter-settings` | Account settings |

### 10.4 Admin Pages

| Page | Path | Description |
|------|------|-------------|
| AdminLogin | `/admin/login` | Admin login |
| AdminDashboard | `/admin/dashboard` | Dashboard overview |
| ManageCandidates | `/admin/candidates` | Manage candidates |
| ManageEmployers | `/admin/employers` | Manage recruiters |
| AdminManageJobs | `/admin/jobs` | Manage all jobs |
| AdminPostJob | `/admin/post-job` | Post job as admin |
| PendingJobApplications | `/admin/pending-applications` | Review applications |
| ReportsAnalytics | `/admin/reports` | Analytics reports |
| ManageMembershipPlans | `/admin/membership` | Manage plans |
| HomepageForms | `/admin/homepage-forms` | Form submissions |
| ContactForms | `/admin/contact-forms` | Contact form submissions |
| GovernmentJobsManagement | `/admin/government-jobs` | Manage govt jobs |

---

## 11. Utility Functions

### 11.1 Error Handler

**Location**: `src/utils/errorHandler.js`

```javascript
// Show success toast
showSuccess(message);

// Show error toast
showError(error, fallbackMessage);

// Wrap async function with error handling
withErrorHandling(asyncFn, errorMessage);
```

### 11.2 Helpers

**Location**: `src/utils/helpers.js`

Common utility functions for:
- Date formatting
- String manipulation
- Data validation

### 11.3 Constants

**Location**: `src/utils/constants.js`

Application-wide constants:
- Employment types
- Job categories
- Status values

---

## 12. Data Flow Diagrams

### 12.1 Job Application Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Candidate  │───▶│  Job Card   │───▶│    Job      │───▶│   Apply     │
│  Browses    │    │   Click     │    │  Details    │    │   Button    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                               │
                                                               ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Success    │◀───│   Backend   │◀───│ Application │◀───│   Submit    │
│  Message    │    │   Creates   │    │   Service   │    │Application  │
└─────────────┘    │ Application │    │   Call      │    │   Form      │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

### 12.2 Job Posting Flow (Recruiter)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Recruiter  │───▶│  Post Job   │───▶│  Fill Job   │───▶│   Submit    │
│  Dashboard  │    │   Page      │    │   Form      │    │   Button    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                               │
                                                               ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Job       │◀───│   Backend   │◀───│    Job      │◀───│  Validate   │
│  Created    │    │   Creates   │    │   Service   │    │   Data      │
│  Success    │    │    Job      │    │  .createJob │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 12.3 Save/Bookmark Job Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Candidate  │───▶│  Bookmark   │───▶│ savedJob    │───▶│   Backend   │
│  Clicks     │    │   Icon      │    │  Service    │    │   API       │
│  Bookmark   │    │             │    │   .save()   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                               │
                                                               ▼
┌─────────────┐    ┌─────────────┐                      ┌─────────────┐
│   UI        │◀───│   Update    │◀─────────────────────│   Job       │
│  Updates    │    │   State     │                      │   Saved     │
│  (filled)   │    │             │                      │             │
└─────────────┘    └─────────────┘                      └─────────────┘
```

---

## 13. API Endpoints Reference

### Base URL
```
https://api.bigsources.in/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/students/login` | Candidate login |
| POST | `/students/register` | Candidate registration |
| POST | `/Recruiter/login` | Recruiter login |
| POST | `/recruiter/register` | Recruiter registration |
| POST | `/admin/login` | Admin login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Refresh token |
| POST | `/password/send-otp` | Send OTP for password reset |
| POST | `/password/verify-otp` | Verify OTP |
| POST | `/password/reset-password` | Reset password |

### Job Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs` | Get all jobs |
| GET | `/jobs/:id` | Get job by ID |
| POST | `/job/jobs` | Create new job |
| PUT | `/jobs/:id` | Update job |
| DELETE | `/jobs/:id` | Delete job |
| GET | `/jobs/search` | Search jobs |
| GET | `/jobs/featured` | Get featured jobs |
| GET | `/jobs/recent` | Get recent jobs |
| GET | `/jobs/government` | Get government jobs |
| POST | `/job/Govtjobs` | Create government job |

### Application Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications` | Get all applications |
| GET | `/applications/:id` | Get application by ID |
| POST | `/applications` | Create application |
| PUT | `/applications/:id` | Update application |
| POST | `/applications/jobs/:jobId/apply` | Apply to job |
| GET | `/applications/job/:jobId` | Get applications by job |
| GET | `/applications/student/:studentId` | Get applications by student |

### Saved Jobs (Bookmarks)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookmarkjobs` | Get all bookmarks |
| GET | `/bookmarkjobs/user/:userId` | Get user's bookmarks |
| POST | `/bookmarkjobs` | Save job |
| DELETE | `/bookmarkjobs/:jobId/user/:userId` | Remove bookmark |

### User Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students/profile/:email` | Get candidate profile |
| PUT | `/students/profile/:email` | Update candidate profile |
| POST | `/students/:id/resume` | Upload resume |
| POST | `/students/:id/profile-image` | Upload profile image |
| GET | `/recruiter/profile/:email` | Get recruiter profile |
| PUT | `/Recruiter/update/:email` | Update recruiter profile |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/get-all-recruiter` | Get all recruiters |
| POST | `/admin/approved-recruiter` | Approve/reject recruiter |
| PUT | `/admin/candidate/:email/status` | Update candidate status |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments` | Create payment |
| GET | `/payments/user/:userId` | Get user payments |
| POST | `/payments/:id/verify` | Verify payment |

### Plans Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | Get all plans |
| GET | `/plans/:id` | Get plan by ID |
| POST | `/plans` | Create plan |
| PUT | `/plans/:id` | Update plan |
| DELETE | `/plans/:id` | Delete plan |

---

## Quick Reference Card

### Starting Development
```bash
npm install     # Install dependencies
npm run dev     # Start development server
npm run build   # Build for production
```

### Adding a New Page
1. Create page component in `src/Pages/[Role]/`
2. Add route in `App.jsx`
3. Add navigation link in respective Navbar/Sidebar

### Adding a New API Service
1. Add endpoint in `src/config/api.js`
2. Create service function in `src/services/`
3. Export from `src/services/index.js`

### Using Authentication
```jsx
import { useAuth } from '../Contexts/AuthContext';
const { user, isAuthenticated, login, logout } = useAuth();
```

### Making API Calls
```jsx
import { jobService } from '../services';
const jobs = await jobService.getAllJobs();
```

---

## Document Version
- **Version**: 1.0
- **Last Updated**: December 2024
- **Author**: Development Team

---

