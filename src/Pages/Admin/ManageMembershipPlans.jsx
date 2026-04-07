import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { 
  CreditCard, 
  Edit, 
  Trash2, 
  Plus, 
  RefreshCw,
  User,
  Building,
  Check,
  X,
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
  Star,
  Zap,
  Award,
  TrendingUp,
  Power
} from "lucide-react";
import { planService } from "../../services/planService";
import { candidateService } from "../../services/candidateService";
import { adminService } from "../../services/adminService";

const ManageMembershipPlans = () => {
  const { theme } = useTheme();
  const [plans, setPlans] = useState([]);
  const [planType, setPlanType] = useState("CANDIDATE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [premiumPrices, setPremiumPrices] = useState({ gold: 400, platinum: 500, silver: 1000 });
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await planService.getPlansByUserType(planType);
      setPlans(response.data || []);
    } catch (err) {
      setError("Failed to fetch plans. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchPremiumPrices();
  }, [planType]);

  const fetchPremiumPrices = async () => {
    try {
      const response = await candidateService.getPremiumPrices();
      if (response.data) {
        setPremiumPrices(response.data);
      }
    } catch (error) {
      console.error('Error fetching premium prices:', error);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentPlan({
      name: "",
      price: 0,
      duration: "monthly",
      features: [],
      status: "Active",
      user_type: planType,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (plan) => {
    setIsEditing(true);
    setCurrentPlan({ ...plan, features: Array.isArray(plan.features) ? plan.features : [] });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPlan(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeaturesChange = (e) => {
    const featuresArray = e.target.value.split('\n');
    setCurrentPlan((prev) => ({ ...prev, features: featuresArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPlan) return;

    const planData = {
      ...currentPlan,
      price: Number(currentPlan.price),
    };

    try {
      if (isEditing) {
        await planService.updatePlan(currentPlan.id, planData);
      } else {
        await planService.createPlan(planData);
      }
      fetchPlans();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save plan.");
      console.error(err);
    }
  };

  const handleToggleStatus = async (plan) => {
    const updatedPlan = { ...plan, status: plan.status === 'Active' ? 'Inactive' : 'Active' };
    try {
      await planService.updatePlan(plan.id, updatedPlan);
      fetchPlans();
    } catch (err) {
      setError("Failed to update plan status.");
      console.error(err);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await planService.deletePlan(planId);
        fetchPlans();
      } catch (err) {
        setError("Failed to delete plan.");
        console.error(err);
      }
    }
  };

  const handlePremiumPriceChange = (e) => {
    const { name, value } = e.target;
    setPremiumPrices(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleUpdatePremiumPrices = async () => {
    try {
      await adminService.updatePremiumPrices({
        email: "admin@example.com",
        ...premiumPrices
      });
      alert("Premium prices updated successfully!");
      setShowPremiumModal(false);
      fetchPremiumPrices();
    } catch (error) {
      console.error('Error updating premium prices:', error);
      alert("Failed to update premium prices.");
    }
  };

  // Theme variables
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <CreditCard className="text-purple-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading membership plans...</h3>
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor} flex items-center gap-2`}>
                  <CreditCard className="text-purple-500" size={28} />
                  Manage Membership Plans
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Configure and manage subscription plans for users
                </p>
              </div>
              <button
                onClick={fetchPlans}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Plan Type Filter & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setPlanType("CANDIDATE")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    planType === 'CANDIDATE'
                      ? 'bg-blue-600 text-white'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  <User size={16} />
                  Candidate Plans
                </button>
                <button
                  onClick={() => setPlanType("RECRUITER")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    planType === 'RECRUITER'
                      ? 'bg-purple-600 text-white'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  <Building size={16} />
                  Recruiter Plans
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className={`px-4 py-2 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2`}
                >
                  <Star size={16} className="text-yellow-500" />
                  Premium Prices
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Premium Prices Section */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-6 mb-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
              <Star className="text-yellow-500" size={20} />
              Premium Plan Prices
            </h3>
            <button
              onClick={() => setShowPremiumModal(true)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Edit Prices
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`${isDark ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'} rounded-lg p-4 border-2 border-yellow-500/30`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-bold ${textColor} flex items-center gap-1`}>
                  <Award size={16} className="text-yellow-600 dark:text-yellow-400" />
                  Gold
                </h4>
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>₹{premiumPrices.gold}</p>
            </div>
            <div className={`${isDark ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20' : 'bg-gradient-to-br from-purple-50 to-purple-100'} rounded-lg p-4 border-2 border-purple-500/30`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-bold ${textColor} flex items-center gap-1`}>
                  <Zap size={16} className="text-purple-600 dark:text-purple-400" />
                  Platinum
                </h4>
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>₹{premiumPrices.platinum}</p>
            </div>
            <div className={`${isDark ? 'bg-gradient-to-br from-gray-700/50 to-gray-600/30' : 'bg-gradient-to-br from-gray-50 to-gray-100'} rounded-lg p-4 border-2 border-gray-500/30`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-bold ${textColor} flex items-center gap-1`}>
                  <TrendingUp size={16} className="text-gray-600 dark:text-gray-400" />
                  Silver
                </h4>
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>₹{premiumPrices.silver}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-20 h-20 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <CreditCard size={40} className="text-purple-500" />
            </div>
            <h3 className={`text-xl font-bold ${textColor} mb-2`}>No membership plans yet</h3>
            <p className={`${textSecondary} mb-6`}>
              Create the first membership plan for {planType.toLowerCase()}s to get started.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Create First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`${cardBg} border-2 ${borderColor} rounded-xl p-6 hover:shadow-xl transition-all hover:border-purple-300 dark:hover:border-purple-700 group relative overflow-hidden`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    plan.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                  }`}>
                    {plan.status === 'Active' ? <Check size={12} /> : <X size={12} />}
                    {plan.status}
                  </span>
                </div>

                {/* Plan Header */}
                <div className="mb-4">
                  <h3 className={`text-xl font-bold ${textColor} mb-2 pr-20`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${textColor}`}>₹{plan.price}</span>
                    <span className={`text-base ${textSecondary}`}>/{plan.duration}</span>
                  </div>
                </div>

                {/* Features */}
                <div className={`${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-4 mb-4 border ${borderColor}`}>
                  <h4 className={`text-sm font-bold ${textColor} mb-3 flex items-center gap-2`}>
                    <Check size={16} className="text-purple-500" />
                    Features
                  </h4>
                  <ul className="space-y-2">
                    {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                      <li key={index} className={`text-sm ${textColor} flex items-start gap-2`}>
                        <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Users size={16} className={textSecondary} />
                    <span className={`text-sm ${textSecondary}`}>Users:</span>
                    <span className={`text-sm font-bold ${textColor}`}>{plan.userCount || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(plan)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    title="Edit Plan"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className={`px-3 py-2 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium`}
                    title="Toggle Status"
                  >
                    <Power size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    title="Delete Plan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${cardBg} rounded-xl max-w-2xl w-full shadow-2xl border ${borderColor}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h2 className={`text-2xl font-bold ${textColor}`}>
                {isEditing ? 'Edit' : 'Add'} Membership Plan
              </h2>
              <button
                onClick={handleCloseModal}
                className={`${textSecondary} hover:${textColor} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentPlan.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  placeholder="e.g., Basic Plan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-semibold ${textColor} mb-2 block`}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={currentPlan.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={`text-sm font-semibold ${textColor} mb-2 block`}>
                    Duration *
                  </label>
                  <select
                    name="duration"
                    value={currentPlan.duration}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>
                  Features (one per line) *
                </label>
                <textarea
                  name="features"
                  rows="6"
                  value={Array.isArray(currentPlan.features) ? currentPlan.features.join('\n') : ''}
                  onChange={handleFeaturesChange}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>
                  Status *
                </label>
                <select
                  name="status"
                  value={currentPlan.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 px-6 py-3 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {isEditing ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Prices Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-xl max-w-md w-full shadow-2xl border ${borderColor}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h2 className={`text-2xl font-bold ${textColor} flex items-center gap-2`}>
                <Star className="text-yellow-500" size={24} />
                Update Premium Prices
              </h2>
              <button
                onClick={() => setShowPremiumModal(false)}
                className={`${textSecondary} hover:${textColor} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={(e) => { e.preventDefault(); handleUpdatePremiumPrices(); }} className="p-6 space-y-4">
              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block flex items-center gap-2`}>
                  <Award size={16} className="text-yellow-600 dark:text-yellow-400" />
                  Gold Price (₹) *
                </label>
                <input
                  type="number"
                  name="gold"
                  value={premiumPrices.gold}
                  onChange={handlePremiumPriceChange}
                  required
                  min="0"
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  placeholder="0"
                />
              </div>

              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block flex items-center gap-2`}>
                  <Zap size={16} className="text-purple-600 dark:text-purple-400" />
                  Platinum Price (₹) *
                </label>
                <input
                  type="number"
                  name="platinum"
                  value={premiumPrices.platinum}
                  onChange={handlePremiumPriceChange}
                  required
                  min="0"
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  placeholder="0"
                />
              </div>

              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block flex items-center gap-2`}>
                  <TrendingUp size={16} className="text-gray-600 dark:text-gray-400" />
                  Silver Price (₹) *
                </label>
                <input
                  type="number"
                  name="silver"
                  value={premiumPrices.silver}
                  onChange={handlePremiumPriceChange}
                  required
                  min="0"
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  placeholder="0"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowPremiumModal(false)}
                  className={`flex-1 px-6 py-3 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Update Prices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembershipPlans;