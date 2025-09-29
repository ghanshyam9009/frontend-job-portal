import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Contexts/AuthContext'
import ProtectedRoute from './Components/ProtectedRoute'
import HomePage from './Pages/HomePage'
import JobListings from './Pages/JobListings'
import GovernmentJobs from './Pages/GovernmentJobs'
import Jobdescription from './Pages/Jobdescription'
import AboutUs from './Pages/AboutUs'
import ContactUs from './Pages/ContactUs'
import CandidateLogin from './Pages/Candidate/CandidateLogin'
import UserDashboard from './Pages/Candidate/UserDashboard'
import UserJobListings from './Pages/Candidate/UserJobListings'
import SavedJobs from './Pages/Candidate/SavedJobs'
import AppliedJobs from './Pages/Candidate/AppliedJobs'
import ProfileManagement from './Pages/Candidate/ProfileManagement'
import Settings from './Pages/Candidate/Settings'
import Membership from './Pages/Membership'
import Messages from './Pages/Candidate/Messages'
import CandidateLayout from './Components/Candidate/CandidateLayout'
import RecruiterLogin from './Pages/Recruiter/RecruiterLogin'
import RecruiterLayout from './Components/Recruiter/RecruiterLayout'
import RecruiterDashboard from './Pages/Recruiter/RecruiterDashboard'
import PostJob from './Pages/Recruiter/PostJob'
import ManageJobs from './Pages/Recruiter/ManageJobs'
import CandidateApplications from './Pages/Recruiter/CandidateApplications'
import ShortlistCandidates from './Pages/Recruiter/ShortlistCandidates'
import CompanyProfile from './Pages/Recruiter/CompanyProfile'
import MembershipTokens from './Pages/Recruiter/MembershipTokens'
import RecruiterSettings from './Pages/Recruiter/RecruiterSettings'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminLayout from './Components/Admin/AdminLayout'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import ManageCandidates from './Pages/Admin/ManageCandidates'
import ManageEmployers from './Pages/Admin/ManageEmployers'
import AdminManageJobs from './Pages/Admin/ManageJobs'
import ReportsAnalytics from './Pages/Admin/ReportsAnalytics'
import AdminSettings from './Pages/Admin/AdminSettings'
import NotificationsLogs from './Pages/Admin/NotificationsLogs'
import ManageMembershipPlans from './Pages/Admin/ManageMembershipPlans'
import PendingJobs from './Pages/Admin/PendingJobs'
import HomepageForms from './Pages/Admin/HomepageForms'
import ContactForms from './Pages/Admin/ContactForms'
import GovernmentJobsManagement from './Pages/Admin/GovernmentJobsManagement'
import JobApplications from './Pages/Admin/JobApplications'
import ResetPassword from './Pages/Auth/ResetPassword'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/government-jobs" element={<GovernmentJobs />} />
          <Route path="/job/:slug" element={<Jobdescription />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          
          <Route element={<ProtectedRoute role="candidate"><CandidateLayout /></ProtectedRoute>}>
            <Route path="/userdashboard" element={<UserDashboard />} />
            <Route path="/userjoblistings" element={<UserJobListings />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/my-applications" element={<AppliedJobs />} />
            <Route path="/profile" element={<ProfileManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/membership-plans" element={<Membership />} />
            <Route path="/messages" element={<Messages />} />
          </Route>


          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route element={<ProtectedRoute role="recruiter"><RecruiterLayout /></ProtectedRoute>}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route path="/candidate-applications" element={<CandidateApplications />} />
            <Route path="/shortlist-candidates" element={<ShortlistCandidates />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/membership-tokens" element={<MembershipTokens />} />
            <Route path="/recruiter-settings" element={<RecruiterSettings />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/candidates" element={<ManageCandidates />} />
            <Route path="/admin/employers" element={<ManageEmployers />} />
            <Route path="/admin/jobs" element={<AdminManageJobs />} />
            <Route path="/admin/reports" element={<ReportsAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/notifications" element={<NotificationsLogs />} />
            <Route path="/admin/membership" element={<ManageMembershipPlans />} />
            <Route path="/admin/pending-jobs" element={<PendingJobs />} />
            <Route path="/admin/homepage-forms" element={<HomepageForms />} />
            <Route path="/admin/contact-forms" element={<ContactForms />} />
            <Route path="/admin/government-jobs" element={<GovernmentJobsManagement />} />
            <Route path="/admin/job-applications" element={<JobApplications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
