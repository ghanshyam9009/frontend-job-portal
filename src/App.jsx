import React, { Suspense, lazy } from 'react'
import { Toaster } from "react-hot-toast";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Contexts/AuthContext'
import { SidebarProvider } from './Contexts/SidebarContext'
import ProtectedRoute from './Components/ProtectedRoute'
const HomePage = lazy(() => import('./Pages/HomePage'));
const JobListings = lazy(() => import('./Pages/JobListings'));
const GovernmentJobs = lazy(() => import('./Pages/GovernmentJobs'));
const Jobdescription = lazy(() => import('./Pages/Jobdescription'));
const AboutUs = lazy(() => import('./Pages/AboutUs'));
const ContactUs = lazy(() => import('./Pages/ContactUs'));
const CandidateLogin = lazy(() => import('./Pages/Candidate/CandidateLogin'));
const CandidateHome = lazy(() => import('./Pages/Candidate/CandidateHome'));
const UserJobListings = lazy(() => import('./Pages/Candidate/UserJobListings'));
const SavedJobs = lazy(() => import('./Pages/Candidate/SavedJobs'));
const AppliedJobs = lazy(() => import('./Pages/Candidate/AppliedJobs'));
const ShortlistedJobs = lazy(() => import('./Pages/Candidate/ShortlistedJobs'));
const ProfileManagement = lazy(() => import('./Pages/Candidate/ProfileManagement'));
const Settings = lazy(() => import('./Pages/Candidate/Settings'));
const Membership = lazy(() => import('./Pages/Membership'));
const MembershipPlans = lazy(() => import('./Pages/Candidate/MembershipPlans'));
const CandidateMembership = lazy(() => import('./Pages/Candidate/CandidateMembership'));
const RecruiterMembership = lazy(() => import('./Pages/Recruiter/RecruiterMembership'));
const CandidateLayout = lazy(() => import('./Components/Candidate/CandidateLayout'));
const RecruiterLogin = lazy(() => import('./Pages/Recruiter/RecruiterLogin'));
const RecruiterLayout = lazy(() => import('./Components/Recruiter/RecruiterLayout'));
const RecruiterDashboard = lazy(() => import('./Pages/Recruiter/RecruiterDashboard'));
const PostJob = lazy(() => import('./Pages/Recruiter/PostJob'));
const ManageJobs = lazy(() => import('./Pages/Recruiter/ManageJobs'));
const EditJob = lazy(() => import('./Pages/Recruiter/EditJob'));
const CandidateApplications = lazy(() => import('./Pages/Recruiter/CandidateApplications'));
const ShortlistCandidates = lazy(() => import('./Pages/Recruiter/ShortlistCandidates'));
const CompanyProfile = lazy(() => import('./Pages/Recruiter/CompanyProfile'));
const MembershipTokens = lazy(() => import('./Pages/Recruiter/MembershipTokens'));
const RecruiterSettings = lazy(() => import('./Pages/Recruiter/RecruiterSettings'));
const AdminLogin = lazy(() => import('./Pages/Admin/AdminLogin'));
const AdminLayout = lazy(() => import('./Components/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./Pages/Admin/AdminDashboard'));
const ManageCandidates = lazy(() => import('./Pages/Admin/ManageCandidates'));
const PendingJobApplications = lazy(() => import('./Pages/Admin/PendingJobApplications'));
const ManageEmployers = lazy(() => import('./Pages/Admin/ManageEmployers'));
const AdminManageJobs = lazy(() => import('./Pages/Admin/ManageJobs'));
const ReportsAnalytics = lazy(() => import('./Pages/Admin/ReportsAnalytics'));
const ManageMembershipPlans = lazy(() => import('./Pages/Admin/ManageMembershipPlans'));
const HomepageForms = lazy(() => import('./Pages/Admin/HomepageForms'));
const ContactForms = lazy(() => import('./Pages/Admin/ContactForms'));
const GovernmentJobsManagement = lazy(() => import('./Pages/Admin/AdminGovernmentJobs'));
const JobApplicationReports = lazy(() => import('./Pages/Admin/AdminJobReports'));
const AdminPostJob = lazy(() => import('./Pages/Admin/AdminPostJob'));
const JobPostingManagement = lazy(() => import('./Pages/Admin/JobPostingManagement'));
const ResetPassword = lazy(() => import('./Pages/Auth/ResetPassword'));
const CareerServices = lazy(() => import('./Pages/CareerServices'));
const FastTrack = lazy(() => import('./Pages/FastTrack'));
const PremiumSeeker = lazy(() => import('./Pages/PremiumSeeker'));
const CompanyReviews = lazy(() => import('./Pages/CompanyReviews'));
const SalaryTools = lazy(() => import('./Pages/SalaryTools'));
const EmployerBranding = lazy(() => import('./Pages/EmployerBranding'));
const RecruitingSolutions = lazy(() => import('./Pages/RecruitingSolutions'));
const PrivacyPolicy = lazy(() => import('./Pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./Pages/TermsOfService'));
const PaymentSuccess = lazy(() => import('./Pages/PaymentSuccess'));
const ViewApplications = lazy(() => import('./Pages/Recruiter/ViewApplications'));
const IntegratedAdminLayout = lazy(() => import('./Components/Admin/IntegratedAdminLayout'));
const AdminJobApplications = lazy(() => import('./Pages/Admin/AdminJobApplications'));
const AdminJobs = lazy(() => import('./Pages/Admin/AdminManageJobs'));
const AdminManageJobDetail = lazy(() => import('./Pages/Admin/AdminManageJobDetail'));
const AdminJobReportApplications = lazy(() => import('./Pages/Admin/AdminJobReportApplications'));
const AdminJobReportJobDetail = lazy(() => import('./Pages/Admin/AdminJobReportJobDetail'));
const AdminJobReports = lazy(() => import('./Pages/Admin/AdminJobReports'));
const AdminGovernmentJobs = lazy(() => import('./Pages/Admin/AdminGovernmentJobs'));
const AdminPostGovernmentJob = lazy(() => import('./Pages/Admin/AdminPostGovernmentJob'));
const AdminCandidateProfile = lazy(() => import('./Pages/Admin/AdminCandidateProfile'));
const AdminCandidateApplications = lazy(() => import('./Pages/Admin/AdminCandidateApplications'));
const AdminEmployerProfile = lazy(() => import('./Pages/Admin/AdminEmployerProfile'));
const AdminEmployerJobs = lazy(() => import('./Pages/Admin/AdminEmployerJobs'));
// import JobListing from './Pages/default'

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Toaster />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobListings />} />
              <Route path="/government-jobs" element={<GovernmentJobs />} />
              <Route path="/job/:id" element={<Jobdescription />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/fast-track" element={<FastTrack />} />
              <Route path="/premium-seeker" element={<PremiumSeeker />} />
              <Route path="/company-reviews" element={<CompanyReviews />} />
              <Route path="/salary-tools" element={<SalaryTools />} />
              <Route path="/employer-branding" element={<EmployerBranding />} />
              <Route path="/recruiting-solutions" element={<RecruitingSolutions />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/career-services" element={<CareerServices />} />
              <Route path="/candidate-membership" element={<CandidateMembership />} />
              <Route path="/recruiter-membership" element={<RecruiterMembership />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/candidate/login" element={<CandidateLogin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<ProtectedRoute role="candidate"><CandidateLayout /></ProtectedRoute>}>
                <Route path="/my-applications" element={<AppliedJobs />} />
                <Route path="/candidate-home" element={<HomePage />} />
                <Route path="/jobs" element={<JobListings />} />
                <Route path="/government-jobs" element={<GovernmentJobs />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/userjoblistings" element={<UserJobListings />} />
                <Route path="/saved-jobs" element={<SavedJobs />} />
                <Route path="/shortlisted-jobs" element={<ShortlistedJobs />} />
                <Route path="/profile" element={<ProfileManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/membership-plans" element={<MembershipPlans />} />
              </Route>
              <Route path="/recruiter/login" element={<RecruiterLogin />} />
              <Route element={<ProtectedRoute role="recruiter"><RecruiterLayout /></ProtectedRoute>}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/manage-jobs" element={<ManageJobs />} />
                <Route path="/edit-job/:jobId" element={<EditJob />} />
                <Route path="/view-applications/:jobId" element={<ViewApplications />} />
                <Route path="/candidate-applications" element={<CandidateApplications />} />
                <Route path="/jobs" element={<JobListings />} />
                <Route path="/shortlist-candidates" element={<ShortlistCandidates />} />
                <Route path="/company-profile" element={<CompanyProfile />} />
                <Route path="/membership-tokens" element={<MembershipTokens />} />
                <Route path="/recruiter-settings" element={<RecruiterSettings />} />
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<ProtectedRoute role="admin"><IntegratedAdminLayout /></ProtectedRoute>}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/candidates" element={<ManageCandidates />} />
                <Route path="/admin/candidates/profile/:email" element={<AdminCandidateProfile />} />
                <Route path="/admin/candidates/applications/:candidateId" element={<AdminCandidateApplications />} />
                <Route path="/admin/pending-applications" element={<PendingJobApplications />} />
                <Route path="/admin/employers" element={<ManageEmployers />} />
                {/* <Route path="/admin/employers" element={<AdminEmployers />} /> */}
                <Route path="/admin/employers/profile/:email" element={<AdminEmployerProfile />} />
                <Route path="/admin/employers/jobs/:employerId" element={<AdminEmployerJobs />} />
                <Route path="/admin/jobs" element={<AdminManageJobs />} />
                <Route path="/admin/post-job" element={<AdminPostJob />} />
                <Route path="/admin/job-applications/:jobId" element={<AdminJobApplications />} />
                <Route path="/admin/job-posting/job/:jobId" element={<AdminManageJobDetail />} />
                <Route path="/admin/job-posting" element={<AdminJobs />} />
                <Route path="/admin/edit-job/:jobId" element={<AdminPostJob />} />
                <Route path="/admin/reports" element={<ReportsAnalytics />} />
                <Route path="/admin/membership" element={<ManageMembershipPlans />} />
                <Route path="/admin/homepage-forms" element={<HomepageForms />} />
                <Route path="/admin/contact-forms" element={<ContactForms />} />
                <Route path="/admin/government-jobs" element={<AdminGovernmentJobs />} />
                <Route path="/admin/government-jobs/post" element={<AdminPostGovernmentJob />} />
                <Route path="/admin/government-jobs/edit/:jobId" element={<AdminPostGovernmentJob />} />
                {/* <Route path="/admin/job-application-reports" element={<JobApplicationReports />} /> */}
                <Route path="/admin/job-application-reports/job/:jobId" element={<AdminJobReportJobDetail />} />
                <Route path="/admin/job-application-reports" element={<AdminJobReports />} />
                <Route path="/admin/job-reports/applications/:jobId" element={<AdminJobReportApplications />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App
