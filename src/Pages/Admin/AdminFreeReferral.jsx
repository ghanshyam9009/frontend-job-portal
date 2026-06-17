import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
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
  BadgeCheck,
  Loader2,
  Shield,
} from "lucide-react";
import adminStudentService from "../../services/adminStudentService";
import adminPlanService, { normalizePlansList } from "../../services/adminPlanService";

const MANUAL_PLAN_TOKEN_KEY = "manual_plan_verification";

const matchesGenderExactly = (userGender, filterGender) => {
  if (!filterGender) return true;
  return (userGender || "").trim().toLowerCase() === filterGender.trim().toLowerCase();
};

const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  return err.error || err.message || fallback;
};

const saveVerificationToken = (token, expiresInMinutes = 15) => {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  sessionStorage.setItem(
    MANUAL_PLAN_TOKEN_KEY,
    JSON.stringify({ token, expiresAt, expiresInMinutes })
  );
};

const loadVerificationToken = () => {
  try {
    const raw = sessionStorage.getItem(MANUAL_PLAN_TOKEN_KEY);
    if (!raw) return { token: null, expiresAt: null };
    const parsed = JSON.parse(raw);
    if (!parsed?.token || Date.now() >= parsed.expiresAt) {
      sessionStorage.removeItem(MANUAL_PLAN_TOKEN_KEY);
      return { token: null, expiresAt: null };
    }
    return { token: parsed.token, expiresAt: parsed.expiresAt };
  } catch {
    sessionStorage.removeItem(MANUAL_PLAN_TOKEN_KEY);
    return { token: null, expiresAt: null };
  }
};

const clearVerificationToken = () => {
  sessionStorage.removeItem(MANUAL_PLAN_TOKEN_KEY);
};

