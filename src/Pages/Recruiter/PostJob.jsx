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
  Plus,
  Phone,
  Mail
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
    contact_number: user?.contact_number || user?.phone_number || "",
    job_status: "open",
    additional_benefits: []
  });
  const [logoFile, setLogoFile] = useState(null);

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
            
            // Update contact number from profile if available
            if (profileData.contact_number || profileData.phone_number) {
              setJobData(prev => ({
                ...prev,
                contact_number: profileData.contact_number || profileData.phone_number || prev.contact_number
              }));
            }
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

  const handleBenefitChange = (benefit) => {
    setJobData(prev => ({
      ...prev,
      additional_benefits: prev.additional_benefits.includes(benefit)
        ? prev.additional_benefits.filter(b => b !== benefit)
        : [...prev.additional_benefits, benefit]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const minSal = jobData.salary_range.min;
      const maxSal = jobData.salary_range.max;
      const salary_range = {
        currency: jobData.salary_range.currency || "INR",
        min: minSal !== "" && minSal != null ? Number(minSal) : null,
        max: maxSal !== "" && maxSal != null ? Number(maxSal) : null,
      };

      const jobPayload = {
        ...jobData,
        employer_id: user.employer_id,
        company_logo: recruiterProfile?.company_logo || recruiterProfile?.logo || null,
        salary_range,
        responsibilities: jobData.responsibilities.split("\n").filter(r => r.trim()),
        qualifications: jobData.qualifications.split("\n").filter(q => q.trim()),
        additional_benefits: jobData.additional_benefits || [],
      };

      // Create the job first
      const createResponse = await jobService.createJob(jobPayload);
      const jobId = createResponse.data?.job_id || createResponse.data?.id;

      // If logo file is selected and job was created successfully, upload the logo
      if (logoFile && jobId) {
        try {
          await jobService.uploadJobLogo(jobId, logoFile);
        } catch (logoErr) {
          console.error('Failed to upload job logo:', logoErr);
        }
      }

      setShowSuccessModal(true);
      // Clear form data after successful submission
      setJobData({
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
        contact_number: user?.contact_number || user?.phone_number || "",
        job_status: "open",
        additional_benefits: []
      });
      setLogoFile(null);
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
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-3 sm:px-6 lg:px-8 pb-8 overflow-x-hidden`}>
      <div className="max-w-5xl mx-auto w-full min-w-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Briefcase className="text-blue-500" size={24} />
            </div>
            <h1 className={`text-2xl lg:text-3xl font-bold ${textColor}`}>Post New Job</h1>
          </div>
          <p className={`${textSecondary} text-sm`}>Fill in the details below to create a new job posting</p>
        </div>

        {/* Restriction Notice */}
        {!canPostJob && restrictionReason && (
          <div className={`${cardBg} border-2 border-yellow-500 rounded-lg p-4 sm:p-5 mb-6`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <AlertTriangle className="text-yellow-500 flex-shrink-0 sm:mt-0.5" size={24} />
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold ${textColor} mb-2`}>Job Posting Restricted</h3>
                <p className={`${textSecondary} text-sm mb-3`}>{restrictionReason}</p>
                <button
                  onClick={() => navigate('/company-profile')}
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors text-sm font-medium"
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
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-4 sm:p-5`}>
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

              <div className="md:col-span-2 min-w-0">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Job Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const maxSize = 5 * 1024 * 1024;
                      if (file.size > maxSize) {
                        alert('File size must be less than 5MB');
                        e.target.value = '';
                        setLogoFile(null);
                        return;
                      }
                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                      if (!allowedTypes.includes(file.type)) {
                        alert('Please select a valid image file (JPG, PNG, or GIF)');
                        e.target.value = '';
                        setLogoFile(null);
                        return;
                      }
                      setLogoFile(file);
                    } else {
                      setLogoFile(null);
                    }
                  }}
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                />
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Upload a logo for this job posting (optional). Max size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
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

              <div className="min-w-0">
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

              <div className="min-w-0">
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

              <div className="min-w-0">
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

              <div className="md:col-span-2 min-w-0">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Salary Range
                </label>
                <p className={`text-xs ${textSecondary} mb-2`}>Optional. Enter annual amount in the selected currency.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
                  <div className="w-full sm:w-40 sm:flex-shrink-0">
                    <label className={`block text-xs font-medium ${textSecondary} mb-1 sm:sr-only`}>Currency</label>
                    <div className="relative">
                      <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary} pointer-events-none`} size={16} />
                      <select
                        value={jobData.salary_range.currency}
                        onChange={(e) => handleInputChange("salary_range.currency", e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                        aria-label="Salary currency"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 flex-1 min-w-0">
                    <div className="min-w-0">
                      <input
                        type="number"
                        min={0}
                        inputMode="decimal"
                        value={jobData.salary_range.min}
                        onChange={(e) => handleInputChange("salary_range.min", e.target.value)}
                        placeholder="e.g. 800000"
                        className={`w-full min-w-0 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm px-3 py-2`}
                      />
                    </div>
                    <div className="min-w-0">
                      <input
                        type="number"
                        min={0}
                        inputMode="decimal"
                        value={jobData.salary_range.max}
                        onChange={(e) => handleInputChange("salary_range.max", e.target.value)}
                        placeholder="e.g. 1200000"
                        className={`w-full min-w-0 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm px-3 py-2`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 min-w-0">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Experience Required (Years)
                </label>
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={jobData.experience_required.min_years}
                      onChange={(e) => handleInputChange("experience_required.min_years", e.target.value)}
                      placeholder="Min"
                      className={`w-full min-w-0 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm px-3 py-2`}
                    />
                  </div>
                  <div className="min-w-0">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={jobData.experience_required.max_years}
                      onChange={(e) => handleInputChange("experience_required.max_years", e.target.value)}
                      placeholder="Max"
                      className={`w-full min-w-0 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm px-3 py-2`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-4 sm:p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-indigo-500" size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="email"
                    value={jobData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="recruiter@company.com"
                    required
                    className={`w-full pl-10 pr-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="tel"
                    value={jobData.contact_number}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Optional: Provide a contact number for applicants to reach you
                </p>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-4 sm:p-5`}>
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
                  rows={14}
                  required
                  className={`w-full max-w-full min-h-[12rem] sm:min-h-[14rem] px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm box-border`}
                />
              </div>

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
                  className={`w-full max-w-full min-h-[8rem] px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm box-border`}
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
                  className={`w-full max-w-full min-h-[8rem] px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm box-border`}
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-4 sm:p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-green-500" size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Required Skills</h2>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
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
                  className={`flex-1 min-w-0 px-3 py-2 ${inputBg} border ${inputBorder} rounded-md ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="shrink-0 px-4 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors text-sm font-medium inline-flex items-center justify-center gap-2 w-full sm:w-auto"
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

          {/* Additional Benefits */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-4 sm:p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Award className={isDark ? 'text-yellow-400' : 'text-yellow-500'} size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Additional Benefits</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[
                'PF & ESIC',
                'Health Insurance',
                'Performance Bonus',
                'Flexible Working Hours',
                'Work From Home',
                'Paid Leaves',
                'Travelling Allowance',
                'Dearness Allowance'
              ].map((benefit) => (
                <label key={benefit} className={`flex items-start sm:items-center gap-3 ${textColor} text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md min-w-0`}>
                  <input
                    type="checkbox"
                    checked={jobData.additional_benefits.includes(benefit)}
                    onChange={() => handleBenefitChange(benefit)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="font-medium">{benefit}</span>
                </label>
              ))}
            </div>

            <p className={`text-xs ${textSecondary} mt-3`}>
              Select the additional benefits offered by this job posting
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:items-center pt-1">
            <button 
              type="button" 
              onClick={handleSaveDraft}
              className={`w-full sm:w-auto px-6 py-2.5 border ${borderColor} ${textColor} rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm`}
            >
              Save as Draft
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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