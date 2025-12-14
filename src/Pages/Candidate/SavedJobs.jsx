import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import { candidateExternalService } from "../../services";
import { toast } from "react-toastify";
import { Briefcase, Star, X, MapPin, DollarSign, Bookmark, Eye, Send, Heart } from "lucide-react";

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = user?.user_id || user?.id || '';
    if (!userId) return;
    const fetchSaved = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await candidateExternalService.getBookmarkedJobs(userId);
        const jobsArray = data?.bookmarked_jobs || data?.jobs || [];
        const normalizedJobs = Array.isArray(jobsArray) ? jobsArray : [jobsArray];
        const mapped = normalizedJobs.map((j, idx) => {
          let salaryDisplay = "";
          if (j.salary_range) {
            if (typeof j.salary_range === 'string') {
              salaryDisplay = j.salary_range;
            } else if (typeof j.salary_range === 'object' && j.salary_range.min && j.salary_range.max) {
              salaryDisplay = `₹${j.salary_range.min} - ₹${j.salary_range.max}`;
            } else {
              salaryDisplay = "Salary not specified";
            }
          } else {
            salaryDisplay = "Salary not specified";
          }

          return {
            id: j.job_id || j.id || idx,
            title: j.job_title,
            company: j.company_name || "",
            salary: salaryDisplay,
            location: j.location || "",
            type: j.employment_type || "",
            savedDate: j.saved_at ? j.saved_at.split('T')[0] : '',
            status: (j.status || 'Active'),
            salary_field: j.salary_range
          };
        });
        setSavedJobs(mapped);
      } catch (e) {
        setError(typeof e === 'string' ? e : e?.message || 'Failed to load saved jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  const handleJobClick = (job) => {
    navigate(`/job/${job.title.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { job }
    });
  };

  const handleRemoveSaved = async (jobId) => {
    if (!user) {
      toast.error('Please log in to remove bookmarks.');
      return;
    }

    try {
      const userId = user.user_id || user.id;
      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        return;
      }

      await candidateExternalService.removeBookmark({
        user_id: userId,
        job_ids: [jobId]
      });

      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Job removed from bookmarks');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark. Please try again.');
    }
  };

  const handleApplyNow = (job) => {
    if (!user?.membership || user?.membership === 'free') {
      alert("You need a premium membership to apply for jobs. Redirecting to membership plans...");
      navigate('/membership-plans');
      return;
    }
    
    alert(`Application submitted for ${job.title} at ${job.company}`);
  };

  // Gradient styles matching the CSS
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #fdc830 0%, #f37335 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Teal-Purple
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}  transition-colors duration-300`}>
      <CandidateNavbar darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      
      <main className="px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h2 className={`text-3xl lg:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Saved Jobs
          </h2>
          <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your bookmarked job opportunities
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`text-center mx-auto  py-16 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading saved jobs...</h3>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <X className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && savedJobs.length === 0 && (
          <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="inline-flex items-center justify-center mb-6">
              <Star size={64} className="text-purple-600" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No saved jobs yet
            </h3>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Start saving jobs you're interested in to see them here.
            </p>
            <button 
              onClick={() => navigate('/userjoblistings')}
              className="px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Browse Jobs
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && savedJobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mx-auto" style={{ maxWidth: 'fit-content' }}>
            {savedJobs.map((job, index) => (
              <div
                key={job.id}
                className="rounded-2xl p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col min-h-80"
                style={{ background: gradients[index % gradients.length] }}
              >
                {/* Card Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5">
                    <Briefcase size={20} />
                  </div>
                  <button
                    onClick={() => handleRemoveSaved(job.id)}
                    className="bg-white/20 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                    title="Remove from saved"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Job Info */}
                <h3 className="text-xl font-bold mb-2 leading-tight">
                  {job.title}
                </h3>
                <p className="text-sm opacity-90 mb-2 font-medium">
                  {job.company}
                </p>
                <p className="text-base font-semibold mb-2 opacity-95">
                  {job.salary}
                </p>
                <p className="text-sm opacity-85 mb-3">
                  {job.location}
                </p>

                {/* Job Meta */}
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/20 mb-3">
                  <span className="text-xs opacity-80">
                    Saved: {job.savedDate}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md font-medium">
                    {job.status}
                  </span>
                </div>

                {/* Job Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleJobClick(job)}
                    className="flex-1 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 font-semibold text-sm transition-all duration-300 hover:bg-white/30 hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleApplyNow(job)}
                    className="flex-1 py-3 rounded-xl bg-white font-bold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
                    style={{ color: gradients[index % gradients.length].match(/#[a-fA-F0-9]{6}/)?.[0] || '#667eea' }}
                  >
                    <Send size={16} />
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedJobs;