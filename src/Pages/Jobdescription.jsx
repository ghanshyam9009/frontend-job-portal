// src/Pages/JobDescription.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { applicationService } from "../services/applicationService";
import { candidateExternalService } from "../services/candidateExternalService";
import { studentService } from "../services/studentService";
import HomeNav from "../Components/HomeNav";
import { Bookmark, Briefcase, MapPin, Sparkles, TrendingUp } from "lucide-react";
import Footer from "../Components/Footer";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";

const JobDescription = () => {
  // theme
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [showRelatedJobs, setShowRelatedJobs] = useState(false);
  // job state
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState("");
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/job/${slug}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const jobData = await response.json();
        setJob(jobData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (slug) {
      fetchJob();
    }
  }, [slug]);

  // Check if user has applied for this job
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!isAuthenticated || !user || !job) return;

      try {
        const applications = await applicationService.getUserApplications(user.user_id || user.id);
        const hasApplied = applications.some(app => app.job_id === job.job_id);
        setHasApplied(hasApplied);
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };

    checkApplicationStatus();
  }, [isAuthenticated, user, job]);

  // Handle job application
  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/candidate/login');
      return;
    }

    setIsApplying(true);
    setApplicationError('');
    setApplicationSuccess('');

    try {
      await applicationService.applyForJob({
        user_id: user.user_id || user.id,
        job_id: job.job_id,
        application_status: 'pending'
      });
      setApplicationSuccess('Application submitted successfully!');
      setHasApplied(true);
    } catch (error) {
      setApplicationError(error.message || 'Failed to apply for job');
    } finally {
      setIsApplying(false);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!isAuthenticated || !user) {
      navigate('/candidate/login');
      return;
    }

    try {
      const userId = user.user_id || user.id;
      const isCurrentlyBookmarked = bookmarkedJobs.has(job.job_id);

      if (isCurrentlyBookmarked) {
        await candidateExternalService.unbookmarkJob({ user_id: userId, job_id: job.job_id });
        setBookmarkedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(job.job_id);
          return newSet;
        });
      } else {
        await candidateExternalService.bookmarkJob({ user_id: userId, job_id: job.job_id });
        setBookmarkedJobs(prev => new Set([...prev, job.job_id]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Fetch related jobs
  useEffect(() => {
    const fetchRelatedJobs = async () => {
      if (!job) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs?category=${job.category}&limit=3`);
        const relatedData = await response.json();
        setRelatedJobs(relatedData.jobs.filter(j => j.job_id !== job.job_id));
      } catch (error) {
        console.error('Error fetching related jobs:', error);
      }
    };

    fetchRelatedJobs();
  }, [job]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? <CandidateNavbar /> : <HomeNav />}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={job.company_logo || '/placeholder-company.png'}
                  alt={job.company_name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.job_title}</h1>
                  <p className="text-lg text-gray-600">{job.company_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.employment_type}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {job.salary_range || 'Salary not specified'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-md border ${
                  bookmarkedJobs.has(job.job_id)
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'border-gray-300 text-gray-400 hover:text-gray-600'
                }`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-4">
            {!hasApplied ? (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? 'Applying...' : 'Apply Now'}
              </button>
            ) : (
              <button
                disabled
                className="bg-green-600 text-white px-8 py-3 rounded-md cursor-not-allowed"
              >
                Already Applied
              </button>
            )}

            <button
              onClick={() => navigate('/jobs')}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50"
            >
              Back to Jobs
            </button>
          </div>

          {applicationError && (
            <p className="text-red-600 mt-2">{applicationError}</p>
          )}
          {applicationSuccess && (
            <p className="text-green-600 mt-2">{applicationSuccess}</p>
          )}
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <JobDescriptionDetail description={job.description} />
            </div>
          </div>

          <div className="space-y-6">
            {/* Job Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-600">{job.category || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Experience:</span>
                  <p className="text-gray-600">{job.experience_level || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.skills_required?.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    )) || <p className="text-gray-600">Not specified</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Jobs</h3>
                <div className="space-y-3">
                  {relatedJobs.slice(0, 3).map((relatedJob) => (
                    <div
                      key={relatedJob.job_id}
                      className="border border-gray-200 rounded-md p-3 hover:border-blue-300 cursor-pointer"
                      onClick={() => navigate(`/job/${relatedJob.job_title?.toLowerCase().replace(/\s+/g, '-') || relatedJob.id}`)}
                    >
                      <h4 className="font-medium text-gray-900">{relatedJob.job_title}</h4>
                      <p className="text-sm text-gray-600">{relatedJob.company_name}</p>
                      <p className="text-sm text-gray-500">{relatedJob.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobDescription;
