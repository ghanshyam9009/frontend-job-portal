import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Bookmark,
  IndianRupee,
  Share2,
  Link2
} from 'lucide-react';

const JobCard = ({
  job,
  onBookmark,
  isBookmarked = false,
  showBookmark = true,
  className = '',
  isDark = false,
  /** Recruiter ke liye Apply button hide */
  hideApplyButton = false,
  /** Candidate: 'shortlisted' | 'applied' | null – shortlisted ho toh "Shortlisted" dikhe */
  applicationStatus = null,
}) => {
  const navigate = useNavigate();

  const handleJobClick = () => {
    // Use job ID for consistent URLs
    const jobId = job.job_id || job.id;
    navigate(`/job/${jobId}`, {
      state: { job }
    });
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onBookmark) {
      onBookmark(job.job_id || job.id);
    }
  };

  const getJobUrl = () => {
    const jobId = job.job_id || job.id;
    return `${window.location.origin}/job/${jobId}`;
  };

  const showCopiedFeedback = () => {
    const msg = document.createElement('span');
    msg.textContent = 'Link copied!';
    msg.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#2271B5;color:white;padding:8px 16px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    const jobUrl = getJobUrl();
    try {
      await navigator.clipboard.writeText(jobUrl);
      showCopiedFeedback();
    } catch (_) {
      showCopiedFeedback();
    }
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();
    const jobUrl = getJobUrl();
    const title = job.job_title || job.title || 'Job';
    const text = `${title} at ${job.company_name || 'Company'}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: jobUrl
        });
      } else {
        await navigator.clipboard.writeText(jobUrl);
        showCopiedFeedback();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(jobUrl);
          showCopiedFeedback();
        } catch (_) {}
      }
    }
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return "Salary not specified";
    if (typeof salaryRange === 'string') return salaryRange;
    if (salaryRange.min && salaryRange.max) {
      return `₹${salaryRange.min} - ₹${salaryRange.max}`;
    }
    return "Salary not specified";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const companyLogo = job.job_logo_url || job.job_logo || job.company_logo || job.logo;

  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBorder = isDark ? 'hover:border-blue-500' : 'hover:border-blue-400';

  return (
    <div
      className={`${bgSecondary} rounded-lg shadow-sm border ${borderColor} ${hoverBorder} p-4 hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer ${className}`}
      onClick={handleJobClick}
    >
      {/* Header with time and apply / shortlisted */}
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
          isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
        }`}>
          {formatDate(job.created_at || job.posted_date)}
        </span>
        {!hideApplyButton && (
          applicationStatus === 'shortlisted' ? (
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 font-semibold px-4 py-1.5 rounded-md text-xs">
              Shortlisted
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleJobClick();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-md transition-all duration-300 hover:shadow-md text-xs"
            >
              Apply Now
            </button>
          )
        )}
      </div>

      {/* Company Logo and Title */}
      <div className="flex items-start gap-2 mb-3">
        <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={job.company_name || 'Company logo'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${job.company_name || 'Company'}&background=2563eb&color=fff&size=64`;
              }}
            />
          ) : (
            <span className="text-black text-sm font-bold">
              {getInitials(job.company_name)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-bold ${textPrimary} mb-1 hover:text-blue-600 transition-colors`}>
            {job.job_title || job.title}
          </h3>
          <p className={`text-xs ${textSecondary} font-semibold flex items-center gap-1`}>
            <Building2 className="w-3 h-3" />
            {job.company_name}
          </p>
        </div>
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs mb-3">
        {job.employment_type && (
          <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded`}>
            <Clock className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className={`${textSecondary} font-medium`}>{job.employment_type}</span>
          </div>
        )}
        {job.location && (
          <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded`}>
            <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className={`${textSecondary} font-medium`}>{job.location}</span>
          </div>
        )}
        {job.salary_range && (
          <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded`}>
            <IndianRupee className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className={`${textSecondary} font-medium`}>{formatSalary(job.salary_range)}</span>
          </div>
        )}
        {job.experience_required && (
          <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded`}>
            <Briefcase className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className={`${textSecondary} font-medium`}>
              {job.experience_required.min_years}-{job.experience_required.max_years} yrs
            </span>
          </div>
        )}
      </div>

      {/* Job Description */}
      {job.description && (
        <p className={`${textSecondary} text-xs mb-3 leading-relaxed`}>
          {job.description.length > 120
            ? `${job.description.substring(0, 120)}...`
            : job.description}
        </p>
      )}

      {/* Copy link, Share & Bookmark Buttons */}
      <div className="absolute bottom-2 right-3 flex items-center gap-0.5">
        <button
          onClick={handleCopyLink}
          className={`${textSecondary} hover:text-blue-500 transition-colors p-1 rounded-md`}
          title="Copy link"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleShareClick}
          className={`${textSecondary} hover:text-blue-500 transition-colors p-1 rounded-md`}
          title="Share job"
        >
          <Share2 className="w-4 h-4" />
        </button>
        {showBookmark && (
          <button
            onClick={handleBookmarkClick}
            className={`${textSecondary} hover:text-yellow-500 transition-colors p-1 rounded-md`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
        )}
      </div>

      {/* Premium Badge */}
      {job.is_premium && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-br-md shadow-sm">
          PREMIUM
        </div>
      )}
    </div>
  );
};

export default JobCard;
