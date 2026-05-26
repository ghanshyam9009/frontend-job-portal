import React, { useState, useEffect, useCallback } from "react";
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
  Users,
  AlertCircle,
  Power,
} from "lucide-react";
import adminPlanService, {
  normalizePlansList,
  getPlanId,
} from "../../services/adminPlanService";

const PLAN_TABS = {
  candidate: { label: "Candidate Plans", icon: User, type: "candidate" },
  employer: { label: "Recruiter Plans", icon: Building, type: "employer" },
};

const makePlanIdFromName = (name) =>
  (name || "").trim().toLowerCase().replace(/\s+/g, "-");

const emptyPlan = (type) => ({
  name: "",
  description: "",
  price: 0,
  validity_days: "monthly",
  features: [],
  status: "Active",
  type,
  popular: false,
});

const AdminPlans = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("candidate");
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const planType = PLAN_TABS[activeTab].type;

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminPlanService.getAllPlans(planType);
      setPlans(normalizePlansList(response));
    } catch (err) {
      console.error(err);
      setError("Failed to load plans. Please try again.");
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [planType]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentPlan(emptyPlan(planType));
    setShowModal(true);
  };

  const handleOpenEditModal = (plan) => {
    setIsEditing(true);
    setCurrentPlan({
      ...plan,
      type: plan.type || planType,
      validity_days: plan.validity_days ?? "monthly",
      features: Array.isArray(plan.features) ? plan.features : [],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPlan(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPlan((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeaturesChange = (e) => {
    const featuresArray = e.target.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    setCurrentPlan((prev) => ({ ...prev, features: featuresArray }));
  };

  const buildPayload = (isCreate) => {
    const payload = {
      name: currentPlan.name?.trim(),
      description: currentPlan.description?.trim() || "",
      price: Number(currentPlan.price) || 0,
      validity_days: currentPlan.validity_days,
      features: currentPlan.features || [],
      status: currentPlan.status,
      type: planType,
      popular: Boolean(currentPlan.popular),
    };
    if (isCreate) {
      payload.plan_id = makePlanIdFromName(currentPlan.name);
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPlan) return;

    if (!currentPlan.name?.trim()) {
      setError("Plan name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        const id = getPlanId(currentPlan);
        if (!id) {
          setError("This plan has no ID; cannot update.");
          return;
        }
        await adminPlanService.updatePlan(id, buildPayload(false));
      } else {
        await adminPlanService.createPlan(buildPayload(true));
      }
      handleCloseModal();
      await fetchPlans();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    const id = getPlanId(plan);
    if (!id) return;
    const updated = {
      ...plan,
      status: plan.status === "Active" ? "Inactive" : "Active",
      type: plan.type || planType,
    };
    try {
      await adminPlanService.updatePlan(id, updated);
      await fetchPlans();
    } catch (err) {
      console.error(err);
      setError("Failed to update plan status.");
    }
  };

  const handleDeletePlan = async (plan) => {
    const id = getPlanId(plan);
    if (!id) return;
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await adminPlanService.deletePlan(id);
      await fetchPlans();
    } catch (err) {
      console.error(err);
      setError("Failed to delete plan.");
    }
  };

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const scrollHide = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";
  const btnPrimary = "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/40";

  if (isLoading && plans.length === 0) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <h3 className={`text-lg font-bold ${textColor}`}>Loading plans...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor} flex items-center gap-2`}>
                  <CreditCard className="text-blue-600" size={28} />
                  Plans
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Manage candidate and recruiter subscription plans
                </p>
              </div>
              <button
                type="button"
                onClick={fetchPlans}
                disabled={isLoading}
                className={`px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm disabled:opacity-50 ${btnPrimary}`}
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 w-fit">
                {Object.entries(PLAN_TABS).map(([key, tab]) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : `${textColor} hover:bg-white/80 dark:hover:bg-gray-600`
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 w-fit ${btnPrimary}`}
              >
                <Plus size={16} />
                Add {PLAN_TABS[activeTab].label.replace(" Plans", " Plan")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {plans.length === 0 ? (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <CreditCard size={40} className="text-blue-600 mx-auto mb-4" />
            <h3 className={`text-xl font-bold ${textColor} mb-2`}>No plans yet</h3>
            <p className={`${textSecondary} mb-6`}>
              Create the first {PLAN_TABS[activeTab].label.toLowerCase()} to get started.
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className={`px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 ${btnPrimary}`}
            >
              <Plus size={18} />
              Create Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const id = getPlanId(plan);
              const features = Array.isArray(plan.features) ? plan.features : [];
              const isPopular = Boolean(plan.popular);
              const isActive = plan.status === "Active";

              return (
                <article
                  key={id}
                  className={`group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
                    isPopular
                      ? "border-blue-400 dark:border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20"
                      : `${borderColor} shadow-sm hover:border-blue-300 dark:hover:border-blue-600`
                  } ${cardBg}`}
                >
                  {/* Card header */}
                  <div
                    className={`px-5 pt-5 pb-4 ${
                      isPopular
                        ? "bg-gradient-to-br from-blue-600 to-blue-700"
                        : isDark
                          ? "bg-gradient-to-br from-gray-700/80 to-gray-800"
                          : "bg-gradient-to-br from-slate-50 to-blue-50/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-lg font-bold leading-tight truncate ${
                            isPopular ? "text-white" : textColor
                          }`}
                        >
                          {plan.name}
                        </h3>
                        {plan.description && (
                          <p
                            className={`text-sm mt-1 line-clamp-2 ${
                              isPopular ? "text-blue-100" : textSecondary
                            }`}
                          >
                            {plan.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                            isActive
                              ? isPopular
                                ? "bg-white/20 text-white"
                                : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                              : isPopular
                                ? "bg-white/20 text-white/90"
                                : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {plan.status || "Active"}
                        </span>
                        {isPopular && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-extrabold tracking-tight ${isPopular ? "text-white" : textColor}`}>
                        ₹{plan.price}
                      </span>
                      <span className={`text-sm font-medium ${isPopular ? "text-blue-100" : textSecondary}`}>
                        / {plan.validity_days}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 px-5 py-4">
                    <div
                      className={`rounded-xl p-3.5 mb-4 flex-1 ${
                        isDark ? "bg-gray-900/40" : "bg-slate-50"
                      } border ${isDark ? "border-gray-700/60" : "border-slate-100"}`}
                    >
                      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${textSecondary}`}>
                        Features
                      </h4>
                      <ul
                        className={`space-y-2 max-h-36 overflow-y-auto pr-1 ${scrollHide}`}
                      >
                        {features.length > 0 ? (
                          features.map((feature, index) => (
                            <li key={index} className={`text-sm ${textColor} flex items-start gap-2 leading-snug`}>
                              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                                <Check size={10} className="text-blue-600 dark:text-blue-400" strokeWidth={3} />
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className={`text-sm italic ${textSecondary}`}>No features listed</li>
                        )}
                      </ul>
                    </div>

                    <div
                      className={`flex items-center justify-between gap-2 mb-4 py-2.5 px-3 rounded-lg ${
                        isDark ? "bg-gray-700/30" : "bg-blue-50/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={15} className="text-blue-600 dark:text-blue-400" />
                        <span className={textSecondary}>Subscribers</span>
                      </div>
                      <span className={`text-sm font-bold ${textColor}`}>
                        {plan.userCount ?? plan.subscriber_count ?? 0}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-auto pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(plan)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${btnPrimary}`}
                      >
                        <Edit size={15} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(plan)}
                        className={`px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                          isActive
                            ? "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-400 dark:hover:bg-blue-500/10"
                            : `${borderColor} ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700`
                        }`}
                        title="Toggle status"
                      >
                        <Power size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan)}
                        className="px-3 py-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/25 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showModal && currentPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${cardBg} rounded-xl max-w-2xl w-full shadow-2xl border ${borderColor} my-8`}>
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h2 className={`text-2xl font-bold ${textColor}`}>
                {isEditing ? "Edit" : "Create"} {PLAN_TABS[activeTab].label.replace(" Plans", " Plan")}
              </h2>
              <button type="button" onClick={handleCloseModal} className={`p-2 rounded-lg ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>Plan name *</label>
                <input
                  type="text"
                  name="name"
                  value={currentPlan.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`}
                  placeholder="e.g. Basic"
                />
              </div>

              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={currentPlan.description || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
                  placeholder="Short description for this plan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-semibold ${textColor} mb-2 block`}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={currentPlan.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-semibold ${textColor} mb-2 block`}>Duration *</label>
                  <input
                    type="text"
                    name="validity_days"
                    value={currentPlan.validity_days}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`}
                    placeholder="monthly, yearly, 3 Month, Per Job Post"
                  />
                </div>
              </div>

              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>Features (one per line)</label>
                <textarea
                  name="features"
                  rows={6}
                  value={Array.isArray(currentPlan.features) ? currentPlan.features.join("\n") : ""}
                  onChange={handleFeaturesChange}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-semibold ${textColor} mb-2 block`}>Status</label>
                  <select
                    name="status"
                    value={currentPlan.status}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className={`flex items-center gap-2 text-sm font-medium ${textColor} cursor-pointer`}>
                    <input
                      type="checkbox"
                      name="popular"
                      checked={Boolean(currentPlan.popular)}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    Mark as popular
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 px-6 py-3 border ${borderColor} rounded-lg font-medium ${textColor}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium disabled:opacity-50 ${btnPrimary}`}
                >
                  {saving ? "Saving..." : isEditing ? "Save changes" : "Create plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
