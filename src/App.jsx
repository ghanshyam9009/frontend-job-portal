import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Contexts/AuthContext'
import ProtectedRoute from './Components/ProtectedRoute'
import HomePage from './Pages/HomePage'
import JobListings from './Pages/JobListings'
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
import MembershipPlans from './Pages/Candidate/MembershipPlans'
import Messages from './Pages/Candidate/Messages'
import RecruiterLogin from './Pages/Recruiter/RecruiterLogin'
import RecruiterDashboard from './Pages/Recruiter/RecruiterDashboard'
import PostJob from './Pages/Recruiter/PostJob'
import ManageJobs from './Pages/Recruiter/ManageJobs'
import CandidateApplications from './Pages/Recruiter/CandidateApplications'
import ShortlistCandidates from './Pages/Recruiter/ShortlistCandidates'
import CompanyProfile from './Pages/Recruiter/CompanyProfile'
import MembershipTokens from './Pages/Recruiter/MembershipTokens'
import RecruiterSettings from './Pages/Recruiter/RecruiterSettings'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import ManageCandidates from './Pages/Admin/ManageCandidates'
import ManageEmployers from './Pages/Admin/ManageEmployers'
import AdminManageJobs from './Pages/Admin/ManageJobs'
import ReportsAnalytics from './Pages/Admin/ReportsAnalytics'
import AdminSettings from './Pages/Admin/AdminSettings'
import NotificationsLogs from './Pages/Admin/NotificationsLogs'
import ManageMembershipPlans from './Pages/Admin/ManageMembershipPlans'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/job/:slug" element={<Jobdescription />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/userdashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/userjoblistings" element={<ProtectedRoute><UserJobListings /></ProtectedRoute>} />
          <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute><AppliedJobs /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileManagement /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/membership" element={<ProtectedRoute><MembershipPlans /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/dashboard" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/post-job" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
          <Route path="/manage-jobs" element={<ProtectedRoute><ManageJobs /></ProtectedRoute>} />
          <Route path="/candidate-applications" element={<ProtectedRoute><CandidateApplications /></ProtectedRoute>} />
          <Route path="/shortlist-candidates" element={<ProtectedRoute><ShortlistCandidates /></ProtectedRoute>} />
          <Route path="/company-profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
          <Route path="/membership-tokens" element={<ProtectedRoute><MembershipTokens /></ProtectedRoute>} />
          <Route path="/recruiter-settings" element={<ProtectedRoute><RecruiterSettings /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/candidates" element={<ManageCandidates />} />
          <Route path="/admin/employers" element={<ManageEmployers />} />
          <Route path="/admin/jobs" element={<AdminManageJobs />} />
          <Route path="/admin/reports" element={<ReportsAnalytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/notifications" element={<NotificationsLogs />} />
          <Route path="/admin/membership" element={<ManageMembershipPlans />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
