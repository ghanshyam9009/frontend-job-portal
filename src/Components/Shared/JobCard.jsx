import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Bookmark,
  IndianRupee,
  Share2,
  Link2,
  Crown,
  ArrowRight,
} from 'lucide-react';

const POSTED_BY_STYLES = {
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  recruiter: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  employer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const JobCard = ({
  job,
  onBookmark,
  isBookmarked = false,
  showBookmark = true,
  className = '',
  isDark = false,
  hideApplyButton = false,
  applicationStatus = null,
}) => {
  const navigate = useNavigate();

  const handleJobClick = () => {
    const jobId = job.job_id || job.id;
    navigate(`/job/${jobId}`, { state: { job } });
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onBookmark) onBookmark(job.job_id || job.id);
  };

  const getJobUrl = () => {
    const jobId = job.job_id || job.id;
    return `${window.location.origin}/job/${jobId}`;
  };

  const showCopiedFeedback = () => {
    const msg = document.createElement('span');
    msg.textContent = 'Link copied!';
    msg.style.cssText =
      'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#2271B5;color:white;padding:8px 16px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(getJobUrl());
    } catch (_) {
      /* fallback */
    }
    showCopiedFeedback();
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();
    const jobUrl = getJobUrl();
    const title = job.job_title || job.title || 'Job';
    const text = `${title} at ${job.company_name || 'Company'}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: jobUrl });
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
    if (!salaryRange) return null;
    if (typeof salaryRange === 'string') return salaryRange;
    if (salaryRange.min && salaryRange.max) {
      const fmt = (n) => {
        const num = Number(String(n).replace(/,/g, ''));
        if (Number.isNaN(num)) return n;
        if (num >= 100000) return `${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)}L`;
        return Number(num).toLocaleString('en-IN');
      };
      return `₹${fmt(salaryRange.min)} – ₹${fmt(salaryRange.max)}`;
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPostedBy = (value) => {
    if (!value) return null;
    const normalized = String(value).trim();
    if (!normalized) return null;
    return normalized
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatExperience = (exp) => {
    if (!exp) return null;
    if (typeof exp === 'string') return exp;
    if (exp.min_years != null && exp.max_years != null) {
      return `${exp.min_years}–${exp.max_years} yrs exp`;
    }
    return null;
  };

  const postedByLabel = formatPostedBy(job.posted_by || job.postedBy);
  const postedByKey = (job.posted_by || job.postedBy || '').toString().trim().toLowerCase();
  const postedByStyle =
    POSTED_BY_STYLES[postedByKey] || 'bg-slate-50 text-slate-600 border-slate-200';

  const companyLogo = job.job_logo_url || job.job_logo || job.company_logo || job.logo;
  const isPremium = job.is_premium || job.premium_job;
  const salaryLabel = formatSalary(job.salary_range);
  const experienceLabel = formatExperience(job.experience_required);
  const postedAgo = formatDate(job.created_at || job.posted_date);

  const cardBg = isDark ? 'bg-gray-800/90' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderBase = isDark ? 'border-gray-700' : 'border-gray-200/80';
  const chipBg = isDark ? 'bg-gray-700/80 text-gray-300' : 'bg-slate-50 text-slate-600 border border-slate-100';

  const iconBtn =
    'p-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-[#2271B5] transition-all';

  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleJobClick()}
      className={[
        'group relative rounded-2xl border shadow-sm cursor-pointer overflow-hidden',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        isDark ? 'hover:border-blue-500/50' : 'hover:border-[#2271B5]/30',
        borderBase,
        cardBg,
        isPremium ? 'ring-1 ring-amber-200/60' : '',
        className,
      ].join(' ')}
      onClick={handleJobClick}
    >
      {/* Left accent on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2271B5] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden
      />

      <div className="p-4 sm:p-5 pl-5">
        {/* Top meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {isPremium && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
          {postedByLabel && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${postedByStyle}`}
            >
              Posted by {postedByLabel}
            </span>
          )}
          {job.work_mode && (
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium ${chipBg}`}>
              {job.work_mode}
            </span>
          )}
          {postedAgo && (
            <span className={`ml-auto text-[11px] font-medium ${textSecondary}`}>{postedAgo}</span>
          )}
        </div>

        {/* Main content */}
        <div className="flex gap-3 sm:gap-4">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden ring-2 ${
              isDark ? 'ring-gray-600 bg-gray-700' : 'ring-slate-100 bg-white shadow-sm'
            }`}
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_name || 'Co')}&background=2271B5&color=fff&size=80`;
                }}
              />
            ) : (
              <span className="text-sm font-bold text-[#2271B5]">{getInitials(job.company_name)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h3
              className={`text-base sm:text-[15px] font-bold leading-snug line-clamp-2 ${textPrimary} group-hover:text-[#2271B5] transition-colors`}
            >
              {job.job_title || job.title}
            </h3>
            <p className={`mt-1 text-sm font-medium flex items-center gap-1.5 truncate ${textSecondary}`}>
              <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-[#2271B5]/70" />
              <span className="truncate">{job.company_name}</span>
            </p>
          </div>
        </div>

        {/* Detail chips */}
        <div className="flex flex-wrap gap-2 mt-3.5">
          {job.location && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${chipBg}`}>
              <MapPin className="w-3.5 h-3.5 text-[#2271B5] flex-shrink-0" />
              <span className="line-clamp-1 max-w-[200px] sm:max-w-none">{job.location}</span>
            </span>
          )}
          {job.employment_type && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${chipBg}`}>
              <Clock className="w-3.5 h-3.5 text-[#2271B5] flex-shrink-0" />
              {job.employment_type}
            </span>
          )}
          {salaryLabel && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${chipBg}`}>
              <IndianRupee className="w-3.5 h-3.5 text-[#2271B5] flex-shrink-0" />
              {salaryLabel}
            </span>
          )}
          {experienceLabel && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${chipBg}`}>
              <Briefcase className="w-3.5 h-3.5 text-[#2271B5] flex-shrink-0" />
              {experienceLabel}
            </span>
          )}
        </div>

        {job.description && (
          <p className={`mt-3 text-xs sm:text-[13px] leading-relaxed line-clamp-2 ${textSecondary}`}>
            {job.description.replace(/\s+/g, ' ').trim()}
          </p>
        )}

        {/* Footer */}
        <div
          className={`mt-4 pt-3 flex items-center justify-between gap-3 border-t ${
            isDark ? 'border-gray-700' : 'border-slate-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5">
            <button type="button" onClick={handleCopyLink} className={iconBtn} title="Copy link">
              <Link2 className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleShareClick} className={iconBtn} title="Share job">
              <Share2 className="w-4 h-4" />
            </button>
            {showBookmark && (
              <button
                type="button"
                onClick={handleBookmarkClick}
                className={`${iconBtn} ${isBookmarked ? 'text-amber-500 hover:text-amber-600' : ''}`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
              >
                <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {!hideApplyButton && (
            applicationStatus === 'shortlisted' ? (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Shortlisted
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJobClick();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2271B5] hover:bg-[#1a5f9a] shadow-sm hover:shadow-md transition-all"
              >
                Apply Now
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
};

export default JobCard;
