/**
 * Calculate recruiter/employer profile completion percentage
 * @param {Object} profileData - The profile data object
 * @returns {number} Completion percentage (0-100)
 */
export const calculateRecruiterProfileCompletion = (profileData) => {
  if (!profileData) return 0;

  // Define all fields with their weights (total should be 100)
  const fields = [
    { name: 'company_name', weight: 15, required: true },
    { name: 'email', weight: 10, required: true },
    { name: 'phone_number', weight: 10, required: true },
    { name: 'company_website', weight: 5, required: false },
    { name: 'industry', weight: 10, required: true },
    { name: 'company_size', weight: 10, required: true },
    { name: 'description', weight: 15, required: true },
    { name: 'address', weight: 5, required: false },
    { name: 'city', weight: 5, required: false },
    { name: 'state', weight: 5, required: false },
    { name: 'country', weight: 5, required: false },
    { name: 'postal_code', weight: 5, required: false },
    { name: 'founded_year', weight: 5, required: false },
  ];

  // Calculate completion based on required fields only (for 100% requirement)
  // Optional fields can add bonus percentage but don't count toward the 100% requirement
  const requiredFields = fields.filter(f => f.required);
  const requiredFieldsTotal = requiredFields.reduce((sum, f) => sum + f.weight, 0);
  let requiredFieldsCompleted = 0;

  requiredFields.forEach(field => {
    const value = profileData[field.name] || 
                  (field.name === 'phone_number' ? (profileData.phone || profileData.phoneNumber) : null) ||
                  (field.name === 'company_website' ? (profileData.website || profileData.company_website) : null);

    const isCompleted = value !== null && 
                       value !== undefined && 
                       String(value).trim() !== '';

    if (isCompleted) {
      requiredFieldsCompleted += field.weight;
    }
  });

  // Calculate percentage based on required fields only
  // 100% = all required fields complete
  const percentage = requiredFieldsTotal > 0 
    ? Math.round((requiredFieldsCompleted / requiredFieldsTotal) * 100) 
    : 0;
  
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Get missing required fields for profile completion
 * @param {Object} profileData - The profile data object
 * @returns {Array} Array of missing field names
 */
export const getMissingRequiredFields = (profileData) => {
  if (!profileData) return [];

  const requiredFields = [
    { name: 'company_name', displayName: 'Company Name' },
    { name: 'email', displayName: 'Email' },
    { name: 'phone_number', displayName: 'Phone Number' },
    { name: 'industry', displayName: 'Industry' },
    { name: 'company_size', displayName: 'Company Size' },
    { name: 'description', displayName: 'Company Description' },
  ];

  const missing = [];

  requiredFields.forEach(field => {
    const value = profileData[field.name] || 
                  (field.name === 'phone_number' ? (profileData.phone || profileData.phoneNumber) : null);

    if (!value || String(value).trim() === '') {
      missing.push(field.displayName);
    }
  });

  return missing;
};

/**
 * Check if profile is 100% complete
 * @param {Object} profileData - The profile data object
 * @returns {boolean} True if profile is 100% complete
 */
export const isProfileComplete = (profileData) => {
  return calculateRecruiterProfileCompletion(profileData) === 100;
};

