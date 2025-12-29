import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterService } from "../../services/recruiterService";
import {
  Search,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  MapPin,
  Mail,
  Phone,
  Briefcase
} from "lucide-react";

const ManageEmployers = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const recruitersPerPage = 10;

  // Fetch recruiters data from API
  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || response.data || response || [];
      const sortedRecruiters = recruitersData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      setRecruiters(sortedRecruiters);
      setFilteredRecruiters(sortedRecruiters);
    } catch (error) {
      console.error('Failed to fetch recruiters:', error);
      setRecruiters([]);
      setFilteredRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter recruiters based on search and filters
  useEffect(() => {
    let filtered = recruiters;
    
    if (searchTerm) {
      filtered = filtered.filter(recruiter =>
        (recruiter.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (recruiter.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (recruiter.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (recruiter.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply approval filter
    if (approvalFilter === "pending") {
      filtered = filtered.filter(recruiter => 
        recruiter.hasadminapproved === false && 
        recruiter.status !== 'rejected' && 
        recruiter.status !== 'inactive' &&
        recruiter.status !== 'blocked'
      );
    } else if (approvalFilter === "approved") {
      filtered = filtered.filter(recruiter => recruiter.hasadminapproved === true);
    } else if (approvalFilter === "rejected") {
      filtered = filtered.filter(recruiter => 
        (recruiter.status === 'rejected' || 
         recruiter.status === 'inactive' || 
         recruiter.status === 'blocked') &&
        recruiter.hasadminapproved === false
      );
    }
    
    setFilteredRecruiters(filtered);
    setCurrentPage(1);
  }, [searchTerm, approvalFilter, recruiters]);

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const formatDate = (recruiter) => {
    const dateString = recruiter.created_at || recruiter.createdAt || recruiter.date_created;
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getApprovalColor = (recruiter) => {
    if (recruiter.hasadminapproved) {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
    }
    if (recruiter.status === 'rejected' || recruiter.status === 'inactive' || recruiter.status === 'blocked') {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
    }
    return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
  };

  const getApprovalLabel = (recruiter) => {
    if (recruiter.hasadminapproved) return 'Approved';
    if (recruiter.status === 'rejected' || recruiter.status === 'inactive' || recruiter.status === 'blocked') {
      return 'Rejected';
    }
    return 'Pending';
  };

  const handleApproveEmployer = async (recruiter) => {
    try {
      setActionLoading(`approve-${recruiter.employer_id}`);

      await recruiterService.updateProfile(recruiter.email, {
        rejection_reason: null,
        status: 'active'
      });

      await adminService.approveRecruiter(recruiter);

      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || [];
      const sortedRecruiters = recruitersData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      setRecruiters(sortedRecruiters);
      setFilteredRecruiters(sortedRecruiters.filter(r => {
        let matches = true;
        
        if (searchTerm) {
          matches = matches && (
            (r.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase())
          );
        }
        
        if (approvalFilter === "pending") {
          matches = matches && r.hasadminapproved === false && r.status !== 'rejected' && r.status !== 'inactive' && r.status !== 'blocked';
        } else if (approvalFilter === "approved") {
          matches = matches && r.hasadminapproved === true;
        } else if (approvalFilter === "rejected") {
          matches = matches && (r.status === 'rejected' || r.status === 'inactive' || r.status === 'blocked');
        }
        
        return matches;
      }));

      setMessage({ type: 'success', text: `${recruiter.company_name} approved successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to approve employer:', error);
      setMessage({ type: 'error', text: 'Failed to approve employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRecruiter = async (recruiter) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason || !reason.trim()) {
      setMessage({ type: 'error', text: 'Rejection reason is required' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setActionLoading(`reject-${recruiter.employer_id}`);

      await recruiterService.updateProfile(recruiter.email, {
        rejection_reason: reason.trim(),
        status: 'rejected',
        hasadminapproved: false
      });

      await adminService.rejectRecruiter(recruiter);

      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || [];
      const sortedRecruiters = recruitersData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      setRecruiters(sortedRecruiters);
      setFilteredRecruiters(sortedRecruiters.filter(r => {
        let matches = true;
        
        if (searchTerm) {
          matches = matches && (
            (r.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase())
          );
        }
        
        if (approvalFilter === "pending") {
          matches = matches && r.hasadminapproved === false && r.status !== 'rejected' && r.status !== 'inactive' && r.status !== 'blocked';
        } else if (approvalFilter === "approved") {
          matches = matches && r.hasadminapproved === true;
        } else if (approvalFilter === "rejected") {
          matches = matches && (r.status === 'rejected' || r.status === 'inactive' || r.status === 'blocked');
        }
        
        return matches;
      }));

      setMessage({ type: 'success', text: `${recruiter.company_name} rejected successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to reject employer:', error);
      setMessage({ type: 'error', text: 'Failed to reject employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = (recruiter) => {
    navigate(`/admin/employers/profile/${recruiter.email}`);
  };

  const handleViewJobs = (recruiter) => {
    const employerId = recruiter.employer_id || recruiter.id;
    navigate(`/admin/employers/jobs/${employerId}`);
  };

  const handleBlockRecruiter = async (recruiter) => {
    if (!recruiter || !recruiter.email) {
      console.error('Invalid recruiter data:', recruiter);
      return;
    }

    const confirmBlock = window.confirm(
      `Are you sure you want to block ${recruiter.company_name}? This will remove them from the system.`
    );

    if (!confirmBlock) return;

    try {
      setActionLoading(recruiter.employer_id);
      await adminService.blockRecruiter(recruiter.email);

      const updatedRecruiters = recruiters.filter(r => r.email !== recruiter.email);
      setRecruiters(updatedRecruiters);
      setFilteredRecruiters(updatedRecruiters.filter(r => {
        let matches = true;
        
        if (searchTerm) {
          matches = matches && (
            (r.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (r.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase())
          );
        }
        
        if (approvalFilter === "pending") {
          matches = matches && r.hasadminapproved === false && r.status !== 'rejected';
        } else if (approvalFilter === "approved") {
          matches = matches && r.hasadminapproved === true;
        } else if (approvalFilter === "rejected") {
          matches = matches && (r.status === 'rejected' || r.status === 'inactive' || r.status === 'blocked');
        }
        
        return matches;
      }));

      setMessage({ type: 'success', text: `${recruiter.company_name} has been blocked and removed from the system.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error blocking recruiter:', error);
      setMessage({ type: 'error', text: 'Failed to block employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const headers = [
        'Company Name', 'Contact Person', 'Email', 'Phone', 'Industry',
        'Company Size', 'Location', 'Approval Status', 'Joined Date'
      ];

      const csvData = recruiters.map(recruiter => [
        recruiter.company_name || '',
        recruiter.full_name || '',
        recruiter.email || '',
        recruiter.phone_number || recruiter.phone || '',
        recruiter.industry || '',
        recruiter.company_size || '',
        recruiter.location || '',
        getApprovalLabel(recruiter),
        formatDate(recruiter)
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ type: 'success', text: 'CSV file downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      setMessage({ type: 'error', text: 'Failed to download CSV file.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecruiters.length / recruitersPerPage);
  const startIndex = (currentPage - 1) * recruitersPerPage;
  const endIndex = startIndex + recruitersPerPage;
  const currentRecruiters = filteredRecruiters.slice(startIndex, endIndex);

  const pendingCount = recruiters.filter(r => 
    r.hasadminapproved === false && 
    r.status !== 'rejected' && 
    r.status !== 'inactive' &&
    r.status !== 'blocked'
  ).length;
  const approvedCount = recruiters.filter(r => r.hasadminapproved === true).length;
  const rejectedCount = recruiters.filter(r => 
    (r.status === 'rejected' || r.status === 'inactive' || r.status === 'blocked') &&
    r.hasadminapproved === false
  ).length;

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
              <Building className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading employers...</h3>
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Manage Employers</h1>
              <p className={`text-sm ${textSecondary} mt-1`}>View and manage all registered employers</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadCSV}
                className={`px-4 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2 text-sm`}
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={fetchRecruiters}
                className={`px-4 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2`}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2">
                <Building size={16} className={textSecondary} />
                <span className={`text-sm font-semibold ${textColor}`}>{recruiters.length}</span>
                <span className={`text-xs ${textSecondary}`}>Total</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  {pendingCount}
                </span>
                <span className="text-xs text-yellow-600 dark:text-yellow-500">Pending</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {approvedCount}
                </span>
                <span className="text-xs text-green-600 dark:text-green-500">Approved</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {rejectedCount}
                </span>
                <span className="text-xs text-red-600 dark:text-red-500">Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 rounded-lg p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Filters on Top */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company, email, name, industry..."
                  className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                />
              </div>
            </div>

            {/* Approval Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setApprovalFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  approvalFilter === 'all'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                All ({recruiters.length})
              </button>
              <button
                onClick={() => setApprovalFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  approvalFilter === 'pending'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setApprovalFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  approvalFilter === 'approved'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setApprovalFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  approvalFilter === 'rejected'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-4">
          <p className={`text-sm ${textSecondary}`}>
            Showing <span className={`font-semibold ${textColor}`}>{filteredRecruiters.length}</span> {filteredRecruiters.length === 1 ? 'employer' : 'employers'}
          </p>
        </div>

        {/* Empty State */}
        {filteredRecruiters.length === 0 && !loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Building size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No employers found</h3>
            <p className={`${textSecondary} mb-6`}>
              {searchTerm || approvalFilter !== 'all' ? "Try adjusting your filters" : "No employers registered yet"}
            </p>
          </div>
        )}

        {/* Employers - Compact Cards */}
        <div className="space-y-3">
          {currentRecruiters.map(recruiter => (
            <div
              key={recruiter.id || recruiter.employer_id}
              className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
            >
              <div className="p-3">
                {/* Employer Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900/30">
                      {(recruiter.logo || recruiter.company_logo) ? (
                        <img
                          src={recruiter.logo || recruiter.company_logo}
                          alt={recruiter.company_name || 'Company'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(recruiter.company_name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm font-bold ${textColor} truncate leading-tight`}>
                        {recruiter.company_name || 'N/A'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-xs ${textSecondary} truncate`}>
                          {recruiter.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getApprovalColor(recruiter)}`} style={{ fontSize: '0.7rem' }}>
                    {getApprovalLabel(recruiter)}
                  </span>
                </div>

                {/* Employer Details */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {recruiter.full_name && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                      👤 {recruiter.full_name}
                    </span>
                  )}
                  {recruiter.phone_number || recruiter.phone ? (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                      <Phone size={11} />
                      {recruiter.phone_number || recruiter.phone}
                    </span>
                  ) : null}
                  {recruiter.industry && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-100 text-purple-600 border-purple-200'}`} style={{ fontSize: '0.7rem' }}>
                      {recruiter.industry}
                    </span>
                  )}
                  {recruiter.company_size && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                      {recruiter.company_size} employees
                    </span>
                  )}
                  {recruiter.location && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                      <MapPin size={11} />
                      {recruiter.location}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    Joined: {formatDate(recruiter)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {/* Show Approve/Reject buttons only for pending employers */}
                  {!recruiter.hasadminapproved && recruiter.status !== 'rejected' && recruiter.status !== 'inactive' && recruiter.status !== 'blocked' ? (
                    <>
                      <button
                        onClick={() => handleApproveRecruiter(recruiter)}
                        disabled={actionLoading === `approve-${recruiter.employer_id}`}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        style={{ fontSize: '0.7rem' }}
                      >
                        <CheckCircle size={13} />
                        {actionLoading === `approve-${recruiter.employer_id}` ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectRecruiter(recruiter)}
                        disabled={actionLoading === `reject-${recruiter.employer_id}`}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        style={{ fontSize: '0.7rem' }}
                      >
                        <XCircle size={13} />
                        {actionLoading === `reject-${recruiter.employer_id}` ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleViewProfile(recruiter)}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        <Eye size={13} />
                        View Profile
                      </button>
                      <button
                        onClick={() => handleBlockRecruiter(recruiter)}
                        disabled={actionLoading === recruiter.employer_id}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 border border-red-300 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        <Trash2 size={13} />
                        {actionLoading === recruiter.employer_id ? 'Blocking...' : 'Block'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleViewProfile(recruiter)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                        style={{ fontSize: '0.7rem' }}
                      >
                        <Eye size={13} />
                        View Profile
                      </button>
                      <button
                        onClick={() => handleViewJobs(recruiter)}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        <Briefcase size={13} />
                        Jobs Posted
                      </button>
                      <button
                        onClick={() => handleBlockRecruiter(recruiter)}
                        disabled={actionLoading === recruiter.employer_id}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 border border-red-300 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        <Trash2 size={13} />
                        {actionLoading === recruiter.employer_id ? 'Blocking...' : 'Block'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
            >
              Previous
            </button>
            <span className={`text-sm ${textColor}`}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEmployers;
