// Static Data - Centralized location for all static arrays and data
// Move all hardcoded arrays here to maintain consistency

// Navigation Links
export const CANDIDATE_NAV_LINKS = [
  { path: '/userdashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/userjoblistings', label: 'Browse Jobs', icon: 'Briefcase' },
  { path: '/saved-jobs', label: 'Saved Jobs', icon: 'Bookmark' },
  { path: '/my-applications', label: 'My Applications', icon: 'FileText' },
  { path: '/profile', label: 'Profile', icon: 'User' },
  { path: '/settings', label: 'Settings', icon: 'Settings' }
];

export const RECRUITER_NAV_LINKS = [
  { path: '/recruiter/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/post-job', label: 'Post Job', icon: 'Plus' },
  { path: '/manage-jobs', label: 'Manage Jobs', icon: 'Briefcase' },
  { path: '/candidate-applications', label: 'Applications', icon: 'Users' },
  { path: '/shortlist-candidates', label: 'Shortlisted', icon: 'Star' },
  { path: '/company-profile', label: 'Company Profile', icon: 'Building' },
  { path: '/recruiter-settings', label: 'Settings', icon: 'Settings' }
];

export const ADMIN_NAV_LINKS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/admin/candidates', label: 'Candidates', icon: 'Users' },
  { path: '/admin/employers', label: 'Employers', icon: 'Building' },
  { path: '/admin/jobs', label: 'Jobs', icon: 'Briefcase' },
  { path: '/admin/pending-applications', label: 'Pending', icon: 'Clock' },
  { path: '/admin/reports', label: 'Reports', icon: 'BarChart' },
  { path: '/admin/membership', label: 'Membership', icon: 'Crown' },
  { path: '/admin/government-jobs', label: 'Govt Jobs', icon: 'Landmark' }
];

export const PUBLIC_NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/jobs', label: 'Jobs' },
  { path: '/government-jobs', label: 'Govt Jobs' },
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' }
];

// Footer Links
export const FOOTER_LINKS = {
  company: [
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/careers', label: 'Careers' },
    { path: '/blog', label: 'Blog' }
  ],
  candidates: [
    { path: '/jobs', label: 'Browse Jobs' },
    { path: '/government-jobs', label: 'Government Jobs' },
    { path: '/career-services', label: 'Career Services' },
    { path: '/membership', label: 'Premium Plans' }
  ],
  employers: [
    { path: '/recruiter/login', label: 'Post a Job' },
    { path: '/membership', label: 'Pricing' },
    { path: '/employer-resources', label: 'Resources' }
  ],
  legal: [
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms-of-service', label: 'Terms of Service' },
    { path: '/cookie-policy', label: 'Cookie Policy' }
  ]
};

// Social Links
export const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://facebook.com', icon: 'Facebook' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'Twitter' },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' }
];

// Job Filter Options
export const JOB_FILTER_OPTIONS = {
  employmentTypes: [
    { value: 'Full-time', label: 'Full Time' },
    { value: 'Part-time', label: 'Part Time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Freelance', label: 'Freelance' }
  ],
  experienceLevels: [
    { value: '0-1', label: 'Fresher (0-1 years)' },
    { value: '1-3', label: 'Junior (1-3 years)' },
    { value: '3-5', label: 'Mid-Level (3-5 years)' },
    { value: '5-8', label: 'Senior (5-8 years)' },
    { value: '8+', label: 'Lead/Expert (8+ years)' }
  ],
  salaryRanges: [
    { value: '0-3', label: '₹0 - ₹3 LPA' },
    { value: '3-6', label: '₹3 - ₹6 LPA' },
    { value: '6-10', label: '₹6 - ₹10 LPA' },
    { value: '10-15', label: '₹10 - ₹15 LPA' },
    { value: '15-25', label: '₹15 - ₹25 LPA' },
    { value: '25+', label: '₹25+ LPA' }
  ],
  sortOptions: [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'salary-high', label: 'Salary: High to Low' },
    { value: 'salary-low', label: 'Salary: Low to High' },
    { value: 'relevance', label: 'Most Relevant' }
  ]
};

