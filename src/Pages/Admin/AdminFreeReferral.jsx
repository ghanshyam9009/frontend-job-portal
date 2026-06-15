import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import {
  Gift,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpCircle,
  Mail,
  User,
} from "lucide-react";
import adminStudentService from "../../services/adminStudentService";
import adminPlanService, { normalizePlansList } from "../../services/adminPlanService";

const matchesGenderExactly = (userGender, filterGender) => {
  if (!filterGender) return true;
  return (userGender || "").trim().toLowerCase() === filterGender.trim().toLowerCase();
};

const AdminFreeReferral = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
    showing: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    email: "",
    full_name: "",
    gender: "",
  });
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [candidatePlans, setCandidatePlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/40";

  const fetchCandidatePlans = useCallback(async () => {
    try {
      const response = await adminPlanService.getAllPlans("candidate");
      const plans = normalizePlansList(response).filter(
        (p) => (p.status || "Active") === "Active"
      );
      setCandidatePlans(plans);
    } catch (err) {
      console.error(err);
      setCandidatePlans([]);
    }
  }, []);

  const fetchUsers = useCallback(async (page = currentPage) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        sort: sortBy,
      };
      if (appliedFilters.email) params.email = appliedFilters.email;
      if (appliedFilters.full_name) params.full_name = appliedFilters.full_name;
      if (appliedFilters.gender) params.gender = appliedFilters.gender;

      const response = await adminStudentService.getUsers(params);
      const rawUsers = response.users || [];
      const filteredUsers = appliedFilters.gender
        ? rawUsers.filter((user) => matchesGenderExactly(user.gender, appliedFilters.gender))
        : rawUsers;

      setUsers(filteredUsers);
      setMeta({
        page: response.page ?? page,
        limit: response.limit ?? 20,
        total: response.total ?? 0,
        total_pages: response.total_pages ?? 1,
        showing: filteredUsers.length,
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load users. Please try again.");
      setUsers([]);
      setMeta({ page: 1, limit: 20, total: 0, total_pages: 1, showing: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, appliedFilters, sortBy]);

  useEffect(() => {
    fetchCandidatePlans();
  }, [fetchCandidatePlans]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedFilters({
      email: emailFilter.trim(),
      full_name: nameFilter.trim(),
      gender: genderFilter.trim(),
    });
    setCurrentPage(1);
  };

  const handleOpenUpgradeModal = (user) => {
    setSelectedUser(user);
    setSelectedPlan("");
    setShowModal(true);
    setMessage({ type: "", text: "" });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedPlan("");
  };

  const handleUpgradePlan = async (e) => {
    e.preventDefault();
    if (!selectedUser?.email || !selectedPlan) return;

    setUpgrading(true);
    setError(null);
    try {
      await adminStudentService.updateManualPlan(selectedUser.email, selectedPlan);
      setMessage({
        type: "success",
        text: `Plan upgraded successfully for ${selectedUser.email}`,
      });
      handleCloseModal();
      await fetchUsers(currentPage);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to upgrade plan. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const isActive = (status || "").toLowerCase() === "active";
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          isActive
            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
            : "bg-gray-100 text-gray-600 dark:bg-gray-600/30 dark:text-gray-300"
        }`}
      >
        {status || "—"}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor} flex items-center gap-2`}>
                <Gift className="text-blue-600" size={28} />
                Free Referral
              </h1>
              <p className={`text-sm ${textSecondary} mt-1`}>
                Manage candidate manual plan upgrades via referral
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchUsers(currentPage)}
              disabled={isLoading}
              className={`px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm disabled:opacity-50 ${btnPrimary}`}
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {message.text && (
          <div
            className={`mb-6 rounded-lg p-4 flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Filter by name..."
                className={`w-full pl-9 pr-3 py-2.5 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
              />
            </div>
            <div className="relative">
              <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
              <input
                type="text"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="Filter by email..."
                className={`w-full pl-9 pr-3 py-2.5 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
              />
            </div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className={`px-3 py-2.5 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ArrowUpDown size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <button
                type="submit"
                className={`px-4 py-2.5 rounded-lg text-sm font-medium ${btnPrimary}`}
              >
                Search
              </button>
            </div>
          </div>
        </form>

        <p className={`text-sm ${textSecondary} mb-4`}>
          Showing <span className={`font-semibold ${textColor}`}>{meta.showing}</span> of{" "}
          <span className={`font-semibold ${textColor}`}>{meta.total}</span> users
          {meta.total_pages > 1 && (
            <span>
              {" "}
              · Page {meta.page} of {meta.total_pages}
            </span>
          )}
        </p>

        <div className={`${cardBg} rounded-lg border ${borderColor} overflow-hidden`}>
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <User size={40} className="text-blue-600 mx-auto mb-4" />
              <h3 className={`text-lg font-bold ${textColor} mb-2`}>No users found</h3>
              <p className={textSecondary}>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={`${isDark ? "bg-gray-700/50" : "bg-gray-50"} border-b ${borderColor}`}>
                  <tr>
                    <th className={`text-left px-4 py-3 font-semibold ${textSecondary}`}>Name</th>
                    <th className={`text-left px-4 py-3 font-semibold ${textSecondary}`}>Email</th>
                    <th className={`text-left px-4 py-3 font-semibold ${textSecondary} hidden sm:table-cell`}>Gender</th>
                    <th className={`text-left px-4 py-3 font-semibold ${textSecondary} hidden md:table-cell`}>Role</th>
                    <th className={`text-left px-4 py-3 font-semibold ${textSecondary}`}>Status</th>
                    <th className={`text-left px-4 py-3 font-semibold ${textSecondary} hidden lg:table-cell`}>Joined</th>
                    <th className={`text-right px-4 py-3 font-semibold ${textSecondary}`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.user_id || user.email}
                      className={`border-b ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors`}
                    >
                      <td className={`px-4 py-3 font-medium ${textColor}`}>
                        {user.full_name || "—"}
                      </td>
                      <td className={`px-4 py-3 ${textSecondary}`}>{user.email || "—"}</td>
                      <td className={`px-4 py-3 ${textSecondary} hidden sm:table-cell capitalize`}>
                        {user.gender || "—"}
                      </td>
                      <td className={`px-4 py-3 ${textSecondary} hidden md:table-cell capitalize`}>
                        {user.role || "—"}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                      <td className={`px-4 py-3 ${textSecondary} hidden lg:table-cell`}>
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenUpgradeModal(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${btnPrimary}`}
                        >
                          <ArrowUpCircle size={14} />
                          Upgrade Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {meta.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium disabled:opacity-50 ${textColor}`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className={`text-sm ${textSecondary}`}>
              Page {currentPage} of {meta.total_pages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(meta.total_pages, p + 1))}
              disabled={currentPage >= meta.total_pages || isLoading}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium disabled:opacity-50 ${textColor}`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-xl max-w-md w-full shadow-2xl border ${borderColor}`}>
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h2 className={`text-xl font-bold ${textColor}`}>Upgrade Plan</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className={`p-2 rounded-lg ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpgradePlan} className="p-6 space-y-4">
              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>User</label>
                <div className={`px-4 py-3 border ${borderColor} rounded-lg ${isDark ? "bg-gray-900/40" : "bg-gray-50"}`}>
                  <p className={`text-sm font-medium ${textColor}`}>{selectedUser.full_name || "—"}</p>
                  <p className={`text-xs ${textSecondary} mt-0.5`}>{selectedUser.email}</p>
                </div>
              </div>

              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  readOnly
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg text-sm ${isDark ? "bg-gray-900/40" : "bg-gray-50"} ${textColor}`}
                />
              </div>

              <div>
                <label className={`text-sm font-semibold ${textColor} mb-2 block`}>
                  Candidate Plan *
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  required
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
                >
                  <option value="">Select a plan</option>
                  {candidatePlans.map((plan) => (
                    <option key={plan.plan_id || plan.id || plan.name} value={plan.name}>
                      {plan.name}
                      {plan.price != null ? ` — ₹${plan.price}` : ""}
                    </option>
                  ))}
                </select>
                {candidatePlans.length === 0 && (
                  <p className={`text-xs mt-1 ${textSecondary}`}>
                    No active candidate plans found. Add plans from the Plans page.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 px-4 py-3 border ${borderColor} rounded-lg font-medium ${textColor}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upgrading || !selectedPlan}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium disabled:opacity-50 ${btnPrimary}`}
                >
                  {upgrading ? "Upgrading..." : "Upgrade Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFreeReferral;
