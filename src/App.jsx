import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import CandidateLogin from './Pages/Candidate/CandidateLogin'
import RecruiterLogin from './Pages/Recruiter/RecruiterLogin'
import AdminLogin from './Pages/Admin/AdminLogin'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
