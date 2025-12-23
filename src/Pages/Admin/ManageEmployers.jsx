import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Building, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  X,
  Save,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { recruiterService } from "../../services/recruiterService";

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    blocked: "bg-red-500/10 text-red-600 border-red-500/20",
    rejected: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ApprovalBadge = ({ isApproved, status }) => {
  if (isApproved) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
        Approved
      </span>
    );
  }
  if (status === 'rejected' || status === 'inactive') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-500/10 text-red-600 border-red-500/20">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-600 border-amber-500/20">
      Pending
    </span>
  );
};

const StatsCard = ({ title, value, icon: Icon, trend }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}% from last month
          </p>
        )}
      </div>
      <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const ManageEmployers = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const recruitersPerPage = 8;

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRecruiter, setViewingRecruiter] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    location: ''
  });
  const [saving, setSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch recruiters data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllRecruiters();
        const recruitersData = response.recruiters || [];
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
    fetchData();
  }, []);

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
    } else if (approvalFilter === "active") {
      filtered = filtered.filter(recruiter => recruiter.status?.toLowerCase() === 'active');
    } else if (approvalFilter === "inactive") {
      filtered = filtered.filter(recruiter => recruiter.status?.toLowerCase() === 'inactive');
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

  // View Modal
  const openViewModal = async (recruiter) => {
    try {
      const response = await recruiterService.getProfile(recruiter.email);
      const recruiterDetails = response.success && response.data
        ? { ...recruiter, ...response.data }
        : recruiter;
      setViewingRecruiter(recruiterDetails);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch detailed recruiter data:', error);
      setViewingRecruiter(recruiter);
      setIsViewModalOpen(true);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingRecruiter(null);
  };

  // Edit Modal
  const openEditModal = async (recruiter) => {
    try {
      const response = await recruiterService.getProfile(recruiter.email);
      const recruiterDetails = response.success && response.data
        ? { ...recruiter, ...response.data }
        : recruiter;
      
      setEditingRecruiter(recruiter);
      setEditFormData({
        companyName: recruiterDetails.company_name || recruiter.company_name || '',
        contactPerson: recruiterDetails.full_name || recruiter.full_name || '',
        email: recruiterDetails.email || recruiter.email || '',
        phone: recruiterDetails.phone_number || recruiterDetails.phone || recruiter.phone_number || recruiter.phone || '',
        industry: recruiterDetails.industry || recruiter.industry || '',
        companySize: recruiterDetails.company_size || recruiter.company_size || '',
        location: recruiterDetails.location || recruiter.location || ''
      });
      setIsEditModalOpen(true);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to fetch recruiter data:', error);
      setEditingRecruiter(recruiter);
      setEditFormData({
        companyName: recruiter.company_name || '',
        contactPerson: recruiter.full_name || '',
        email: recruiter.email || '',
        phone: recruiter.phone_number || recruiter.phone || '',
        industry: recruiter.industry || '',
        companySize: recruiter.company_size || '',
        location: recruiter.location || ''
      });
      setIsEditModalOpen(true);
      setOpenDropdown(null);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRecruiter(null);
    setEditFormData({
      companyName: '', contactPerson: '', email: '', phone: '',
      industry: '', companySize: '', location: ''
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingRecruiter) return;
    setSaving(true);
    try {
      const transformedData = {
        company_name: editFormData.companyName || '',
        full_name: editFormData.contactPerson || '',
        phone_number: editFormData.phone || '',
        industry: editFormData.industry || '',
        company_size: editFormData.companySize || '',
        location: editFormData.location || ''
      };

      await recruiterService.updateProfile(editingRecruiter.email, transformedData);

      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || [];
      setRecruiters(recruitersData);

      closeEditModal();
      setMessage({ type: 'success', text: 'Employer updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating recruiter:', error);
      setMessage({ type: 'error', text: 'Failed to update employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleApproveRecruiter = async (recruiter) => {
    try {
      setActionLoading(recruiter.employer_id);

      await recruiterService.updateProfile(recruiter.email, {
        rejection_reason: null,
        status: 'active'
      });

      await adminService.approveRecruiter(recruiter);

      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || [];
      setRecruiters(recruitersData);

      setMessage({ type: 'success', text: `Employer ${recruiter.status === 'rejected' ? 're-' : ''}approved successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to approve recruiter:', error);
      setMessage({ type: 'error', text: 'Failed to approve employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRecruiter = (recruiter) => {
    setViewingRecruiter(recruiter);
    setShowRejectModal(true);
    setOpenDropdown(null);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Please enter a rejection reason.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      await recruiterService.updateProfile(viewingRecruiter.email, {
        rejection_reason: rejectionReason.trim(),
        status: 'rejected',
        hasadminapproved: false
      });

      await adminService.rejectRecruiter(viewingRecruiter);

      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || [];
      setRecruiters(recruitersData);

      setShowRejectModal(false);
      setViewingRecruiter(null);
      setRejectionReason('');

      setMessage({ type: 'success', text: 'Employer rejected successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to reject recruiter:', error);
      setMessage({ type: 'error', text: 'Failed to reject employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
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
      console.log('Blocking recruiter:', recruiter.email);
      
      // First update the profile
      await recruiterService.updateProfile(recruiter.email, {
        rejection_reason: 'your application not approve',
        status: 'blocked',
        hasadminapproved: false
      });

      // Then call block API
      await adminService.blockRecruiter(recruiter.email);

      // Remove from local state
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
          matches = matches && r.hasadminapproved === false && r.status !== 'rejected' && r.status !== 'inactive' && r.status !== 'blocked';
        } else if (approvalFilter === "approved") {
          matches = matches && r.hasadminapproved === true;
        } else if (approvalFilter === "rejected") {
          matches = matches && (r.status === 'rejected' || r.status === 'inactive' || r.status === 'blocked') && r.hasadminapproved === false;
        } else if (approvalFilter === "active") {
          matches = matches && r.status?.toLowerCase() === 'active';
        } else if (approvalFilter === "inactive") {
          matches = matches && r.status?.toLowerCase() === 'inactive';
        }
        
        return matches;
      }));

      setOpenDropdown(null);
      setMessage({ type: 'success', text: `${recruiter.company_name} has been blocked and removed from the system.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
      console.log('Recruiter blocked successfully');
    } catch (error) {
      console.error('Error blocking recruiter:', error);
      console.error('Error details:', error.response?.data || error.message);
      setMessage({ type: 'error', text: `Failed to block employer: ${error.response?.data?.message || error.message || 'Please try again.'}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const headers = [
        'Company Name', 'Contact Person', 'Email', 'Phone', 'Industry',
        'Company Size', 'Location', 'Status', 'Approval Status', 'Joined Date'
      ];

      const csvData = recruiters.map(recruiter => [
        recruiter.company_name || '',
        recruiter.full_name || '',
        recruiter.email || '',
        recruiter.phone_number || recruiter.phone || '',
        recruiter.industry || '',
        recruiter.company_size || '',
        recruiter.location || '',
        recruiter.status || 'active',
        recruiter.hasadminapproved ? 'Approved' :
        (recruiter.status === 'rejected' || recruiter.status === 'inactive') ? 'Rejected' : 'Pending',
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
  const activeCount = recruiters.filter(r => r.status?.toLowerCase() === 'active').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading employers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Manage Employers</h1>
            <p className="text-sm text-gray-600">View and manage all registered employers</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadCSV}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 rounded-lg p-4 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Employers"
            value={recruiters.length}
            icon={Building}
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatsCard
            title="Pending Approval"
            value={pendingCount}
            icon={Clock}
          />
          <StatsCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle}
            trend={{ value: 12.3, isPositive: true }}
          />
          <StatsCard
            title="Rejected/Blocked"
            value={rejectedCount}
            icon={XCircle}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, email, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="appearance-none h-10 pl-3 pr-10 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-44"
              >
                <option value="all">All Employers</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="approved">Approved ({approvedCount})</option>
                <option value="rejected">Rejected/Blocked ({rejectedCount})</option>
                <option value="active">Active ({activeCount})</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors shrink-0">
              <Filter className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Industry</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Approval</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRecruiters.length > 0 ? (
                  currentRecruiters.map((recruiter) => (
                    <tr 
                      key={recruiter.id || recruiter.employer_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 font-medium text-xs overflow-hidden">
                            {recruiter.company_logo ? (
                              <img src={recruiter.company_logo} alt={recruiter.company_name || 'Company'} className="h-full w-full object-cover" />
                            ) : (
                              getInitials(recruiter.company_name)
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{recruiter.company_name || 'N/A'}</p>
                            <p className="text-xs text-gray-600">{recruiter.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{recruiter.full_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{recruiter.phone_number || recruiter.phone || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{recruiter.location || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          {recruiter.industry || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{recruiter.company_size || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <ApprovalBadge isApproved={recruiter.hasadminapproved} status={recruiter.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(recruiter)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === recruiter.employer_id ? null : recruiter.employer_id)}
                            className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-gray-100 transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </button>
                          {openDropdown === recruiter.employer_id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenDropdown(null)}
                              />
                              <div className="absolute right-0 mt-1 w-36 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                                <button
                                  onClick={() => {
                                    openViewModal(recruiter);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    openEditModal(recruiter);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                {!recruiter.hasadminapproved && (
                                  <button
                                    onClick={() => {
                                      handleApproveRecruiter(recruiter);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    disabled={actionLoading === recruiter.employer_id}
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    {actionLoading === recruiter.employer_id ? 'Approving...' : 'Approve'}
                                  </button>
                                )}
                                {!recruiter.hasadminapproved && (
                                  <button
                                    onClick={() => {
                                      handleRejectRecruiter(recruiter);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                  </button>
                                )}
                                <button
                                  onClick={() => handleBlockRecruiter(recruiter)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Block
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Building className="h-10 w-10 mb-2 opacity-50" />
                        <p className="font-medium text-sm">No employers found</p>
                        <p className="text-xs">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{startIndex + 1}-{Math.min(endIndex, filteredRecruiters.length)}</span> of{" "}
              <span className="font-medium text-gray-900">{filteredRecruiters.length}</span> employers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button 
                      onClick={() => setCurrentPage(totalPages)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewingRecruiter && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Employer Profile</h2>
              <button
                onClick={closeViewModal}
                className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 font-bold text-2xl overflow-hidden">
                  {viewingRecruiter.company_logo ? (
                    <img src={viewingRecruiter.company_logo} alt={viewingRecruiter.company_name || 'Company'} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(viewingRecruiter.company_name)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{viewingRecruiter.company_name || 'N/A'}</h3>
                  <p className="text-gray-600 mt-1">{viewingRecruiter.email || 'N/A'}</p>
                  <div className="mt-2 flex gap-2">
                    <ApprovalBadge isApproved={viewingRecruiter.hasadminapproved} status={viewingRecruiter.status} />
                    <StatusBadge status={viewingRecruiter.status || 'active'} />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingRecruiter.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingRecruiter.phone_number || viewingRecruiter.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Industry</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingRecruiter.industry || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company Size</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingRecruiter.company_size || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingRecruiter.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Joined Date</p>
                    <p className="text-gray-900 font-medium mt-1">{formatDate(viewingRecruiter)}</p>
                  </div>
                </div>
              </div>

              {/* KYC Information */}
              {(viewingRecruiter.kyc_type || viewingRecruiter.kyc_document_number || viewingRecruiter.kycDocUrl) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">KYC Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingRecruiter.kyc_type && (
                      <div>
                        <p className="text-sm text-gray-600">KYC Type</p>
                        <p className="text-gray-900 font-medium mt-1">{viewingRecruiter.kyc_type}</p>
                      </div>
                    )}
                    {viewingRecruiter.kyc_document_number && (
                      <div>
                        <p className="text-sm text-gray-600">Document Number</p>
                        <p className="text-gray-900 font-medium mt-1">{viewingRecruiter.kyc_document_number}</p>
                      </div>
                    )}
                    {viewingRecruiter.kyc_status && (
                      <div>
                        <p className="text-sm text-gray-600">KYC Status</p>
                        <p className="text-gray-900 font-medium mt-1">{viewingRecruiter.kyc_status}</p>
                      </div>
                    )}
                    {viewingRecruiter.kycDocUrl && (
                      <div>
                        <p className="text-sm text-gray-600">KYC Document</p>
                        <a
                          href={viewingRecruiter.kycDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                        >
                          View Document →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {viewingRecruiter.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{viewingRecruiter.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 p-6 border-t border-gray-200">
              <div className="flex gap-2">
                {!viewingRecruiter.hasadminapproved && (
                  <>
                    <button
                      onClick={() => {
                        handleApproveRecruiter(viewingRecruiter);
                        closeViewModal();
                      }}
                      disabled={actionLoading === viewingRecruiter.employer_id}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {actionLoading === viewingRecruiter.employer_id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        handleRejectRecruiter(viewingRecruiter);
                        closeViewModal();
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={closeViewModal}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Employer</h2>
              <button
                onClick={closeEditModal}
                className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Company Name</label>
                <input
                  type="text"
                  value={editFormData.companyName}
                  onChange={(e) => handleEditFormChange('companyName', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Contact Person</label>
                <input
                  type="text"
                  value={editFormData.contactPerson}
                  onChange={(e) => handleEditFormChange('contactPerson', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  readOnly
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-gray-100 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Industry</label>
                <input
                  type="text"
                  value={editFormData.industry}
                  onChange={(e) => handleEditFormChange('industry', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Company Size</label>
                <div className="relative">
                  <select
                    value={editFormData.companySize}
                    onChange={(e) => handleEditFormChange('companySize', e.target.value)}
                    className="appearance-none w-full h-10 pl-3 pr-10 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Location</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => handleEditFormChange('location', e.target.value)}
                  placeholder="City, State"
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeEditModal}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && viewingRecruiter && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Reject Employer</h2>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setViewingRecruiter(null);
                  setRejectionReason('');
                }}
                className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600">Are you sure you want to reject this employer?</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm"><span className="font-semibold text-gray-900">Company:</span> {viewingRecruiter.company_name}</p>
                <p className="text-sm"><span className="font-semibold text-gray-900">Contact:</span> {viewingRecruiter.full_name}</p>
                <p className="text-sm"><span className="font-semibold text-gray-900">Email:</span> {viewingRecruiter.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Enter the reason for rejection..."
                  required
                />
              </div>
              <p className="text-sm text-gray-600">This action will mark the employer as rejected and they will not be able to log in.</p>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setViewingRecruiter(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Reject Employer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployers;