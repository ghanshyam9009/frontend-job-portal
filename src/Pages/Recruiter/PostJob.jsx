import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { jobService } from "../../services/jobService";
import { recruiterService } from "../../services/recruiterService";
import { calculateRecruiterProfileCompletion, isProfileComplete } from "../../utils/recruiterProfileUtils";
import { 
  Check, 
  AlertTriangle, 
  Building, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  FileText, 
  Users, 
  Award,
  X,
  Plus
} from "lucide-react";

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [jobData, setJobData] = useState({
    job_title: "",
    company_name: user?.company_name || "",
    location: "",
    employment_type: "Full-Time",
    work_mode: "On-site",
    salary_range: "",
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
  const [canPostJob, setCanPostJob] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState("");

  // Check profile completion and KYC status
  useEffect(() => {
    if (user) {
      const profileComplete = isProfileComplete(user);
      const adminApproved = user.hasadminapproved === true;

      if (!profileComplete) {
        const completionPercentage = calculateRecruiterProfileCompletion(user);
        setCanPostJob(false);
        setRestrictionReason(`Complete your company profile (${completionPercentage}% / 100%) before posting jobs. Please complete all required fields.`);
      } else if (!adminApproved) {
        setCanPostJob(false);
        setRestrictionReason("Admin approval is required before you can access hiring features. Please wait for approval.");
      } else {
        setCanPostJob(true);
        setRestrictionReason("");
      }
    } else {
        setCanPostJob(false);
        setRestrictionReason("Unable to verify account status. Please refresh and try again.");
    }
  }, [user]);

  // Fetch recruiter profile data including company logo
  useEffect(() => {
    const fetchRecruiterProfile = async () => {
      if (user?.email) {
        try {
          const response = await recruiterService.getProfile(user.email, true);
          if (response.success && response.data) {
            const profileData = response.data.employer || response.data.profile || response.data;
            setRecruiterProfile(profileData);
          }
        } catch (err) {
          console.error('Failed to fetch recruiter profile:', err);
        }
      }
    };

    fetchRecruiterProfile();
  }, [user?.email]);

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
        company_logo: recruiterProfile?.company_logo || recruiterProfile?.logo || null, // Include company logo from profile
        responsibilities: jobData.responsibilities.split("\n"),
        qualifications: jobData.qualifications.split("\n"),
      };



      await jobService.createJob(jobPayload);
      setShowSuccessModal(true);
      // Clear form data after successful submission
      setJobData({
        job_title: "",
        company_name: user?.company_name || "",
        location: "",
        employment_type: "Full-Time",
        work_mode: "On-site",
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
    } catch (err) {
      setError("Failed to post job. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    alert("Job saved as draft!");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccess(false);
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

  return (
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Briefcase className="text-blue-500" size={24} />
            </div>
            <h1 className={`text-2xl lg:text-3xl font-bold ${textColor}`}>Post New Job</h1>
          </div>
          <p className={`${textSecondary} text-sm`}>Fill in the details below to create a new job posting</p>
        </div>

        {/* Restriction Notice */}
        {!canPostJob && restrictionReason && (
          <div className={`${cardBg} border-2 border-yellow-500 rounded-lg p-5 mb-6`}>
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-yellow-500 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className={`font-bold ${textColor} mb-2`}>Job Posting Restricted</h3>
                <p className={`${textSecondary} text-sm mb-3`}>{restrictionReason}</p>
                <button
                  onClick={() => navigate('/company-profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors text-sm font-medium"
                >
                  <Building size={16} />
                  Complete Profile & KYC
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className={`space-y-6 ${!canPostJob ? 'opacity-50 pointer-events-none' : ''}`}
        >
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
                <input
                  type="text"
                  value={jobData.salary_range}
                  onChange={(e) => handleInputChange('salary_range', e.target.value)}
                  placeholder="e.g., ₹5,00,000 - ₹8,00,000 per annum"
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
              </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${textColor} mb-2`}>
                      Experience Required (Years)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <select
                        value={jobData.experience_required.min_years}
                        onChange={(e) => handleInputChange("experience_required.min_years", e.target.value)}
                        className={`px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      >
                        <option value="">Min Experience</option>
                        <option value="0">0 years</option>
                        <option value="1">1 year</option>
                        <option value="2">2 years</option>
                        <option value="3">3 years</option>
                        <option value="4">4 years</option>
                        <option value="5">5 years</option>
                        <option value="6">6 years</option>
                        <option value="7">7 years</option>
                        <option value="8">8 years</option>
                        <option value="9">9 years</option>
                        <option value="10">10 years</option>
                        <option value="12">12 years</option>
                        <option value="15">15 years</option>
                        <option value="20">20+ years</option>
                      </select>
                      <select
                        value={jobData.experience_required.max_years}
                        onChange={(e) => handleInputChange("experience_required.max_years", e.target.value)}
                        className={`px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      >
                        <option value="">Max Experience</option>
                        <option value="1">1 year</option>
                        <option value="2">2 years</option>
                        <option value="3">3 years</option>
                        <option value="4">4 years</option>
                        <option value="5">5 years</option>
                        <option value="6">6 years</option>
                        <option value="7">7 years</option>
                        <option value="8">8 years</option>
                        <option value="9">9 years</option>
                        <option value="10">10 years</option>
                        <option value="12">12 years</option>
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="25">25 years</option>
                        <option value="30">30+ years</option>
                      </select>
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
              onClick={handleSaveDraft}
              className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm`}
            >
              Save as Draft
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post Job"}
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
                Job posted successfully!
              </p>
              <p className={`${textSecondary} text-sm`}>
                It will be reviewed by an admin and published soon.
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

export default PostJob;
