# Job Portal Frontend

A modern React-based job portal application built with Vite, featuring role-based access for candidates, recruiters, and administrators.

## Features

- **Multi-role Authentication**: Support for Candidates, Recruiters, and Admins
- **Job Management**: Post, search, and apply for jobs
- **Profile Management**: Comprehensive user profiles with resume upload
- **Admin Dashboard**: Complete administrative controls
- **Payment Integration**: Razorpay integration for premium features
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context
- **HTTP Client**: Axios
- **Payment**: Razorpay
- **Icons**: Lucide React, React Icons
- **Build Tool**: Vite with legacy browser support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ghanshyam9009/frontend-job-portal.git
cd frontend-job-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:
```env
# API Configuration
VITE_API_BASE_URL=https://api.bigsources.in/api

# Razorpay Payment Gateway Configuration
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_production_razorpay_key_secret

# Google OAuth (if needed)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Lint and Format

```bash
npm run lint
```

## Environment Variables

The application uses the following environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | No | `https://api.bigsources.in/api` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID for payments | No | Test key |
| `VITE_RAZORPAY_KEY_SECRET` | Razorpay Key Secret | No | Test secret |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | No | - |

## AWS Amplify Deployment

This application is configured for AWS Amplify deployment. The build process expects certain SSM parameters to be configured for production:

### Required SSM Parameters

Set up the following parameters in AWS Systems Manager Parameter Store under `/amplify/d3mwx0lf3r9ngs/Production/`:

- `/amplify/d3mwx0lf3r9ngs/Production/VITE_API_BASE_URL`
- `/amplify/d3mwx0lf3r9ngs/Production/VITE_RAZORPAY_KEY_ID`
- `/amplify/d3mwx0lf3r9ngs/Production/VITE_RAZORPAY_KEY_SECRET`
- `/amplify/d3mwx0lf3r9ngs/Production/VITE_GOOGLE_CLIENT_ID` (optional)

### Troubleshooting SSM Issues

If you see the warning `!Failed to set up process.env.secrets` in the build log:

1. Ensure the SSM parameters exist with the correct path
2. Verify the IAM role has permissions to access SSM parameters
3. Check that parameter names match exactly (case-sensitive)
4. Confirm the parameters are in the correct region

The build will continue with fallback values, but production features may not work correctly without proper secrets.

## Project Structure

```
src/
├── Components/          # Reusable UI components
│   ├── Admin/          # Admin-specific components
│   ├── Candidate/      # Candidate-specific components
│   ├── Recruiter/      # Recruiter-specific components
│   └── Shared/         # Shared components
├── Pages/              # Page components
│   ├── Admin/          # Admin pages
│   ├── Candidate/      # Candidate pages
│   ├── Recruiter/      # Recruiter pages
│   └── Auth/           # Authentication pages
├── services/           # API service functions
├── config/             # Configuration files
├── Contexts/           # React contexts
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── Styles/             # CSS modules
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.