const AdminFreeReferral = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const adminEmail = user?.email || "";
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

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [modalError, setModalError] = useState("");

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
    const { token, expiresAt } = loadVerificationToken();
    if (token) {
      setVerificationToken(token);
      setTokenExpiresAt(expiresAt);
    }
  }, []);

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
    setOtp("");
    setOtpSent(false);
    setModalError("");
    setShowModal(true);
    setMessage({ type: "", text: "" });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedPlan("");
    setOtp("");
    setOtpSent(false);
    setModalError("");
  };

  const isAdminVerified = Boolean(verificationToken);

  const handleSendOtp = async () => {
    if (!adminEmail) {
      setModalError("Admin email not found. Please log in again.");
      return;
    }
    if (sendingOtp) return;

    setSendingOtp(true);
    setModalError("");
    try {
      await adminStudentService.sendManualPlanOtp(adminEmail);
      setOtpSent(true);
      setOtp("");
    } catch (err) {
      console.error(err);
      setModalError(getErrorMessage(err, "Failed to send OTP. Please try again."));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!adminEmail) {
      setModalError("Admin email not found. Please log in again.");
      return;
    }
    if (!otp || otp.length < 4) {
      setModalError("Please enter a valid 6-digit OTP.");
      return;
    }
    if (verifyingOtp) return;

    setVerifyingOtp(true);
    setModalError("");
    try {
      const response = await adminStudentService.verifyManualPlanOtp(adminEmail, otp);
      const token = response.verification_token;
      const expiresIn = response.expires_in_minutes ?? 15;

      if (!token) {
        setModalError("Verification failed. No token received.");
        return;
      }

      saveVerificationToken(token, expiresIn);
      const { expiresAt } = loadVerificationToken();
      setVerificationToken(token);
      setTokenExpiresAt(expiresAt);
      setOtpSent(false);
      setOtp("");
    } catch (err) {
      console.error(err);
      setModalError(getErrorMessage(err, "Invalid OTP. Please try again."));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleClearVerification = () => {
    clearVerificationToken();
    setVerificationToken(null);
    setTokenExpiresAt(null);
    setOtp("");
    setOtpSent(false);
  };

  const handleUpgradePlan = async (e) => {
    e.preventDefault();
    if (!selectedUser?.email || !selectedPlan) return;

    if (!verificationToken) {
      setModalError("Please verify admin OTP before upgrading the plan.");
      return;
    }

    if (!adminEmail) {
      setModalError("Admin email not found. Please log in again.");
      return;
    }

    setUpgrading(true);
    setModalError("");
    try {
      await adminStudentService.updateManualPlan({
        email: selectedUser.email,
        is_manual_plan: selectedPlan,
        admin_email: adminEmail,
        verification_token: verificationToken,
      });
      setMessage({
        type: "success",
        text: `Plan upgraded successfully for ${selectedUser.email}`,
      });
      handleCloseModal();
      await fetchUsers(currentPage);
    } catch (err) {
      console.error(err);
      const errMsg = getErrorMessage(err, "Failed to upgrade plan. Please try again.");
      if (err?.status === 403 || String(errMsg).toLowerCase().includes("403") || String(errMsg).toLowerCase().includes("verify")) {
        handleClearVerification();
        setModalError("Verification expired or invalid. Please verify OTP again.");
      } else {
        setModalError(errMsg);
      }
    } finally {
      setUpgrading(false);
    }
  };

  const formatTokenExpiry = () => {
    if (!tokenExpiresAt) return "";
    const minsLeft = Math.max(0, Math.ceil((tokenExpiresAt - Date.now()) / 60000));
    return `${minsLeft} min left`;
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-plan-title"
        >
          <button
            type="button"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close modal"
            onClick={handleCloseModal}
          />

          <div
            className={`relative ${cardBg} rounded-xl w-full max-w-lg max-h-[calc(100vh-1.5rem)] flex flex-col shadow-2xl border ${borderColor} my-auto`}
          >
            <div className={`flex items-center justify-between px-5 py-4 border-b ${borderColor} shrink-0`}>
              <h2 id="upgrade-plan-title" className={`text-lg font-bold ${textColor}`}>
                Upgrade Plan
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className={`p-2 rounded-lg ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpgradePlan} className="flex flex-col min-h-0 flex-1">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {modalError && (
                  <div className="rounded-lg p-3 flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{modalError}</p>
                  </div>
                )}

                <div className={`flex items-center gap-3 px-4 py-3 border ${borderColor} rounded-lg ${isDark ? "bg-gray-900/40" : "bg-gray-50"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${isDark ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                    {(selectedUser.full_name || selectedUser.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${textColor} truncate`}>
                      {selectedUser.full_name || "—"}
                    </p>
                    <p className={`text-xs ${textSecondary} truncate`}>{selectedUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-semibold ${textColor} mb-2 block`}>
                    Candidate Plan *
                  </label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    required
                    className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
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

                <div className={`rounded-lg border ${borderColor} p-4 space-y-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Shield size={18} className="text-blue-600 shrink-0" />
                      <span className={`text-sm font-semibold ${textColor}`}>Admin OTP Verification</span>
                    </div>
                    {isAdminVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                        <BadgeCheck size={14} />
                        Verified · {formatTokenExpiry()}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={`text-xs font-medium ${textSecondary} mb-1 block`}>Admin Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      readOnly
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${isDark ? "bg-gray-900/40" : "bg-gray-50"} ${textColor}`}
                    />
                  </div>

                  {!isAdminVerified ? (
                    <>
                      <p className={`text-xs leading-relaxed ${textSecondary}`}>
                        OTP will be sent to your verified admin email (valid for 10 minutes).
                      </p>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !adminEmail || otpSent}
                        className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 ${btnPrimary}`}
                      >
                        {sendingOtp ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Sending OTP...
                          </span>
                        ) : otpSent ? (
                          "OTP Sent"
                        ) : (
                          "Send OTP"
                        )}
                      </button>

                      {otpSent && (
                        <div className="space-y-2">
                          <label className={`text-xs font-medium ${textSecondary}`}>Enter 6-digit OTP</label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="123456"
                              maxLength={6}
                              className={`flex-1 min-w-0 px-3 py-2 border ${borderColor} rounded-lg text-sm tracking-widest ${cardBg} ${textColor}`}
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp || otp.length < 4}
                              className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shrink-0 ${btnPrimary}`}
                            >
                              {verifyingOtp ? "Verifying..." : "Verify"}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className={`text-xs ${textSecondary} hover:underline disabled:opacity-50`}
                          >
                            Resend OTP
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClearVerification}
                      className={`text-xs ${textSecondary} hover:underline`}
                    >
                      Re-verify with new OTP
                    </button>
                  )}
                </div>
              </div>

              <div className={`flex gap-3 px-5 py-4 border-t ${borderColor} shrink-0 bg-inherit`}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 px-4 py-2.5 border ${borderColor} rounded-lg text-sm font-medium ${textColor}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upgrading || !selectedPlan || !isAdminVerified}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 ${btnPrimary}`}
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
