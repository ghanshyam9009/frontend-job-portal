import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import { 
  Check, 
  Building, 
  Briefcase, 
  MapPin, 
  Clock, 
  FileText, 
  Award,
  X,
  Plus,
  ArrowLeft
} from "lucide-react";

const EditJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [jobData, setJobData] = useState({
    job_title: "",
    company_name: user?.company_name || "",
    location: "",
    employment_type: "Full-Time",
    work_mode: "On-site",
    salary_range: {
      min: "",
      max: "",
      currency: "INR",
    },
    experience_required: {
      min_years: "",
      max_years: "",
    },
    skills_required: [],
    description: "",
    responsibilities: "",
    qualifications: "",
    application_deadline: "",
    contact_email: user?.email || "",
    job_status: "open",
  });

  const [newSkill, setNewSkill] = useState("");

  // Fetch job data on component mount
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoadingJob(true);
        setError(null);
        
        const jobsData = await recruiterExternalService.getAllPostedJobs(user?.employer_id || user?.id);
        const job = jobsData?.jobs?.find(j => j.job_id === jobId);
        
        if (job) {
          setJobData({
            job_title: job.job_title || "",
            company_name: job.company_name || user?.company_name || "",
            location: job.location || "",
            employment_type: job.employment_type || "Full-Time",
            work_mode: job.work_mode || "On-site",
            salary_range: {
              min: job.salary_range?.min || "",
              max: job.salary_range?.max || "",
              currency: job.salary_range?.currency || "INR",
            },
            experience_required: {
              min_years: job.experience_required?.min_years || "",
              max_years: job.experience_required?.max_years || "",
            },
            skills_required: job.skills_required || [],
            description: job.description || "",
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join("\n") : job.responsibilities || "",
            qualifications: Array.isArray(job.qualifications) ? job.qualifications.join("\n") : job.qualifications || "",
            application_deadline: job.application_deadline || "",
            contact_email: job.contact_email || user?.email || "",
            job_status: job.job_status || "open",
          });
        } else {
          setError("Job not found");
        }
      } catch (err) {
        setError("Failed to load job data");
        console.error(err);
      } finally {
        setLoadingJob(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId, user]);

  const handleInputChange = (field, value) => {
    const keys = field.split(".");
    if (keys.length > 1) {
      setJobData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setJobData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !jobData.skills_required.includes(newSkill.trim())) {
      setJobData((prev) => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setJobData((prev) => ({
      ...prev,
      skills_required: prev.skills_required.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const jobPayload = {
        ...jobData,
        employer_id: user.employer_id,
        responsibilities: jobData.responsibilities.split("\n"),
        qualifications: jobData.qualifications.split("\n"),
      };

      const response = await fetch(`http://localhost:4000/api/job/Updatejobs/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobPayload),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        throw new Error('Failed to update job');
      }
    } catch (err) {
      setError("Failed to update job. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccess(false);
    navigate('/manage-jobs');
  };

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showSuccessModal) {
        handleCloseSuccessModal();
      }
    };

    if (showSuccessModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showSuccessModal]);

  // Handle click outside modal to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseSuccessModal();
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  if (loadingJob) {
    return (
      <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8`}>
        <div className="max-w-5xl mx-auto">
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-8 text-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className={`text-xl font-bold ${textColor}`}>Loading job data...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error && !jobData.job_title) {
    return (
      <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8`}>
        <div className="max-w-5xl mx-auto">
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-8 text-center`}>
            <h2 className={`text-xl font-bold ${textColor} mb-4`}>Error: {error}</h2>
            <button
              onClick={() => navigate('/manage-jobs')}
              className="px-6 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors font-medium"
            >
              Back to Manage Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/manage-jobs')}
              className={`p-2 ${cardBg} border ${borderColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <ArrowLeft className={textColor} size={20} />
            </button>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Briefcase className="text-blue-500" size={24} />
            </div>
            <h1 className={`text-2xl lg:text-3xl font-bold ${textColor}`}>Edit Job Posting</h1>
          </div>
          <p className={`${textSecondary} text-sm ml-14`}>Update the details below to modify the job posting</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-blue-500" size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobData.job_title}
                  onChange={(e) => handleInputChange("job_title", e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  required
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="Your company name"
                  required
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="text"
                    value={jobData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA or Remote"
                    required
                    className={`w-full pl-10 pr-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={jobData.employment_type}
                  onChange={(e) => handleInputChange("employment_type", e.target.value)}
                  required
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                >
                  <option value="Full-Time">Full-time</option>
                  <option value="Part-Time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={jobData.work_mode}
                  onChange={(e) => handleInputChange("work_mode", e.target.value)}
                  required
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Application Deadline
                </label>
                <div className="relative">
                  <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="date"
                    value={jobData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Salary Range
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={jobData.salary_range.currency}
                    onChange={(e) => handleInputChange("salary_range.currency", e.target.value)}
                    className={`px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input
                    type="number"
                    value={jobData.salary_range.min}
                    onChange={(e) => handleInputChange("salary_range.min", e.target.value)}
                    placeholder="Min"
                    className={`flex-1 px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                  <span className={textSecondary}>-</span>
                  <input
                    type="number"
                    value={jobData.salary_range.max}
                    onChange={(e) => handleInputChange("salary_range.max", e.target.value)}
                    placeholder="Max"
                    className={`flex-1 px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Experience Required (Years)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={jobData.experience_required.min_years}
                    onChange={(e) => handleInputChange("experience_required.min_years", e.target.value)}
                    placeholder="Min"
                    className={`flex-1 px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                  <span className={textSecondary}>-</span>
                  <input
                    type="number"
                    value={jobData.experience_required.max_years}
                    onChange={(e) => handleInputChange("experience_required.max_years", e.target.value)}
                    placeholder="Max"
                    className={`flex-1 px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-purple-500" size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Job Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={jobData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide a detailed job description..."
                  rows={6}
                  required
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>
                    Responsibilities <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={jobData.responsibilities}
                    onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                    placeholder="List key responsibilities (one per line)..."
                    rows={6}
                    required
                    className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>
                    Qualifications <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={jobData.qualifications}
                    onChange={(e) => handleInputChange("qualifications", e.target.value)}
                    placeholder="List required qualifications (one per line)..."
                    rows={6}
                    required
                    className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-green-500" size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Required Skills</h2>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a required skill and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className={`flex-1 px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {jobData.skills_required.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`inline-flex items-center gap-2 px-3 py-1.5 ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium`}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={() => navigate('/manage-jobs')}
              className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Job"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <div className={`${cardBg} rounded-lg shadow-2xl max-w-md w-full`}>
            <div className={`flex items-center justify-between p-5 border-b ${borderColor}`}>
              <h2 className={`text-xl font-bold ${textColor}`}>Success!</h2>
              <button 
                onClick={handleCloseSuccessModal}
                className={`${textSecondary} hover:${textColor} transition-colors`}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <p className={`text-lg ${textColor} mb-2`}>
                Job updated successfully!
              </p>
              <p className={`${textSecondary} text-sm`}>
                The job posting has been updated with the new information.
              </p>
            </div>
            
            <div className={`p-4 border-t ${borderColor}`}>
              <button 
                onClick={handleCloseSuccessModal}
                className="w-full px-4 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditJob;