import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Contexts/ThemeContext';
import { 
  User, 
  Building, 
  Eye, 
  Search, 
  Phone, 
  X,
  Mail,
  Calendar,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { contactService } from '../../services/contactService';

const ContactForms = () => {
  const { theme } = useTheme();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch contact forms from API
  useEffect(() => {
    const fetchContactForms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await contactService.getAllContacts();

        let dataArray = [];
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          const possibleArrays = ['data', 'contacts', 'forms', 'results'];
          for (const key of possibleArrays) {
            if (Array.isArray(response.data[key])) {
              dataArray = response.data[key];
              break;
            }
          }
          if (dataArray.length === 0 && Array.isArray(response)) {
            dataArray = response;
          }
        }

        if (dataArray.length > 0) {
          const transformedData = dataArray.map((item, index) => ({
            id: item.contact_id || index + 1,
            name: item.name,
            email: item.email,
            userType: item.userType || item.user_type || 'candidate',
            message: item.message || item.question || '',
            submittedAt: item.created_at || item.createdAt || new Date().toISOString(),
            status: 'new'
          }));

          setForms(transformedData);
        } else {
          console.log('API returned unexpected structure:', response);
          setForms([]);
        }
      } catch (err) {
        console.error('Error fetching contact forms:', err);
        setError('Failed to load contact forms. Please try again.');
        setForms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContactForms();
  }, []);

  // Date filter logic
  const filterByDate = (form) => {
    if (dateFilter === 'all') return true;
    
    const now = new Date();
    const formDate = new Date(form.submittedAt);
    const diffTime = Math.abs(now - formDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (dateFilter) {
      case 'today':
        return diffDays <= 1;
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      case 'older':
        return diffDays > 30;
      default:
        return true;
    }
  };

  // Sort logic
  const sortForms = (formsToSort) => {
    const sorted = [...formsToSort];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      case 'nameAZ':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'nameZA':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  const filteredForms = sortForms(
    forms.filter(form => {
      const matchesFilter = filter === 'all' || form.userType === filter;
      const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = filterByDate(form);
      return matchesFilter && matchesSearch && matchesDate;
    })
  );

  const handleViewDetails = (form) => {
    setSelectedForm(form);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedForm(null);
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Theme variables
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-green-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Phone className="text-green-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading contact forms...</h3>
          <p className={`${textSecondary} mt-2`}>Please wait</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-8 max-w-md w-full text-center`}>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className={`text-xl font-bold ${textColor} mb-2`}>Error Loading Forms</h2>
          <p className={`${textSecondary} mb-6`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor} flex items-center gap-2`}>
                  <Phone className="text-green-500" size={28} />
                  Contact Us Forms
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Manage contact form submissions from visitors
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className={textSecondary} />
                  <span className={`text-sm font-semibold ${textColor}`}>{forms.length}</span>
                  <span className={`text-xs ${textSecondary}`}>Total Forms</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/20">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    {forms.filter(f => f.userType === 'candidate').length}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">Candidates</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-500/20">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                    {forms.filter(f => f.userType === 'recruiter').length}
                  </span>
                  <span className="text-xs text-purple-600 dark:text-purple-400">Recruiters</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    {forms.filter(f => f.status === 'new').length}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400">New</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}>
          <div className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
              />
            </div>

            {/* User Type Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-green-600 text-white'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('candidate')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'candidate'
                    ? 'bg-blue-600 text-white'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Candidates
              </button>
              <button
                onClick={() => setFilter('recruiter')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'recruiter'
                    ? 'bg-purple-600 text-white'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Recruiters
              </button>
            </div>

            {/* Date and Sort Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Date Filter */}
              <div className="flex-1">
                <label className={`text-xs font-semibold ${textSecondary} mb-1.5 flex items-center gap-1.5`}>
                  <Calendar size={12} />
                  Date Filter
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="older">Older than 30 Days</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex-1">
                <label className={`text-xs font-semibold ${textSecondary} mb-1.5 flex items-center gap-1.5`}>
                  <ArrowUpDown size={12} />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="nameAZ">Name (A-Z)</option>
                  <option value="nameZA">Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Forms List */}
        {filteredForms.length === 0 ? (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-green-500/20' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Phone size={32} className="text-green-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No contact forms found</h3>
            <p className={`${textSecondary}`}>
              {searchTerm || filter !== 'all' || dateFilter !== 'all' ? "Try adjusting your filters" : "No contact form submissions match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className={`${cardBg} border ${borderColor} rounded-lg p-4 hover:border-green-300 dark:hover:border-green-500 transition-colors shadow-sm`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      form.userType === 'candidate' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 to-purple-600'
                    } text-white font-bold text-lg shadow-md`}>
                      {form.name.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-base font-bold ${textColor} truncate`}>
                          {form.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          form.userType === 'candidate'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400'
                        }`}>
                          {form.userType === 'candidate' ? (
                            <><User size={11} /> Candidate</>
                          ) : (
                            <><Building size={11} /> Recruiter</>
                          )}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                          New
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm mb-1">
                        <Mail size={12} className={textSecondary} />
                        <a 
                          href={`mailto:${form.email}`}
                          className="text-green-600 dark:text-green-400 hover:underline truncate"
                        >
                          {form.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar size={11} className={textSecondary} />
                        <span className={textSecondary}>
                          {getRelativeTime(form.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Preview */}
                {form.message && (
                  <div className={`${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3 mb-3 border ${borderColor}`}>
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className={`${textSecondary} flex-shrink-0 mt-0.5`} />
                      <p className={`text-sm ${textColor} line-clamp-2`}>
                        {form.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewDetails(form)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedForm && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div 
            className={`${cardBg} rounded-xl max-w-2xl w-full shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-5 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedForm.userType === 'candidate' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                } text-white font-bold text-lg`}>
                  {selectedForm.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${textColor}`}>
                    Contact Form Details
                  </h2>
                  <p className={`text-sm ${textSecondary}`}>
                    {selectedForm.name}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className={`${textSecondary} hover:${textColor} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* User Type & Status */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 ${
                  selectedForm.userType === 'candidate'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400'
                }`}>
                  {selectedForm.userType === 'candidate' ? (
                    <><User size={14} /> Candidate</>
                  ) : (
                    <><Building size={14} /> Recruiter</>
                  )}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  New
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className={`${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                  <label className={`text-xs font-semibold ${textSecondary} mb-1 block flex items-center gap-1.5`}>
                    <User size={12} />
                    Full Name
                  </label>
                  <p className={`text-sm ${textColor} font-medium`}>{selectedForm.name}</p>
                </div>

                <div className={`${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                  <label className={`text-xs font-semibold ${textSecondary} mb-1 block flex items-center gap-1.5`}>
                    <Mail size={12} />
                    Email Address
                  </label>
                  <a 
                    href={`mailto:${selectedForm.email}`}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    {selectedForm.email}
                  </a>
                </div>

                <div className={`${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                  <label className={`text-xs font-semibold ${textSecondary} mb-1 block flex items-center gap-1.5`}>
                    <Calendar size={12} />
                    Submitted Date
                  </label>
                  <p className={`text-sm ${textColor} font-medium`}>{formatDate(selectedForm.submittedAt)}</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>{getRelativeTime(selectedForm.submittedAt)}</p>
                </div>

                {selectedForm.message && (
                  <div className={`${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                    <label className={`text-xs font-semibold ${textSecondary} mb-2 block flex items-center gap-1.5`}>
                      <MessageSquare size={12} />
                      Message
                    </label>
                    <p className={`text-sm ${textColor} whitespace-pre-wrap leading-relaxed`}>
                      {selectedForm.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`mailto:${selectedForm.email}`}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Reply via Email
                </a>
                <button
                  onClick={closeModal}
                  className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForms;