import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import {
  Search,
  Users,
  UserCheck,
  Clock,
  UserX,
  Eye,
  Trash2,
  RefreshCw,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowUpDown
} from "lucide-react";

const ManageCandidates = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const candidatesPerPage = 10;

  // Fetch candidates data from API
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const candidatesData = await adminService.getCandidates();
      // Filter out blocked candidates where is_admin_closed is true, status is blocked/inactive, or blocked field is true
      const activeCandidates = candidatesData.filter(candidate => {
        const isClosed = candidate.is_admin_closed === true ||
                        candidate.is_admin_closed === "true" ||
                        candidate.is_admin_closed === 1 ||
                        candidate.is_admin_closed === "1";
        const isBlocked = candidate.status?.toLowerCase() === 'blocked' ||
                         candidate.status?.toLowerCase() === 'inactive';
        const isBlockedField = candidate.blocked === true ||
                              candidate.blocked === "true" ||
                              candidate.blocked === 1 ||
                              candidate.blocked === "1";

        return !isClosed && !isBlocked && !isBlockedField;
      });
      const sortedCandidates = activeCandidates.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );
      console.log('Loaded candidates:', sortedCandidates.length);
      setCandidates(sortedCandidates);
      setFilteredCandidates(sortedCandidates);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      setCandidates([]);
      setFilteredCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to filter by date
  const filterByDate = (candidate) => {
    if (!candidate.created_at) return false;
    
    const candidateDate = new Date(candidate.created_at);
    const now = new Date();
    
    switch (dateFilter) {
      case "today":
        return candidateDate.toDateString() === now.toDateString();
      
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return candidateDate.toDateString() === yesterday.toDateString();
      
      case "last7days":
        const last7Days = new Date(now);
        last7Days.setDate(last7Days.getDate() - 7);
        return candidateDate >= last7Days;
      
      case "last30days":
        const last30Days = new Date(now);
        last30Days.setDate(last30Days.getDate() - 30);
        return candidateDate >= last30Days;
      
      case "thisMonth":
        return candidateDate.getMonth() === now.getMonth() && 
               candidateDate.getFullYear() === now.getFullYear();
      
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return candidateDate >= lastMonth && candidateDate <= lastMonthEnd;
      
      case "thisYear":
        return candidateDate.getFullYear() === now.getFullYear();
      
      default:
        return true;
    }
  };

  // Filter candidates based on search, status, and date
  useEffect(() => {
    let filtered = candidates;
    
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        (candidate.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (candidate.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(candidate =>
        candidate.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    if (dateFilter !== "all") {
      filtered = filtered.filter(filterByDate);
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        
        case "nameAZ":
          return (a.name || '').localeCompare(b.name || '');
        
        case "nameZA":
          return (b.name || '').localeCompare(a.name || '');
        
        case "emailAZ":
          return (a.email || '').localeCompare(b.email || '');
        
        case "emailZA":
          return (b.email || '').localeCompare(a.email || '');
        
        default:
          return 0;
      }
    });
    
    setFilteredCandidates(sorted);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, sortBy, candidates]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  const handleViewDetails = (candidate) => {
    navigate(`/admin/candidates/profile/${candidate.email}`);
  };

  const handleViewApplications = (candidate) => {
    const candidateId = candidate.user_id || candidate.id;
    navigate(`/admin/candidates/applications/${candidateId}`);
  };

  const handleBlockStudent = async (candidate) => {
    if (!candidate || !candidate.email) {
      setMessage({ type: 'error', text: 'Invalid candidate data' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const confirmBlock = window.confirm(
      `Are you sure you want to block ${candidate.name}? This will remove them from the system.`
    );

    if (!confirmBlock) return;

    try {
      setActionLoading(candidate.id || candidate.user_id);
      await adminService.blockStudent(candidate.email);

      // Refetch candidates to ensure the blocked candidate is properly filtered out
      await fetchCandidates();

      setMessage({ type: 'success', text: `${candidate.name} has been blocked and removed from the system.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error blocking student:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to block student. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const endIndex = startIndex + candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

  const activeCount = candidates.filter(c => c.status?.toLowerCase() === 'active').length;
  const inactiveCount = candidates.filter(c => c.status?.toLowerCase() === 'inactive').length;
  const thisMonthCount = candidates.filter(c => {
    if (!c.created_at) return false;
    const date = new Date(c.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

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
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading candidates...</h3>
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
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Manage Candidates</h1>
              <p className={`text-sm ${textSecondary} mt-1`}>View and manage all registered candidates</p>
            </div>
            <button
              onClick={fetchCandidates}
              className={`px-4 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2`}
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2">
                <Users size={16} className={textSecondary} />
                <span className={`text-sm font-semibold ${textColor}`}>{candidates.length}</span>
                <span className={`text-xs ${textSecondary}`}>Total</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {activeCount}
                </span>
                <span className="text-xs text-green-600 dark:text-green-500">Active</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-400">
                  {inactiveCount}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-500">Inactive</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  {thisMonthCount}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-500">This Month</span>
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
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                />
              </div>
            </div>

            {/* Status and Date Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'active'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  Active ({activeCount})
                </button>
              </div>

              {/* Date Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Calendar size={18} className={textSecondary} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`px-4 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className={textSecondary} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="nameAZ">Name (A-Z)</option>
                  <option value="nameZA">Name (Z-A)</option>
                  <option value="emailAZ">Email (A-Z)</option>
                  <option value="emailZA">Email (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-4">
          <p className={`text-sm ${textSecondary}`}>
            Showing <span className={`font-semibold ${textColor}`}>{filteredCandidates.length}</span> {filteredCandidates.length === 1 ? 'candidate' : 'candidates'}
            {dateFilter !== 'all' && (
              <span className="ml-2">
                ({dateFilter.replace(/([A-Z])/g, ' $1').trim()})
              </span>
            )}
          </p>
        </div>

        {/* Empty State */}
        {filteredCandidates.length === 0 && !loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Users size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No candidates found</h3>
            <p className={`${textSecondary} mb-6`}>
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? "Try adjusting your filters" : "No candidates registered yet"}
            </p>
          </div>
        )}

        {/* Candidates - Compact Cards */}
        <div className="space-y-3">
          {currentCandidates.map(candidate => (
            <div
              key={candidate.id}
              className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
            >
              <div className="p-3">
                {/* Candidate Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900/30">
                      {candidate.logo ? (
                        <img 
                          src={candidate.logo} 
                          alt={candidate.name || 'Candidate'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(candidate.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm font-bold ${textColor} truncate leading-tight`}>
                        {candidate.name || 'N/A'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-xs ${textSecondary} truncate`}>
                          {candidate.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(candidate.status || 'active')}`} style={{ fontSize: '0.7rem' }}>
                    {candidate.status || 'Active'}
                  </span>
                </div>

                {/* Candidate Details */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {candidate.phone && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                      <Phone size={11} />
                      {candidate.phone}
                    </span>
                  )}
                  {candidate.city && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                      <MapPin size={11} />
                      {candidate.city}
                    </span>
                  )}
                  {candidate.experience && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                      <Briefcase size={11} />
                      {candidate.experience}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    Joined: {formatDate(candidate.created_at)}
                  </span>
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {candidate.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className={`px-2 py-0.5 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full text-xs font-medium`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className={`px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'} rounded-full text-xs font-medium`} style={{ fontSize: '0.65rem' }}>
                        +{candidate.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleViewDetails(candidate)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Eye size={13} />
                    View Profile
                  </button>
                  <button
                    onClick={() => handleViewApplications(candidate)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Briefcase size={13} />
                    Applications
                  </button>
                  <button
                    onClick={() => handleBlockStudent(candidate)}
                    disabled={actionLoading === (candidate.id || candidate.user_id)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 border border-red-300 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Trash2 size={13} />
                    {actionLoading === (candidate.id || candidate.user_id) ? 'Deleting...' : 'Delete'}
                  </button>
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

export default ManageCandidates;