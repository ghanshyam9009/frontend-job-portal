import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import styles from "./UserDashboard.module.css";

const ProfileManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
    currentPosition: "",
    experience: [],
    education: [],
    skills: [],
    resume: null
  });

  const [activeTab, setActiveTab] = useState('personal');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        resume: file
      }));
      alert(`Resume "${file.name}" uploaded successfully!`);
    }
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    };
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: ""
    };
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    const skill = prompt("Enter a skill:");
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSaveProfile = () => {
    alert("Profile saved successfully!");
    // Here you would typically save to backend
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'resume', label: 'Resume', icon: '📄' }
  ];

  return (
    <div className={styles.dashboardContainer}>
      <CandidateNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className={styles.main}>
        <section className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <h2>Profile Management</h2>
            <p>Complete your profile to attract better opportunities</p>
          </div>
          
          <div className={styles.profileContainer}>
            <div className={styles.profileTabs}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'personal' && (
                <div className={styles.formSection}>
                  <h3>Personal Information</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Location</label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Enter your location"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Current Position</label>
                      <input
                        type="text"
                        value={profileData.currentPosition}
                        onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                        placeholder="Enter your current position"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className={styles.formSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Work Experience</h3>
                    <button className={styles.addBtn} onClick={addExperience}>
                      + Add Experience
                    </button>
                  </div>
                  {profileData.experience.map((exp) => (
                    <div key={exp.id} className={styles.experienceCard}>
                      <div className={styles.cardHeader}>
                        <h4>Experience Entry</h4>
                        <button 
                          className={styles.removeBtn}
                          onClick={() => removeExperience(exp.id)}
                        >
                          ❌
                        </button>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label>Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Company name"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            placeholder="Job title"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Start Date</label>
                          <input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>End Date</label>
                          <input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'education' && (
                <div className={styles.formSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Education</h3>
                    <button className={styles.addBtn} onClick={addEducation}>
                      + Add Education
                    </button>
                  </div>
                  {profileData.education.map((edu) => (
                    <div key={edu.id} className={styles.educationCard}>
                      <div className={styles.cardHeader}>
                        <h4>Education Entry</h4>
                        <button 
                          className={styles.removeBtn}
                          onClick={() => removeEducation(edu.id)}
                        >
                          ❌
                        </button>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label>Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            placeholder="University/School name"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Bachelor's, Master's, etc."
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Field of Study</label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            placeholder="Computer Science, Business, etc."
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Start Date</label>
                          <input
                            type="date"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>End Date</label>
                          <input
                            type="date"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>GPA</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="3.8/4.0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className={styles.formSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Skills</h3>
                    <button className={styles.addBtn} onClick={addSkill}>
                      + Add Skill
                    </button>
                  </div>
                  <div className={styles.skillsContainer}>
                    {profileData.skills.map((skill, index) => (
                      <div key={index} className={styles.skillTag}>
                        {skill}
                        <button 
                          className={styles.removeSkillBtn}
                          onClick={() => removeSkill(skill)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'resume' && (
                <div className={styles.formSection}>
                  <h3>Resume Upload</h3>
                  <div className={styles.uploadSection}>
                    <div className={styles.uploadArea}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className={styles.fileInput}
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className={styles.uploadLabel}>
                        <div className={styles.uploadIcon}>📄</div>
                        <p>Click to upload your resume</p>
                        <span>PDF, DOC, DOCX (Max 5MB)</span>
                      </label>
                    </div>
                    {profileData.resume && (
                      <div className={styles.uploadedFile}>
                        <span className={styles.fileIcon}>📄</span>
                        <span className={styles.fileName}>{profileData.resume.name}</span>
                        <span className={styles.fileSize}>
                          {(profileData.resume.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.saveSection}>
              <button className={styles.saveBtn} onClick={handleSaveProfile}>
                Save Profile
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfileManagement;