// Dashboard Stats Labels
export const DASHBOARD_STATS = {
  candidate: [
    { key: 'applied', label: 'Applications', icon: 'FileText', color: 'blue' },
    { key: 'saved', label: 'Saved Jobs', icon: 'Bookmark', color: 'yellow' },
    { key: 'interviews', label: 'Interviews', icon: 'Calendar', color: 'green' },
    { key: 'offers', label: 'Offers', icon: 'Award', color: 'purple' }
  ],
  recruiter: [
    { key: 'activeJobs', label: 'Active Jobs', icon: 'Briefcase', color: 'blue' },
    { key: 'totalApplications', label: 'Applications', icon: 'Users', color: 'green' },
    { key: 'shortlisted', label: 'Shortlisted', icon: 'Star', color: 'yellow' },
    { key: 'hired', label: 'Hired', icon: 'CheckCircle', color: 'purple' }
  ],
  admin: [
    { key: 'totalUsers', label: 'Total Users', icon: 'Users', color: 'blue' },
    { key: 'totalJobs', label: 'Total Jobs', icon: 'Briefcase', color: 'green' },
    { key: 'pendingApprovals', label: 'Pending', icon: 'Clock', color: 'yellow' },
    { key: 'revenue', label: 'Revenue', icon: 'DollarSign', color: 'purple' }
  ]
};

// Membership Plans
export const MEMBERSHIP_PLANS = {
  candidate: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'Forever',
      features: [
        'Browse all jobs',
        'Apply to 5 jobs/month',
        'Basic profile',
        'Email alerts'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 499,
      duration: 'per month',
      features: [
        'Unlimited job applications',
        'Priority profile visibility',
        'Resume builder',
        'Career coaching session',
        'Premium badge',
        'Direct recruiter contact'
      ],
      popular: true
    }
  ],
  recruiter: [
    {
      id: 'starter',
      name: 'Starter',
      price: 999,
      duration: 'per month',
      features: [
        '5 job postings',
        'Basic candidate search',
        '50 profile views',
        'Email support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 2499,
      duration: 'per month',
      features: [
        '20 job postings',
        'Advanced candidate search',
        '200 profile views',
        'Priority support',
        'Analytics dashboard'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 4999,
      duration: 'per month',
      features: [
        'Unlimited job postings',
        'Full candidate database access',
        'Unlimited profile views',
        'Dedicated account manager',
        'Custom integrations',
        'API access'
      ]
    }
  ]
};

// Form Field Configurations
export const FORM_FIELDS = {
  candidateProfile: [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true, disabled: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'location', label: 'Location', type: 'text', required: false },
    { name: 'about', label: 'About', type: 'textarea', required: false }
  ],
  jobPost: [
    { name: 'job_title', label: 'Job Title', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'employment_type', label: 'Employment Type', type: 'select', required: true },
    { name: 'experience_min', label: 'Min Experience (years)', type: 'number', required: true },
    { name: 'experience_max', label: 'Max Experience (years)', type: 'number', required: false },
    { name: 'salary_min', label: 'Min Salary (LPA)', type: 'number', required: false },
    { name: 'salary_max', label: 'Max Salary (LPA)', type: 'number', required: false },
    { name: 'description', label: 'Job Description', type: 'textarea', required: true },
    { name: 'requirements', label: 'Requirements', type: 'textarea', required: true },
    { name: 'skills', label: 'Required Skills', type: 'tags', required: true }
  ]
};

// Error Messages
export const ERROR_MESSAGES = {
  required: (field) => `${field} is required`,
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  password: 'Password must be at least 8 characters',
  passwordMatch: 'Passwords do not match',
  fileSize: (max) => `File size must be less than ${max}`,
  fileType: (types) => `Allowed file types: ${types.join(', ')}`,
  network: 'Network error. Please check your connection.',
  server: 'Server error. Please try again later.',
  unauthorized: 'Session expired. Please login again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  login: 'Login successful!',
  register: 'Registration successful!',
  logout: 'Logged out successfully',
  profileUpdate: 'Profile updated successfully',
  jobPost: 'Job posted successfully',
  jobUpdate: 'Job updated successfully',
  jobDelete: 'Job deleted successfully',
  applicationSubmit: 'Application submitted successfully',
  bookmarkAdd: 'Job saved to bookmarks',
  bookmarkRemove: 'Job removed from bookmarks'
};

export default {
  CANDIDATE_NAV_LINKS,
  RECRUITER_NAV_LINKS,
  ADMIN_NAV_LINKS,
  PUBLIC_NAV_LINKS,
  FOOTER_LINKS,
  SOCIAL_LINKS,
  JOB_FILTER_OPTIONS,
  DASHBOARD_STATS,
  MEMBERSHIP_PLANS,
  FORM_FIELDS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};









