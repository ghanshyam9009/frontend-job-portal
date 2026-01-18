import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { candidateExternalService } from "../../services";
import {
  Briefcase,
  Calendar,
  X,
  FileText,
  Check,
  ArrowLeft,
  MapPin,
  Building,
  DollarSign
} from "lucide-react";

const AdminCandidateApplications = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const { theme } = useTheme();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [candidateInfo, setCandidateInfo] = useState(null);

  useEffect(() => {
    if (!candidateId) return;
    fetchApplications();
  }, [candidateId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await candidateExternalService.getAppliedJobs(candidateId);

      const mapped = (data?.jobs || []).map((a, idx) => ({
        id: a.job_id || idx,
        title: a.job_title || "",
        company: a.company_name || "",
        salary:
          a.salary_range && a.salary_range.min && a.salary_range.max
            ? `₹${a.salary_range.min} - ₹${a.salary_range.max}`
            : "Salary not disclosed",
        location: a.location && a.location.toLowerCase() !== "n/a" ? a.location : "",
        type: a.employment_type || "",
        appliedDate: a.created_at ? a.created_at.split("T")[0] : "",
        appliedDateTime: a.created_at || "",
        status: a.status || "Under Review",
        applicationId: a.application_id || "",
        is_premium: a.premium_job || false,
      }));

      // Sort by applied date (latest first)
      const sorted = mapped.sort((a, b) => {
        const dateA = new Date(a.appliedDateTime || 0);
        const dateB = new Date(b.appliedDateTime || 0);
        const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
        const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
        return timeB - timeA;
      });

      setAppliedJobs(sorted);
      
      // Set candidate info from first job if available
      if (data?.candidate) {
        setCandidateInfo(data.candidate);
      }
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'under review':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
      case 'interview scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
      case 'offer received':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      case 'shortlisted':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30';
      case 'hired':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'under review':
        return <Eye size={14} />;
      case 'interview scheduled':
        return <Calendar size={14} />;
      case 'offer received':
      case 'hired':
        return <Check size={14} />;
      case 'rejected':
        return <X size={14} />;
      case 'shortlisted':
        return <Check size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const handleTrack = async (applicationId) => {
    if (!applicationId) {
      alert("Application ID not found. The application may still be processing.");
      return;
    }

    try {
      const data = await candidateExternalService.getApplicationStatus(applicationId);

      if (!data || typeof data.status !== 'string') {
        console.error("Invalid status data received:", data);
        alert("Could not retrieve valid tracking information.");
        return;
      }

      setTrackingInfo(data);

      const statusOrder = ['pending', 'applied', 'under review', 'shortlisted', 'interview scheduled', 'offer received', 'hired'];
      const currentStatus = data.status.toLowerCase();
      const isRejected = currentStatus === 'rejected';
      const currentIndex = statusOrder.indexOf(currentStatus);

      let timeline = [
        { stage: 'Application Sent', status: 'Pending', date: data.applied_date || data.created_at || null },
        { stage: 'Under Review', status: 'Pending', date: null },
        { stage: 'Shortlisted', status: 'Pending', date: null },
        { stage: 'Interview Scheduled', status: 'Pending', date: null },
        { stage: 'Offer Received', status: 'Pending', date: null },
        { stage: 'Hired', status: 'Pending', date: null },
      ];

      if (isRejected) {
        timeline[0].status = 'Completed';
        timeline.push({ 
          stage: 'Rejected', 
          status: 'Completed', 
          date: data.status_date || data.updated_at || new Date().toISOString() 
        });
      } else if (currentIndex > -1) {
        for (let i = 0; i <= currentIndex; i++) {
          timeline[i].status = 'Completed';
          if (i === currentIndex) {
            timeline[i].date = data.status_date || data.updated_at || new Date().toISOString();
          }
        }
      } else {
        timeline[0].status = 'Completed';
      }

      setTimeline(timeline);
      setIsModalOpen(true);
    } catch (e) {
      console.error("Failed to fetch application status:", e);
      alert("Failed to fetch application status. Please try again.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTrackingInfo(null);
    setTimeline([]);
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center max-w-7xl mx-auto mt-20`}>
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Briefcase className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading applications...</h3>
          <p className={`${textSecondary} mt-2`}>Please wait</p>
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
              onClick={() => navigate('/admin/candidates')}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <ArrowLeft size={20} className={textColor} />
            </button>
            <div className="flex-1">
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                Candidate Applications
              </h1>
              {candidateInfo && (
                <p className={`text-sm ${textSecondary} mt-1`}>
                  {candidateInfo.name} • {candidateInfo.email}
                </p>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className={textSecondary} />
                <span className={`text-sm font-semibold ${textColor}`}>{appliedJobs.length}</span>
                <span className={`text-xs ${textSecondary}`}>Total Applications</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  {appliedJobs.filter(j => j.status.toLowerCase() === 'under review').length}
                </span>
                <span className="text-xs text-yellow-600 dark:text-yellow-500">Under Review</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {appliedJobs.filter(j => ['shortlisted', 'interview scheduled', 'offer received', 'hired'].includes(j.status.toLowerCase())).length}
                </span>
                <span className="text-xs text-green-600 dark:text-green-500">Shortlisted+</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {appliedJobs.filter(j => j.status.toLowerCase() === 'rejected').length}
                </span>
                <span className="text-xs text-red-600 dark:text-red-500">Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {appliedJobs.length === 0 && !loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Briefcase size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No applications yet</h3>
            <p className={`${textSecondary} mb-6`}>
              This candidate hasn't applied to any jobs yet.
            </p>
          </div>
        )}

        {/* Applications - Compact Cards */}
        <div className="space-y-3">
          {appliedJobs.map(job => (
            <div
              key={job.id}
              className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
            >
              <div className="p-3">
                {/* Premium Badge */}
                {job.is_premium && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <span>👑</span>
                    Premium
                  </div>
                )}

                {/* Job Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold ${textColor} hover:text-blue-600 cursor-pointer leading-tight mb-1.5`}>
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building size={13} className="flex-shrink-0" />
                        {job.company}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="flex-shrink-0" />
                          {job.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(job.status)}`} style={{ fontSize: '0.7rem' }}>
                    <span className="inline-flex items-center gap-1">
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                  </span>
                </div>

                {/* Job Details */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    💰 {job.salary}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    {job.type}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                    <Calendar size={12} />
                    Applied: {job.appliedDate}
                  </span>
                </div>


              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}>
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h3 className={`text-xl font-semibold ${textColor}`}>Application Status</h3>
              <button
                onClick={closeModal}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <X size={20} className={textColor} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <ul className="space-y-4">
                {timeline.map((item, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.status === 'Completed'
                          ? item.stage === 'Rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-green-500 text-white'
                          : `${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${textSecondary}`
                      }`}>
                        {item.status === 'Completed' && <Check size={20} />}
                        {item.status === 'Pending' && <div className="w-3 h-3 rounded-full bg-gray-400"></div>}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`w-0.5 h-16 ${
                          item.status === 'Completed' ? 'bg-green-500' : `${isDark ? 'bg-gray-700' : 'bg-gray-200'}`
                        }`}></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className={`text-base font-semibold ${textColor}`}>{item.stage}</h4>
                      <p className={`text-sm ${textSecondary} mt-1`}>
                        {item.date ? new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Pending'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`flex justify-end p-6 border-t ${borderColor}`}>
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidateApplications;
