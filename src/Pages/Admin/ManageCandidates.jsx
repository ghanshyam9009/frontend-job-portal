import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { studentService } from "../../services/studentService";
import { Eye, Edit, Search, Users, X, Save, Trash2 } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageCandidates = () => {
  const { theme } = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const candidatesPerPage = 10;

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  // Edit Modal State
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

  // Fetch candidates data
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
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }
    setFilteredCandidates(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, candidates]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: { class: 'statusActive', text: 'Active' },
      inactive: { class: 'statusInactive', text: 'Inactive' }
    };
    const statusInfo = statusStyles[status] || statusStyles.active;
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // View Modal Functions
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

  // Edit Modal Functions
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
        c.email === editingCandidate.email ? { ...c, name: editFormData.full_name, phone: editFormData.phone_number, location: editFormData.address, skills: editFormData.skills, status: editFormData.status } : c
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

      // Remove the blocked student from the lists
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

      alert(`${candidate.name} has been blocked and removed from the system.`);
    } catch (error) {
      console.error('Error blocking student:', error);
      alert('Failed to block student. Please try again.');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const endIndex = startIndex + candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}><div className={styles.loadingSpinner}></div><p>Loading candidates...</p></div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Manage Candidates</h1>
        <p className={styles.pageSubtitle}>View and manage all registered candidates</p>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
          <Search className={styles.searchIcon} />
        </div>
        <div className={styles.filterButtons}>
          <button className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`} onClick={() => setStatusFilter('all')}>All ({candidates.length})</button>
          <button className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.active : ''}`} onClick={() => setStatusFilter('active')}>Active ({candidates.filter(c => c.status?.toLowerCase() === 'active').length})</button>
          <button className={`${styles.filterBtn} ${statusFilter === 'inactive' ? styles.active : ''}`} onClick={() => setStatusFilter('inactive')}>Inactive ({candidates.filter(c => c.status?.toLowerCase() === 'inactive').length})</button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Location</th>
              <th>Experience</th><th>Skills</th><th>Status</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCandidates.map((candidate) => (
              <tr key={candidate.id || candidate.email}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {candidate.logo ? (
                        <img src={candidate.logo} alt={candidate.name || 'Candidate'} className={styles.candidateImage} />
                      ) : (
                        (candidate.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className={styles.userName}>{candidate.name}</span>
                  </div>
                </td>
                <td><a href={`mailto:${candidate.email}`} className={styles.emailLink}>{candidate.email}</a></td>
                <td>{candidate.phone}</td>
                <td className={styles.locationCell}>
                  {candidate.city || 'N/A'}
                </td>
                <td>{candidate.experience}</td>
                <td>
                  <div className={styles.skillsContainer}>
                    {(candidate.skills || []).slice(0, 2).map((skill, index) => (<span key={index} className={styles.skillTag}>{skill}</span>))}
                    {(candidate.skills || []).length > 2 && (<span className={styles.skillTag}>+{(candidate.skills || []).length - 2}</span>)}
                  </div>
                </td>
                <td>{getStatusBadge(candidate.status)}</td>
                <td className={styles.dateCell}>{formatDate(candidate.created_at)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionBtn} title="View Profile" onClick={() => openViewModal(candidate)}><Eye size={16} /></button>
                    <button className={styles.actionBtn} title="Edit" onClick={() => openEditModal(candidate)}><Edit size={16} /></button>
                    <button className={`${styles.actionBtn} ${styles.blockBtn}`} title="Block Student" onClick={() => handleBlockStudent(candidate)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.paginationBtn} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</button>
          <span className={styles.paginationInfo}>Page {currentPage} of {totalPages}</span>
          <button className={styles.paginationBtn} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      {filteredCandidates.length === 0 && (
        <div className={styles.emptyState}>
          <Users className={styles.emptyIcon} /><h3>No candidates found</h3><p>No candidates match your current filters.</p>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingCandidate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Candidate Profile</h2>
              <button className={styles.modalCloseBtn} onClick={closeViewModal}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.candidateProfileContainer}>
                {/* Profile Header */}
                <div className={styles.candidateProfileHeader}>
                  <div className={styles.candidateProfileImage}>
                    {viewingCandidate.logo ? (
                      <img src={viewingCandidate.logo} alt={viewingCandidate.name || 'Candidate'} />
                    ) : (
                      <div className={styles.candidateInitials}>
                        {(viewingCandidate.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.candidateProfileInfo}>
                    <h3 className={styles.candidateName}>{viewingCandidate.name}</h3>
                    <p className={styles.candidateEmail}>{viewingCandidate.email}</p>
                    <div className={styles.candidateStatus}>
                      {getStatusBadge(viewingCandidate.status)}
                    </div>
                  </div>
                </div>

                {/* Profile Sections */}
                <div className={styles.profileSections}>
                  {/* Personal Information */}
                  <div className={styles.profileSection}>
                    <h4 className={styles.sectionTitle}>Personal Information</h4>
                    <div className={styles.sectionGrid}>
                      <div className={styles.infoItem}>
                        <label>Phone</label>
                        <span>{viewingCandidate.phone || 'Not provided'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Location</label>
                        <span>{viewingCandidate.location || 'Not provided'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>City</label>
                        <span>{viewingCandidate.city || 'Not provided'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Date of Birth</label>
                        <span>{viewingCandidate.dob ? new Date(viewingCandidate.dob).toLocaleDateString() : 'Not provided'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Gender</label>
                        <span>{viewingCandidate.gender || 'Not provided'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Joined Date</label>
                        <span>{formatDate(viewingCandidate.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className={styles.profileSection}>
                    <h4 className={styles.sectionTitle}>Professional Information</h4>
                    <div className={styles.sectionContent}>
                      <div className={styles.infoItem}>
                        <label>Experience</label>
                        <span>{viewingCandidate.experience || 'Not specified'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Skills</label>
                        <div className={styles.skillsList}>
                          {viewingCandidate.skills && viewingCandidate.skills.length > 0 ? (
                            viewingCandidate.skills.map((skill, index) => (
                              <span key={index} className={styles.skillBadge}>{skill}</span>
                            ))
                          ) : (
                            <span>Not specified</span>
                          )}
                        </div>
                      </div>
                      {viewingCandidate.bio && (
                        <div className={styles.infoItem}>
                          <label>Bio</label>
                          <p className={styles.bioText}>{viewingCandidate.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  {viewingCandidate.education && viewingCandidate.education.length > 0 && (
                    <div className={styles.profileSection}>
                      <h4 className={styles.sectionTitle}>Education</h4>
                      <div className={styles.educationList}>
                        {viewingCandidate.education.map((edu, index) => (
                          <div key={index} className={styles.educationItem}>
                            <h5>{edu.degree || 'Degree not specified'}</h5>
                            <p>{edu.institution || 'Institution not specified'}</p>
                            {edu.year && <span className={styles.year}>{edu.year}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  <div className={styles.profileSection}>
                    <h4 className={styles.sectionTitle}>Resume</h4>
                    <div className={styles.resumeSection}>
                      {viewingCandidate.resume ? (
                        <>
                          <div className={styles.resumeInfo}>
                            <span className={styles.resumeIcon}>📄</span>
                            <span>Resume Available</span>
                          </div>
                          <a
                            href={viewingCandidate.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.resumeLink}
                          >
                            View Resume
                          </a>
                        </>
                      ) : (
                        <div className={styles.resumeInfo}>
                          <span className={styles.resumeIcon}>📄</span>
                          <span>No resume uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeViewModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Edit Candidate</h2>
              <button className={styles.modalCloseBtn} onClick={closeEditModal}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.editForm}>
                <div className={styles.formGroup}><label htmlFor="name">Name</label><input type="text" id="name" value={editFormData.full_name} onChange={(e) => handleEditFormChange('full_name', e.target.value)} className={styles.formInput} /></div>
                <div className={styles.formGroup}><label htmlFor="email">Email</label><input type="email" id="email" value={editFormData.email} readOnly className={styles.formInput} /></div>
                <div className={styles.formGroup}><label htmlFor="phone">Phone</label><input type="tel" id="phone" value={editFormData.phone_number} onChange={(e) => handleEditFormChange('phone_number', e.target.value)} className={styles.formInput} /></div>
                <div className={styles.formGroup}><label htmlFor="location">Location</label><input type="text" id="location" value={editFormData.address} onChange={(e) => handleEditFormChange('address', e.target.value)} className={styles.formInput} placeholder="City, State" /></div>
                <div className={styles.formGroup}><label htmlFor="experience">Experience</label><input type="text" id="experience" value={editFormData.experience_years} onChange={(e) => handleEditFormChange('experience_years', e.target.value)} className={styles.formInput} placeholder="e.g. 3 years" /></div>
                <div className={styles.formGroup}><label htmlFor="skills">Skills</label><input type="text" id="skills" value={editFormData.skills.join(', ')} onChange={(e) => handleEditFormChange('skills', e.target.value)} className={styles.formInput} placeholder="JavaScript, React, Node.js (comma separated)" /></div>
                <div className={styles.formGroup}><label htmlFor="status">Status</label>
                  <select id="status" value={editFormData.status} onChange={(e) => handleEditFormChange('status', e.target.value)} className={styles.formSelect}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeEditModal} disabled={saving}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveEdit} disabled={saving}>
                {saving ? (<><div className={styles.loadingSpinner}></div>Saving...</>) : (<><Save size={16} /> Save Changes</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;
