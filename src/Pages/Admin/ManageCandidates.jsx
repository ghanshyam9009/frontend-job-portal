import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Users, 
  UserCheck, 
  Clock, 
  UserX,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  X,
  Save,
  ChevronDown
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { studentService } from "../../services/studentService";

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
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

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const candidatesPerPage = 8;

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    experience_years: '',
    skills: [],
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  // Fetch candidates data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const candidatesData = await adminService.getCandidates();
        const sortedCandidates = candidatesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    fetchData();
  }, []);

  // Filter candidates based on search and status
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
    setFilteredCandidates(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, candidates]);

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

  // View Modal
  const openViewModal = (candidate) => {
    console.log('Viewing candidate:', candidate);
    console.log('Resume data:', candidate.resume);
    setViewingCandidate(candidate);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingCandidate(null);
  };

  // Edit Modal
  const openEditModal = (candidate) => {
    setEditingCandidate(candidate);
    setEditFormData({
      full_name: candidate.name || '',
      email: candidate.email || '',
      phone_number: candidate.phone || '',
      address: typeof candidate.location === 'object'
        ? `${candidate.location.city || ''}, ${candidate.location.state || ''}`.trim().replace(/^,/, '') || ''
        : candidate.location || '',
      experience_years: candidate.experience || '',
      skills: Array.isArray(candidate.skills) ? candidate.skills : (candidate.skills ? String(candidate.skills).split(',').map(s => s.trim()) : []),
      status: candidate.status || 'active'
    });
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCandidate(null);
    setEditFormData({
      full_name: '', email: '', phone_number: '', address: '',
      experience_years: '', skills: [], status: 'active'
    });
  };

  const handleEditFormChange = (field, value) => {
    if (field === 'skills') {
      setEditFormData(prev => ({ ...prev, skills: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else {
      setEditFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCandidate) return;
    setSaving(true);
    try {
      const dataForSubmission = {
        full_name: editFormData.full_name,
        phone_number: editFormData.phone_number,
        address: editFormData.address,
        skills: Array.isArray(editFormData.skills) ? editFormData.skills.join(', ') : editFormData.skills,
        experience_years: editFormData.experience_years,
        status: editFormData.status,
      };

      await studentService.updateProfile(editingCandidate.email, dataForSubmission);

      const updatedCandidates = candidates.map(c =>
        c.email === editingCandidate.email ? { 
          ...c, 
          name: editFormData.full_name, 
          phone: editFormData.phone_number, 
          location: editFormData.address, 
          experience: editFormData.experience_years,
          skills: editFormData.skills, 
          status: editFormData.status 
        } : c
      );
      setCandidates(updatedCandidates);
      setFilteredCandidates(updatedCandidates);

      closeEditModal();
      alert('Candidate updated successfully!');
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('Failed to update candidate. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockStudent = async (candidate) => {
    if (!candidate || !candidate.email) return;

    const confirmBlock = window.confirm(
      `Are you sure you want to block ${candidate.name}? This will remove them from the system.`
    );

    if (!confirmBlock) return;

    try {
      await adminService.blockStudent(candidate.email);

      const updatedCandidates = candidates.filter(c => c.email !== candidate.email);
      setCandidates(updatedCandidates);
      setFilteredCandidates(updatedCandidates.filter(c => {
        if (searchTerm) {
          return (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                 (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        }
        if (statusFilter !== "all") {
          return c.status === statusFilter;
        }
        return true;
      }));

      setOpenDropdown(null);
      alert(`${candidate.name} has been blocked and removed from the system.`);
    } catch (error) {
      console.error('Error blocking student:', error);
      alert('Failed to block student. Please try again.');
    }
  };

  const toggleCheckbox = (id) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllCheckboxes = () => {
    if (selectedCandidates.length === currentCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(currentCandidates.map(c => c.id));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
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
            <h1 className="text-xl font-semibold text-gray-900">Manage Candidates</h1>
            <p className="text-sm text-gray-600">View and manage all registered candidates</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Candidates"
            value={candidates.length}
            icon={Users}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Active Candidates"
            value={activeCount}
            icon={UserCheck}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="Inactive Candidates"
            value={inactiveCount}
            icon={Clock}
          />
          <StatsCard
            title="This Month"
            value={thisMonthCount}
            icon={UserX}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none h-10 pl-3 pr-10 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors shrink-0">
              <Filter className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Table */}
   <div className="rounded-xl border border-gray-200 bg-white shadow-sm ">
  <div className=" overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Candidate</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Phone</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Location</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Experience</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Skills</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Joined</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {currentCandidates.length > 0 ? (
          currentCandidates.map((candidate) => (
            <tr 
              key={candidate.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 font-medium text-xs">
                    {candidate.logo ? (
                      <img src={candidate.logo} alt={candidate.name || 'Candidate'} className="h-full w-full object-cover" />
                    ) : (
                      getInitials(candidate.name)
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{candidate.name || 'N/A'}</p>
                    <p className="text-xs text-gray-600">{candidate.email || 'N/A'}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{candidate.phone || 'N/A'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{candidate.city || 'N/A'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{candidate.experience || 'N/A'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {(candidate.skills || []).slice(0, 2).map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      {skill}
                    </span>
                  ))}
                  {(candidate.skills || []).length > 2 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-500/10 text-gray-600">
                      +{(candidate.skills || []).length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={candidate.status || 'active'} />
              </td>
              <td className="px-3 py-2 text-xs text-gray-600">
                {formatDate(candidate.created_at)}
              </td>
              <td className="px-3 py-2">
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === candidate.id ? null : candidate.id)}
                    className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-gray-100 transition-colors"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                  </button>
                  {openDropdown === candidate.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setOpenDropdown(null)}
                      />
                      <div className="absolute right-0 mt-1 w-32 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                        <button
                          onClick={() => {
                            openViewModal(candidate);
                            setOpenDropdown(null);
                          }}
                          className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            openEditModal(candidate);
                          }}
                          className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleBlockStudent(candidate)}
                          className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
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
                <Users className="h-10 w-10 mb-2 opacity-50" />
                <p className="font-medium text-sm">No candidates found</p>
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
              Showing <span className="font-medium text-gray-900">{startIndex + 1}-{Math.min(endIndex, filteredCandidates.length)}</span> of{" "}
              <span className="font-medium text-gray-900">{filteredCandidates.length}</span> candidates
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
      {isViewModalOpen && viewingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Candidate Profile</h2>
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
                  {viewingCandidate.logo ? (
                    <img src={viewingCandidate.logo} alt={viewingCandidate.name || 'Candidate'} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(viewingCandidate.name)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{viewingCandidate.name || 'N/A'}</h3>
                  <p className="text-gray-600 mt-1">{viewingCandidate.email || 'N/A'}</p>
                  <div className="mt-2">
                    <StatusBadge status={viewingCandidate.status || 'active'} />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingCandidate.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingCandidate.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingCandidate.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="text-gray-900 font-medium mt-1">
                      {viewingCandidate.dob ? new Date(viewingCandidate.dob).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingCandidate.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Joined Date</p>
                    <p className="text-gray-900 font-medium mt-1">{formatDate(viewingCandidate.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="text-gray-900 font-medium mt-1">{viewingCandidate.experience || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(viewingCandidate.skills && viewingCandidate.skills.length > 0) ? (
                        viewingCandidate.skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-600">Not specified</span>
                      )}
                    </div>
                  </div>
                  {viewingCandidate.bio && (
                    <div>
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="text-gray-900 mt-1">{viewingCandidate.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              {viewingCandidate.education && viewingCandidate.education.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Education</h4>
                  <div className="space-y-3">
                    {viewingCandidate.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-semibold text-gray-900">{edu.degree || 'Degree not specified'}</p>
                        <p className="text-gray-600">{edu.institution || 'Institution not specified'}</p>
                        {edu.year && <p className="text-sm text-gray-600 mt-1">{edu.year}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Resume</h4>
                {viewingCandidate.resume ? (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <span className="text-gray-900 font-medium">Resume Available</span>
                    </div>
                    <a
                      href={viewingCandidate.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Resume
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                    <span className="text-2xl">📄</span>
                    <p className="text-gray-600">No resume uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
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
              <h2 className="text-xl font-semibold text-gray-900">Edit Candidate</h2>
              <button
                onClick={closeEditModal}
                className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) => handleEditFormChange('full_name', e.target.value)}
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
                  value={editFormData.phone_number}
                  onChange={(e) => handleEditFormChange('phone_number', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Location</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => handleEditFormChange('address', e.target.value)}
                  placeholder="City, State"
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Experience</label>
                <input
                  type="text"
                  value={editFormData.experience_years}
                  onChange={(e) => handleEditFormChange('experience_years', e.target.value)}
                  placeholder="e.g. 3 years"
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Skills</label>
                <input
                  type="text"
                  value={editFormData.skills.join(', ')}
                  onChange={(e) => handleEditFormChange('skills', e.target.value)}
                  placeholder="JavaScript, React, Node.js (comma separated)"
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Status</label>
                <div className="relative">
                  <select
                    value={editFormData.status}
                    onChange={(e) => handleEditFormChange('status', e.target.value)}
                    className="appearance-none w-full h-10 pl-3 pr-10 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
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
    </div>
  );
};

export default ManageCandidates;