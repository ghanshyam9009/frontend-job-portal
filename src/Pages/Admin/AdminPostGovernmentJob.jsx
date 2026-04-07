import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { 
  FileText, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Save,
  Building2,
  DollarSign,
  Users,
  Mail,
  Link as LinkIcon
} from "lucide-react";

const AdminPostGovernmentJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams(); // For edit mode
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    job_title: "",
    description: "",
    document_link: "",
    salary_range: "",
    employment_type: "Full-time",
    department_name: "",
    application_deadline: "",
    contact_email: "",
    total_posts: "",
    application_fee: ""
  });

  // Fetch job details if editing
  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const jobsData = await adminService.getGovernmentJobs();
      const job = jobsData.find(j => (j.job_id == jobId || j.id == jobId));

      if (!job) {
        setError('Government job not found');
        return;
      }

      console.log('Found job for editing:', job);

      // Format application_deadline
      let deadlineDate = "";
      if (job.application_deadline) {
        try {
          const date = new Date(job.application_deadline);
          if (!isNaN(date.getTime())) {
            deadlineDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn('Failed to parse application deadline:', e);
        }
      }

      setFormData({
        job_title: job.job_title || "",
        description: job.description || "",
        document_link: job.document_link || "",
        salary_range: job.salary_range || "",
        employment_type: job.employment_type || "Full-time",
        department_name: job.department_name || "",
        application_deadline: deadlineDate,
        contact_email: job.contact_email || "",
        total_posts: job.total_posts?.toString() || "",
        application_fee: job.application_fee || ""
      });

      console.log('Form data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      setError('Failed to load job details: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const adminId = String(user?.user_id || user?.id || user?.admin_id);
      
      if (!adminId || adminId === 'undefined' || adminId === 'null') {
        setError('Admin ID is missing. Please log out and log back in.');
        alert('Admin ID is missing. Please log out and log back in.');
        return;
      }

      if (!formData.job_title || !formData.description || !formData.salary_range || 
          !formData.employment_type || !formData.department_name || !formData.application_deadline || 
          !formData.contact_email) {
        setError('Please fill in all required fields.');
        alert('Please fill in all required fields.');
        return;
      }

      const jobData = {
        admin_id: adminId,
        job_title: formData.job_title,
        description: formData.description,
        document_link: formData.document_link,
        salary_range: formData.salary_range,
        employment_type: formData.employment_type,
        department_name: formData.department_name,
        application_deadline: formData.application_deadline,
        contact_email: formData.contact_email,
        total_posts: formData.total_posts,
        application_fee: formData.application_fee,
        status: "Open",
        location: "N/A"
      };

      if (jobId) {
        // Update existing job
        await adminService.updateGovernmentJob(jobId, {
          job_id: jobId,
          ...jobData
        });
        alert('Government job updated successfully!');
      } else {
        // Create new job
        console.log("Submitting Government Job Data:", jobData);
        await adminService.createGovernmentJob(jobData);
        alert('Government job created successfully!');
      }

      // Navigate back to government jobs list
      navigate('/admin/government-jobs');
    } catch (error) {
      console.error('Failed to save job:', error);
      setError('Failed to save job. Please try again.');
      alert('Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Show loading state when fetching job data for edit
  if (jobId && loading && !formData.job_title) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/government-jobs')}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <ArrowLeft size={20} className={textColor} />
              </button>
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                  Edit Government Job
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Loading job details...
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FileText className="text-blue-500" size={24} />
              </div>
            </div>
            <h3 className={`text-lg font-bold ${textColor}`}>Loading job details...</h3>
            <p className={`${textSecondary} mt-2`}>Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/government-jobs')}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <ArrowLeft size={20} className={textColor} />
            </button>
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                {jobId ? 'Edit Government Job' : 'Post New Government Job'}
              </h1>
              <p className={`text-sm ${textSecondary} mt-1`}>
                {jobId ? 'Update government job details' : 'Create a new government job posting'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Show edit mode indicator */}
        {jobId && formData.job_title && (
          <div className={`mb-4 p-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-500/30' : 'border-blue-200'} rounded-lg`}>
            <div className="flex items-start gap-3">
              <Building2 className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${textColor} mb-2`}>Editing Government Job: {formData.job_title}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className={textSecondary}>Department:</span>
                    <p className={`font-medium ${textColor}`}>{formData.department_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className={textSecondary}>Posts:</span>
                    <p className={`font-medium ${textColor}`}>{formData.total_posts || 'N/A'}</p>
                  </div>
                  <div>
                    <span className={textSecondary}>Fee:</span>
                    <p className={`font-medium ${textColor}`}>{formData.application_fee || 'N/A'}</p>
                  </div>
                  <div>
                    <span className={textSecondary}>Deadline:</span>
                    <p className={`font-medium ${textColor}`}>{formData.application_deadline || 'N/A'}</p>
                  </div>
                </div>
                <p className={`text-xs ${textSecondary} mt-2`}>Job ID: {jobId} • All data loaded successfully</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className={`rounded-lg shadow-sm border ${borderColor} ${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className={isDark ? 'text-blue-400' : 'text-blue-500'} size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange("job_title", e.target.value)}
                  placeholder="e.g., Assistant Manager (Grade A)"
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Department Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="text"
                    value={formData.department_name}
                    onChange={(e) => handleInputChange("department_name", e.target.value)}
                    placeholder="e.g., Ministry of Finance"
                    required
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => handleInputChange("employment_type", e.target.value)}
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Salary Range <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => handleInputChange('salary_range', e.target.value)}
                    placeholder="e.g., ₹50,000 - ₹1,00,000"
                    required
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Total Posts <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="number"
                    value={formData.total_posts}
                    onChange={(e) => handleInputChange('total_posts', e.target.value)}
                    placeholder="e.g., 100"
                    required
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Application Fee <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.application_fee}
                  onChange={(e) => handleInputChange('application_fee', e.target.value)}
                  placeholder="e.g., ₹100"
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    required
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    required
                    placeholder="contact@department.gov.in"
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Document Link
                </label>
                <div className="relative">
                  <LinkIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="url"
                    value={formData.document_link}
                    onChange={(e) => handleInputChange('document_link', e.target.value)}
                    placeholder="https://example.com/document.pdf"
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
                <p className={`text-xs ${textSecondary} mt-1`}>Optional: Link to official notification or detailed document</p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className={`rounded-lg shadow-sm border ${borderColor} ${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className={isDark ? 'text-purple-400' : 'text-purple-500'} size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Job Description</h2>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Provide detailed information about the government job position, responsibilities, eligibility criteria, and selection process..."
                rows={8}
                required
                className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm
                `}
              />
              <p className={`text-xs ${textSecondary} mt-1`}>Include eligibility criteria, qualifications, age limits, and other important details</p>
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
              onClick={() => navigate('/admin/government-jobs')}
              className={`px-6 py-2.5 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-md transition-colors font-medium text-sm`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {jobId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {jobId ? "Update Government Job" : "Post Government Job"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPostGovernmentJob;