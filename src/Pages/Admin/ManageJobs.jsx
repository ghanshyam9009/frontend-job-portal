import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import {
  Check, Eye, Edit, X, Search, FileText, Star, Building,
  Calendar, Clock, Briefcase, Mail, Phone, ExternalLink,
  Plus, Trash2, RefreshCw, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, ArrowUpDown
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EMPTY_JOB_DATA = {
  job_title: "",
  company_name: "",
  location: "",
  employment_type: "Full-Time",
  work_mode: "On-site",
  salary_range: { min: "", max: "", currency: "INR" },
  experience_required: { min_years: "", max_years: "" },
  skills_required: [],
  description: "",
  responsibilities: "",
  qualifications: "",
  application_deadline: "",
  contact_email: "",
  contact_number: "",
  job_status: "open",
};

// ---------------------------------------------------------------------------
// Helper — extract contact_number from however the API names it
// ---------------------------------------------------------------------------
const extractContactNumber = (job) =>
  job.contact_number ??
  job.phone_number ??
  job.phone ??
  job.mobile ??
  job.contact_phone ??
  "";

// ---------------------------------------------------------------------------
// Helper — map raw API job object → our local form shape
// ---------------------------------------------------------------------------
const mapJobToForm = (job) => ({
  job_title:        job.job_title        || "",
  company_name:     job.company_name     || "",
  location:         job.location         || "",
  employment_type:  job.employment_type  || "Full-Time",
  work_mode:        job.work_mode        || "On-site",
  salary_range: {
    min:      job.salary_range?.min  != null ? String(job.salary_range.min)  : "",
    max:      job.salary_range?.max  != null ? String(job.salary_range.max)  : "",
    currency: job.salary_range?.currency || "INR",
  },
  experience_required: {
    min_years: job.experience_required?.min_years != null ? String(job.experience_required.min_years) : "",
    max_years: job.experience_required?.max_years != null ? String(job.experience_required.max_years) : "",
  },
  skills_required: Array.isArray(job.skills_required) ? job.skills_required : [],
  description:     job.description || "",
  responsibilities: Array.isArray(job.responsibilities)
    ? job.responsibilities.join("\n")
    : (job.responsibilities || ""),
  qualifications: Array.isArray(job.qualifications)
    ? job.qualifications.join("\n")
    : (job.qualifications || ""),
  application_deadline: job.application_deadline || "",
  contact_email:   job.contact_email || job.email || "",
  // KEY FIX: try every possible field name the API might use
  contact_number:  extractContactNumber(job),
  job_status:      job.job_status || "open",
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ManageJobs = () => {
  const { theme } = useTheme();

  // list state
  const [jobs,         setJobs]         = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter,   setDateFilter]   = useState("all");
  const [sortBy,       setSortBy]       = useState("newest");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [hiddenJobs,   setHiddenJobs]   = useState(new Set());

  const [premiumOverrides, setPremiumOverrides] = useState(() => {
    try {
      const stored = localStorage.getItem("jobPremiumOverrides");
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  // modal / edit state
  const [editingTask,     setEditingTask]     = useState(null);
  const [recruiterDetails,setRecruiterDetails]= useState(null);
  const [applicantDetails,setApplicantDetails]= useState(null);
  const [loadingJobEdit,  setLoadingJobEdit]  = useState(false);
  const [jobData,         setJobData]         = useState(EMPTY_JOB_DATA);
  const [newSkill,        setNewSkill]        = useState("");

  // KEY FIX: track which job is currently loaded in the form so we never
  // re-run fetchEditData (and never call setJobData(EMPTY_JOB_DATA)) while
  // the user is actively editing a field like contact_number.
  const loadedJobKeyRef = useRef(null);

  const jobsPerPage = 25;

  // API caches (refs — no re-render side-effects)
  const recruiterCacheRef = useRef({});
  const jobDataCacheRef   = useRef({});

  // fetch job list
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getPendingJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to fetch jobs. Please try again.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // date filter
  const filterJobsByDate = (list, filter) => {
    if (filter === "all") return list;
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return list.filter(job => {
      const d     = new Date(job.posted_date);
      const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      switch (filter) {
        case "today":     return dOnly.getTime() === today.getTime();
        case "yesterday": { const y = new Date(today); y.setDate(y.getDate()-1); return dOnly.getTime()===y.getTime(); }
        case "last7days":  { const w=new Date(today); w.setDate(w.getDate()-7);  return dOnly>=w; }
        case "last30days": { const m=new Date(today); m.setDate(m.getDate()-30); return dOnly>=m; }
        case "thisMonth":  return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
        case "lastMonth":  { const lm=new Date(now.getFullYear(),now.getMonth()-1,1); return d.getMonth()===lm.getMonth()&&d.getFullYear()===lm.getFullYear(); }
        default: return true;
      }
    });
  };

  // sort
  const sortJobs = (list, key) => {
    const s=[...list];
    switch(key){
      case "newest":       s.sort((a,b)=>new Date(b.posted_date||0)-new Date(a.posted_date||0)); break;
      case "oldest":       s.sort((a,b)=>new Date(a.posted_date||0)-new Date(b.posted_date||0)); break;
      case "updated":      s.sort((a,b)=>new Date(b.updated_date||0)-new Date(a.updated_date||0)); break;
      case "company_asc":  s.sort((a,b)=>(a.company_name||"").localeCompare(b.company_name||"")); break;
      case "company_desc": s.sort((a,b)=>(b.company_name||"").localeCompare(a.company_name||"")); break;
      default: break;
    }
    return s;
  };

  // group tasks into jobs
  const groupTasks = useCallback((rawJobs) => {
    const map = {};
    rawJobs.forEach(task => {
      const jobId = task.job_id || `no-job-${task.id}`;
      if (!map[jobId]) {
        map[jobId] = {
          id: task.id, job_id: jobId,
          company_name: task.company_name || "N/A",
          title:        task.title || task.category,
          posted_date:  task.posted_date,
          updated_date: task.updated_date,
          is_premium:   premiumOverrides[task.job_id] !== undefined
                          ? premiumOverrides[task.job_id]
                          : (task.is_premium || task.premium_job || false),
          tasks: [],
        };
      }
      map[jobId].tasks.push(task);
    });
    return Object.values(map);
  }, [premiumOverrides]);

  useEffect(() => {
    let list = groupTasks(Array.isArray(jobs) ? jobs : []);
    list = list.filter(j => !hiddenJobs.has(j.job_id));
    if (statusFilter !== "all") list = list.filter(j=>j.tasks.some(t=>t.status===statusFilter));
    if (searchTerm) list = list.filter(j=>
      j.title?.toLowerCase().includes(searchTerm.toLowerCase())||
      j.company_name?.toLowerCase().includes(searchTerm.toLowerCase())||
      j.job_id?.toLowerCase().includes(searchTerm.toLowerCase()));
    list = filterJobsByDate(list, dateFilter);
    list = sortJobs(list, sortBy);
    setFilteredJobs(list);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, sortBy, jobs, premiumOverrides, hiddenJobs, groupTasks]);

  // ── KEY FIX: Load edit data ────────────────────────────────────────────────
  // We use a stable string key (task_id + job_id + category) to decide whether
  // to fetch. If the key hasn't changed the effect exits immediately WITHOUT
  // calling setJobData(EMPTY_JOB_DATA) — this is what prevented contact_number
  // (and other typed values) from being wiped mid-edit.
  useEffect(() => {
    if (!editingTask) {
      // Modal closed — full reset
      loadedJobKeyRef.current = null;
      setJobData(EMPTY_JOB_DATA);
      setRecruiterDetails(null);
      setApplicantDetails(null);
      return;
    }

    const stableKey = `${editingTask.task_id}_${editingTask.job_id}_${editingTask.category}`;

    // Already loaded this exact job — do nothing, preserve user's edits
    if (loadedJobKeyRef.current === stableKey) return;

    const fetchEditData = async () => {
      setLoadingJobEdit(true);
      // Reset only when switching to a different job
      setJobData(EMPTY_JOB_DATA);
      setRecruiterDetails(null);
      setApplicantDetails(null);

      try {
        // Recruiter info
        if (editingTask.recruiter_id) {
          let rec = recruiterCacheRef.current[editingTask.recruiter_id];
          if (!rec) {
            rec = await recruiterExternalService.getRecruiterCompanyName(editingTask.recruiter_id);
            recruiterCacheRef.current[editingTask.recruiter_id] = rec;
          }
          setRecruiterDetails(rec);
        }

        // Job edit / view
        if (["editjob","postnewjob","viewjob"].includes(editingTask.category)) {
          if (!editingTask.job_id || !editingTask.recruiter_id) {
            console.warn("Missing job_id or recruiter_id:", editingTask);
            return;
          }

          let jobsData;
          try {
            // Always fetch fresh — never rely on stale cache for edit
            jobsData = await recruiterExternalService.getAllPostedJobs(editingTask.recruiter_id);
            jobDataCacheRef.current[editingTask.recruiter_id] = jobsData;
          } catch (err) {
            console.error("getAllPostedJobs failed:", err);
            throw err;
          }

          // API may return { jobs: [...] } OR just [...]
          const jobsArray = Array.isArray(jobsData)
            ? jobsData
            : Array.isArray(jobsData?.jobs) ? jobsData.jobs : [];

          console.log("Jobs returned:", jobsArray.length, "| Looking for:", editingTask.job_id);

          const job = jobsArray.find(j => j.job_id === editingTask.job_id);
          console.log("Matched job:", job);
          console.log("contact_number from API:", extractContactNumber(job || {}));

          if (!job) {
            alert("Job not found in API response. Check console for details.");
            setEditingTask(null);
            return;
          }

          const mapped = mapJobToForm(job);
          console.log("Mapped form data:", mapped);
          setJobData(mapped);

          // Mark as loaded — future renders won't re-fetch and won't wipe edits
          loadedJobKeyRef.current = stableKey;
          return;
        }

        // Application view
        if (["newapplication","change status of application"].includes(editingTask.category)) {
          setApplicantDetails({
            job_id:        editingTask.job_id,
            recruiter_id:  editingTask.recruiter_id,
            task_category: editingTask.category,
            task_id:       editingTask.task_id,
          });

          if (editingTask.recruiter_id) {
            let detailed = null;
            try {
              const basic = await recruiterExternalService.getRecruiterCompanyName(editingTask.recruiter_id);
              if (basic?.email) {
                const url = `https://4x10ubol84.execute-api.ap-southeast-1.amazonaws.com/default/getepmloyerdetailed?email=${encodeURIComponent(basic.email)}`;
                const res = await fetch(url, { headers: {"Content-Type":"application/json"} });
                if (res.ok) detailed = await res.json();
              }
            } catch(err) { console.warn("Detailed recruiter fetch failed:", err); }

            if (detailed) {
              setApplicantDetails(prev => ({
                ...prev,
                recruiter_name:      detailed.full_name||detailed.name||"Not available",
                company_name:        detailed.company_name||"Not available",
                email:               detailed.email||"Not available",
                phone:               detailed.phone_number||detailed.phone||"Not available",
                industry:            detailed.industry||"Not available",
                company_size:        detailed.company_size||"Not available",
                location:            detailed.location||"Not available",
                kyc_status:          detailed.kyc_status||"Not verified",
                approval_status:     detailed.hasadminapproved?"Approved":"Pending",
                registration_date:   detailed.created_at||detailed.registration_date||"",
                website:             detailed.company_website||detailed.website||"",
                company_logo:        detailed.company_logo||null,
                kyc_doc_url:         detailed.kycDocUrl||null,
                kyc_document_number: detailed.kyc_document_number||"",
                kyc_type:            detailed.kyc_type||"",
                founded_year:        detailed.founded_year||"",
              }));
            }
          }
          loadedJobKeyRef.current = stableKey;
        }
      } catch(err) {
        console.error("fetchEditData error:", err);
        alert("Failed to load data. Please try again.");
        setEditingTask(null);
      } finally {
        setLoadingJobEdit(false);
      }
    };

    fetchEditData();
  }, [editingTask]);

  // input change — straightforward, updates only the named field
  const handleInputChange = (field, value) => {
    const keys = field.split(".");
    if (keys.length > 1) {
      setJobData(prev => ({ ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } }));
    } else {
      setJobData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddSkill = () => {
    const s = newSkill.trim();
    if (s && !jobData.skills_required.includes(s)) {
      setJobData(prev => ({ ...prev, skills_required: [...prev.skills_required, s] }));
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (s) =>
    setJobData(prev => ({ ...prev, skills_required: prev.skills_required.filter(x=>x!==s) }));

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}) : "N/A";

  // approve / reject
  const handleApproveTask = async (task) => {
    try {
      setLoading(true);
      let result;
      switch(task.category){
        case "postnewjob":                   result=await adminService.approveJob(task.task_id); break;
        case "editjob":                      result=await adminService.approveEditedJob(task.task_id); break;
        case "closedjob":                    result=await adminService.approveJobClosing(task.task_id); break;
        case "newapplication":               result=await adminService.approveJobApplicationByStudent(task.task_id); break;
        case "change status of application": result=await adminService.approveApplicationStatusChanged(task.task_id); break;
        default: throw new Error("Unknown category");
      }
      alert(`Approved: ${result?.message||"Success"}`);
      setHiddenJobs(prev=>new Set([...prev, task.job_id||`no-job-${task.id}`]));
    } catch(err){ console.error(err); alert("Failed to approve."); }
    finally { setLoading(false); }
  };

  const handleRejectTask = async (task) => {
    try {
      setLoading(true);
      const result = await adminService.rejectJob(task.task_id);
      alert(`Rejected: ${result?.message||"Success"}`);
      setHiddenJobs(prev=>new Set([...prev, task.job_id||`no-job-${task.id}`]));
    } catch(err){ console.error(err); alert("Failed to reject."); }
    finally { setLoading(false); }
  };

  // submit edit
  const handleEditJobSubmit = async (e) => {
    e.preventDefault();
    if (!editingTask?.job_id||!editingTask?.recruiter_id) {
      alert("Missing job or recruiter information."); return;
    }
    try {
      setLoadingJobEdit(true);

      // Build payload — send contact_number under ALL common field name variants
      // so the backend accepts it regardless of which name it expects
      const payload = {
        ...jobData,
        employer_id:    editingTask.recruiter_id,
        contact_number: jobData.contact_number,
        phone_number:   jobData.contact_number,
        phone:          jobData.contact_number,
        mobile:         jobData.contact_number,
        contact_email:  jobData.contact_email,
        email:          jobData.contact_email,
        responsibilities: typeof jobData.responsibilities==="string"
          ? jobData.responsibilities.split("\n").filter(r=>r.trim())
          : jobData.responsibilities,
        qualifications: typeof jobData.qualifications==="string"
          ? jobData.qualifications.split("\n").filter(q=>q.trim())
          : jobData.qualifications,
        salary_range: {
          ...jobData.salary_range,
          min: jobData.salary_range.min!==""?Number(jobData.salary_range.min):null,
          max: jobData.salary_range.max!==""?Number(jobData.salary_range.max):null,
        },
        experience_required: {
          min_years: jobData.experience_required.min_years!==""?Number(jobData.experience_required.min_years):null,
          max_years: jobData.experience_required.max_years!==""?Number(jobData.experience_required.max_years):null,
        },
      };

      console.log("Submitting payload:", payload);
      console.log("contact_number being sent:", payload.contact_number);

      await recruiterExternalService.updateJob(editingTask.job_id, payload);
      alert("Job updated successfully!");

      // Invalidate cache
      delete jobDataCacheRef.current[editingTask.recruiter_id];
      loadedJobKeyRef.current = null;

      setEditingTask(null);
      await fetchJobs();
    } catch(err) {
      console.error("Update failed:", err);
      alert(`Failed to update: ${err?.message||"Please try again."}`);
    } finally { setLoadingJobEdit(false); }
  };

  // premium toggle
  const handleMarkJobPremium = async (task, isPremium) => {
    if (!task.job_id) { alert("Job ID not found."); return; }
    try {
      setLoading(true);
      const result = await adminService.markJobPremium(task.job_id, isPremium, "job");
      alert(`${isPremium?"Marked":"Removed"} premium: ${result?.message||"Success"}`);
      const overrides = {...premiumOverrides,[task.job_id]:isPremium};
      setPremiumOverrides(overrides);
      localStorage.setItem("jobPremiumOverrides", JSON.stringify(overrides));
    } catch(err){ console.error(err); alert("Failed to update premium status."); }
    finally { setLoading(false); }
  };

  // pagination
  const safeFilteredJobs = Array.isArray(filteredJobs)?filteredJobs:[];
  const totalPages  = Math.ceil(safeFilteredJobs.length/jobsPerPage);
  const currentJobs = safeFilteredJobs.slice((currentPage-1)*jobsPerPage, currentPage*jobsPerPage);

  const allGrouped      = React.useMemo(()=>groupTasks(Array.isArray(jobs)?jobs:[]).filter(j=>!hiddenJobs.has(j.job_id)),[jobs,hiddenJobs,groupTasks]);
  const totalJobsCount  = allGrouped.length;
  const pendingJobsCount= allGrouped.filter(j=>j.tasks?.some(t=>t.status==="pending")).length;
  const fulfilledJobsCount=allGrouped.filter(j=>j.tasks?.some(t=>t.status==="fulfilled")).length;

  // theme
  const isDark        = theme==="dark";
  const bgColor       = isDark?"bg-gray-900":"bg-gray-50";
  const cardBg        = isDark?"bg-gray-800":"bg-white";
  const textColor     = isDark?"text-white":"text-gray-900";
  const textSecondary = isDark?"text-gray-400":"text-gray-600";
  const borderColor   = isDark?"border-gray-700":"border-gray-200";
  const inputCls      = `w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`;
  const readonlyCls   = `w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${textColor} ${isDark?"bg-gray-700/50":"bg-gray-50"}`;

  if (loading) return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
      <div className="text-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><Briefcase className="text-blue-500" size={24}/></div>
        </div>
        <h3 className={`text-lg font-bold ${textColor}`}>Loading jobs…</h3>
        <p className={`${textSecondary} mt-2`}>Please wait</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
      <div className={`${cardBg} rounded-lg border ${borderColor} p-8 max-w-md w-full text-center`}>
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-red-500" size={32}/>
        </div>
        <h2 className={`text-xl font-bold ${textColor} mb-2`}>Error Loading Jobs</h2>
        <p className={`${textSecondary} mb-6`}>{error}</p>
        <button onClick={fetchJobs} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 mx-auto">
          <RefreshCw size={16}/> Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgColor}`}>

      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor} flex items-center gap-2`}>
                  <Briefcase className="text-blue-500" size={28}/> Manage Jobs
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>View and manage all pending jobs requiring approval</p>
              </div>
              <button onClick={fetchJobs} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 text-sm">
                <RefreshCw size={16}/><span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className={`px-4 py-2 rounded-lg ${isDark?"bg-gray-700":"bg-gray-100"}`}>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className={textSecondary}/>
                  <span className={`text-sm font-semibold ${textColor}`}>{safeFilteredJobs.length}</span>
                  <span className={`text-xs ${textSecondary}`}>Total</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-yellow-600 dark:text-yellow-400"/>
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{safeFilteredJobs.filter(j=>j.tasks?.some(t=>t.status==="pending")).length}</span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">Pending</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400"/>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">{safeFilteredJobs.filter(j=>j.tasks?.some(t=>t.status==="fulfilled")).length}</span>
                  <span className="text-xs text-green-600 dark:text-green-400">Fulfilled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Filters */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`}/>
              <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                placeholder="Search by job title, company, or ID…"
                className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}/>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-wrap gap-2">
                {[{key:"all",label:`All (${totalJobsCount})`},{key:"pending",label:`Pending (${pendingJobsCount})`},{key:"fulfilled",label:`Fulfilled (${fulfilledJobsCount})`}].map(({key,label})=>(
                  <button key={key} onClick={()=>setStatusFilter(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter===key?"bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30":`${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className={textSecondary}/>
                <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
                  className={`px-4 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${cardBg} ${textColor} cursor-pointer`}>
                  <option value="all">All Time</option><option value="today">Today</option><option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option><option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option><option value="lastMonth">Last Month</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className={textSecondary}/>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  className={`px-4 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${cardBg} ${textColor} cursor-pointer`}>
                  <option value="newest">Newest First</option><option value="oldest">Oldest First</option>
                  <option value="updated">Recently Updated</option><option value="company_asc">Company (A-Z)</option><option value="company_desc">Company (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <p className={`text-sm ${textSecondary} mb-4`}>
          Showing <span className={`font-semibold ${textColor}`}>{safeFilteredJobs.length}</span> {safeFilteredJobs.length===1?"job":"jobs"}
          {dateFilter!=="all"&&<span className="ml-2">({dateFilter.replace(/([A-Z])/g," $1").trim()})</span>}
        </p>

        {/* Job cards */}
        {currentJobs.length===0 ? (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark?"bg-blue-500/20":"bg-blue-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <FileText size={32} className="text-blue-500"/>
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No jobs found</h3>
            <p className={textSecondary}>{searchTerm||statusFilter!=="all"||dateFilter!=="all"?"Try adjusting your filters":"No jobs to show."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentJobs.map(job=>{
              const tasks=job.tasks||[];
              const pendingTasks=tasks.filter(t=>t.status==="pending");
              const fulfilledTasks=tasks.filter(t=>t.status==="fulfilled");
              const canApprove=tasks.some(t=>t.status==="pending"&&(t.category==="postnewjob"||t.category==="editjob"));
              const canReject=tasks.some(t=>t.status==="pending"&&t.category==="postnewjob");
              const canEdit=tasks.some(t=>t.category==="editjob"||t.category==="postnewjob");
              return (
                <div key={job.job_id||job.id} className={`${cardBg} border ${borderColor} rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-sm`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-base font-bold ${textColor} truncate`}>{job.company_name||"N/A"}</h3>
                        {job.is_premium&&<span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 rounded text-xs font-semibold flex items-center gap-1"><Star size={11} fill="currentColor"/> PREMIUM</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className={`flex items-center gap-1 ${textSecondary}`}><Calendar size={11}/> Created: {formatDate(job.posted_date)}</span>
                        <span className={`flex items-center gap-1 ${textSecondary}`}><Clock size={11}/> Updated: {formatDate(job.updated_date)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pendingTasks.length>0&&<span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 rounded text-xs font-semibold">{pendingTasks.length} Pending</span>}
                      {fulfilledTasks.length>0&&<span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 rounded text-xs font-semibold">{fulfilledTasks.length} Fulfilled</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={!canApprove}
                      onClick={()=>{const t=tasks.find(t=>t.status==="pending"&&(t.category==="postnewjob"||t.category==="editjob"));if(t)handleApproveTask(t);}}
                      className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Check size={12}/> Approve
                    </button>
                    <button disabled={!canReject}
                      onClick={()=>{const t=tasks.find(t=>t.category==="postnewjob"&&t.status==="pending");if(t)handleRejectTask(t);}}
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                      <X size={12}/> Reject
                    </button>
                    <button disabled={!canEdit}
                      onClick={()=>{const t=tasks.find(t=>t.category==="editjob"||t.category==="postnewjob");if(t)setEditingTask({...t,category:"viewjob"});}}
                      className={`px-3 py-1.5 border ${borderColor} ${textColor} rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium flex items-center gap-1 disabled:opacity-50`}>
                      <Eye size={12}/> View
                    </button>
                    <button disabled={!canEdit}
                      onClick={()=>{const t=tasks.find(t=>t.category==="editjob"||t.category==="postnewjob");if(t)setEditingTask(t);}}
                      className={`px-3 py-1.5 border ${borderColor} ${textColor} rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium flex items-center gap-1 disabled:opacity-50`}>
                      <Edit size={12}/> Edit
                    </button>
                    {job.job_id&&tasks.length>0&&(
                      <button onClick={()=>handleMarkJobPremium(tasks[0],!job.is_premium)}
                        className={`px-3 py-1.5 ${job.is_premium?"bg-gray-600":"bg-yellow-600"} text-white rounded hover:opacity-90 text-xs font-medium flex items-center gap-1`}>
                        <Star size={12} fill={job.is_premium?"currentColor":"none"}/>
                        {job.is_premium?"Remove Premium":"Mark Premium"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages>1&&(
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1}
              className={`p-2 rounded-lg ${cardBg} border ${borderColor} ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}>
              <ChevronLeft size={16}/>
            </button>
            <span className={`text-sm ${textColor} px-4 py-2 ${cardBg} border ${borderColor} rounded-lg`}>Page {currentPage} of {totalPages}</span>
            <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}
              className={`p-2 rounded-lg ${cardBg} border ${borderColor} ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}>
              <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {editingTask&&(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${cardBg} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>

            <div className={`flex items-center justify-between p-5 border-b ${borderColor} sticky top-0 ${cardBg} z-10`}>
              <h2 className={`text-xl font-bold ${textColor}`}>
                {["newapplication","change status of application"].includes(editingTask.category)?"View Application Details":editingTask.category==="viewjob"?"View Job Details":"Edit Job Posting"}
              </h2>
              <button onClick={()=>setEditingTask(null)} className={`${textSecondary} p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
                <X size={24}/>
              </button>
            </div>

            {recruiterDetails&&(
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/30">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-blue-600 dark:text-blue-400"/>
                  <span className={`text-sm font-semibold ${textColor}`}>{recruiterDetails.company_name||"Unknown Company"}</span>
                </div>
              </div>
            )}

            <div className="p-6">
              {loadingJobEdit?(
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"/>
                  <p className={textSecondary}>Loading job data…</p>
                </div>
              ):(
                <>
                  {/* Application view */}
                  {["newapplication","change status of application"].includes(editingTask.category)&&applicantDetails&&(
                    <div className="space-y-6">
                      <div className={`${isDark?"bg-gray-700/50":"bg-gray-50"} rounded-lg p-4 border ${borderColor}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 border-2 border-blue-400">
                            {applicantDetails.company_logo?<img src={applicantDetails.company_logo} alt="" className="w-full h-full object-cover" onError={e=>{e.target.style.display="none";e.target.nextElementSibling.style.display="flex";}}/>:null}
                            <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl ${applicantDetails.company_logo?"hidden":"flex"}`}>
                              {(applicantDetails.company_name||"C").charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-bold ${textColor} mb-1`}>{applicantDetails.recruiter_name||"Not available"}</h3>
                            <p className={`text-base font-semibold ${textSecondary} mb-1`}>{applicantDetails.company_name||"N/A"}</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className={`flex items-center gap-1 ${textSecondary}`}><Mail size={13}/>{applicantDetails.email||"N/A"}</span>
                              {applicantDetails.phone&&<span className={`flex items-center gap-1 ${textSecondary}`}><Phone size={13}/>{applicantDetails.phone}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${applicantDetails.approval_status==="Approved"?"bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400":"bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400"}`}>{applicantDetails.approval_status||"Pending"}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${applicantDetails.kyc_status==="Verified"?"bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400":"bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400"}`}>KYC: {applicantDetails.kyc_status||"Not verified"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[{label:"Industry",value:applicantDetails.industry},{label:"Company Size",value:applicantDetails.company_size},{label:"Location",value:applicantDetails.location},{label:"Founded Year",value:applicantDetails.founded_year},{label:"KYC Type",value:applicantDetails.kyc_type?.toUpperCase()},{label:"KYC Document Number",value:applicantDetails.kyc_document_number}].map(({label,value})=>(
                          <div key={label}><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>{label}</label><p className={`text-sm ${textColor}`}>{value||"Not specified"}</p></div>
                        ))}
                        <div className="md:col-span-2"><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Registration Date</label><p className={`text-sm ${textColor}`}>{formatDate(applicantDetails.registration_date)}</p></div>
                        {applicantDetails.website&&<div className="md:col-span-2"><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Website</label><a href={applicantDetails.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">{applicantDetails.website}<ExternalLink size={12}/></a></div>}
                        {applicantDetails.kyc_doc_url&&<div className="md:col-span-2"><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>KYC Document</label><a href={applicantDetails.kyc_doc_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">View KYC Document<ExternalLink size={12}/></a></div>}
                      </div>
                      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={()=>setEditingTask(null)} className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium`}>Close</button>
                      </div>
                    </div>
                  )}

                  {/* View job (read-only) */}
                  {!["newapplication","change status of application"].includes(editingTask.category)&&editingTask.category==="viewjob"&&(
                    <div className="space-y-6">
                      <div>
                        <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}><Briefcase size={18} className="text-purple-500"/> Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[{label:"Job Title",value:jobData.job_title,hl:true},{label:"Company Name",value:jobData.company_name,hl:true},{label:"Location",value:jobData.location},{label:"Employment Type",value:jobData.employment_type},{label:"Work Mode",value:jobData.work_mode}].map(({label,value,hl})=>(
                            <div key={label}><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>{label}</label>
                              <div className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-medium ${textColor} ${hl?(isDark?"border-purple-500/30 bg-purple-900/20":"border-purple-200 bg-purple-50"):`${borderColor} ${isDark?"bg-gray-700/50":"bg-gray-50"}`}`}>{value||"Not specified"}</div>
                            </div>
                          ))}
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Contact Email</label><div className={`${readonlyCls} flex items-center gap-2`}><Mail size={14} className={textSecondary}/>{jobData.contact_email||"Not specified"}</div></div>
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Contact Number</label><div className={`${readonlyCls} flex items-center gap-2`}><Phone size={14} className={textSecondary}/>{jobData.contact_number||"Not specified"}</div></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Salary Range</label><div className={readonlyCls}>{jobData.salary_range?.min&&jobData.salary_range?.max?`${jobData.salary_range.currency||"INR"} ${jobData.salary_range.min} – ${jobData.salary_range.max}`:"Not specified"}</div></div>
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Experience</label><div className={readonlyCls}>{jobData.experience_required?.min_years&&jobData.experience_required?.max_years?`${jobData.experience_required.min_years} – ${jobData.experience_required.max_years} years`:"Not specified"}</div></div>
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}><FileText size={18} className="text-purple-500"/> Job Details</h3>
                        <div className="space-y-4">
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Description</label><div className={`${readonlyCls} min-h-[100px] whitespace-pre-wrap`}>{jobData.description||"Not specified"}</div></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Responsibilities</label><div className={`${readonlyCls} min-h-[80px] whitespace-pre-wrap`}>{jobData.responsibilities||"Not specified"}</div></div>
                            <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Qualifications</label><div className={`${readonlyCls} min-h-[80px] whitespace-pre-wrap`}>{jobData.qualifications||"Not specified"}</div></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {jobData.skills_required?.length>0?jobData.skills_required.map((s,i)=><span key={i} className={`px-3 py-1.5 ${isDark?"bg-purple-900/30 text-purple-400 border border-purple-700":"bg-purple-100 text-purple-700 border border-purple-200"} rounded-lg text-sm font-medium`}>{s}</span>):<span className={`text-sm ${textSecondary}`}>No skills specified</span>}
                        </div>
                      </div>
                      <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Application Deadline</label><div className={readonlyCls}>{jobData.application_deadline?formatDate(jobData.application_deadline):"Not specified"}</div></div>
                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={()=>setEditingTask(null)} className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium`}>Close</button>
                      </div>
                    </div>
                  )}

                  {/* Edit form */}
                  {!["newapplication","change status of application"].includes(editingTask.category)&&editingTask.category!=="viewjob"&&(
                    <form onSubmit={handleEditJobSubmit} className="space-y-6">
                      <div>
                        <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}><Briefcase size={18} className="text-blue-500"/> Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Job Title *</label><input type="text" value={jobData.job_title} onChange={e=>handleInputChange("job_title",e.target.value)} className={inputCls} required/></div>
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Company Name *</label><input type="text" value={jobData.company_name} onChange={e=>handleInputChange("company_name",e.target.value)} className={inputCls} required/></div>
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Location *</label><input type="text" value={jobData.location} onChange={e=>handleInputChange("location",e.target.value)} className={inputCls} required/></div>
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Employment Type *</label>
                            <select value={jobData.employment_type} onChange={e=>handleInputChange("employment_type",e.target.value)} className={inputCls} required>
                              <option value="Full-Time">Full-time</option><option value="Part-Time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option>
                            </select></div>
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Work Mode *</label>
                            <select value={jobData.work_mode} onChange={e=>handleInputChange("work_mode",e.target.value)} className={inputCls} required>
                              <option value="On-site">On-site</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option>
                            </select></div>
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Contact Email</label><input type="email" value={jobData.contact_email} onChange={e=>handleInputChange("contact_email",e.target.value)} className={inputCls}/></div>

                          {/* ✅ FIXED: type="text" (not "tel"), no stale-closure or key prop issues
                              because loadedJobKeyRef prevents the effect from re-running and
                              calling setJobData(EMPTY_JOB_DATA) while the user is typing */}
                          <div>
                            <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Contact Number</label>
                            <input
                              type="text"
                              value={jobData.contact_number}
                              onChange={e => handleInputChange("contact_number", e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              autoComplete="off"
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Salary Range</label>
                            <div className="flex gap-2">
                              <select value={jobData.salary_range.currency} onChange={e=>handleInputChange("salary_range.currency",e.target.value)} className={`px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}>
                                <option value="INR">₹</option><option value="USD">$</option><option value="EUR">€</option><option value="GBP">£</option>
                              </select>
                              <input type="number" placeholder="Min" value={jobData.salary_range.min} onChange={e=>handleInputChange("salary_range.min",e.target.value)} className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}/>
                              <span className={`flex items-center ${textSecondary}`}>–</span>
                              <input type="number" placeholder="Max" value={jobData.salary_range.max} onChange={e=>handleInputChange("salary_range.max",e.target.value)} className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}/>
                            </div></div>
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Experience (Years)</label>
                            <div className="flex gap-2">
                              <input type="number" placeholder="Min" value={jobData.experience_required.min_years} onChange={e=>handleInputChange("experience_required.min_years",e.target.value)} className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}/>
                              <span className={`flex items-center ${textSecondary}`}>–</span>
                              <input type="number" placeholder="Max" value={jobData.experience_required.max_years} onChange={e=>handleInputChange("experience_required.max_years",e.target.value)} className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}/>
                            </div></div>
                        </div>
                      </div>

                      <div>
                        <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}><FileText size={18} className="text-blue-500"/> Job Details</h3>
                        <div className="space-y-4">
                          <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Description *</label><textarea value={jobData.description} onChange={e=>handleInputChange("description",e.target.value)} rows={4} className={inputCls} required/></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Responsibilities *</label><textarea value={jobData.responsibilities} onChange={e=>handleInputChange("responsibilities",e.target.value)} rows={3} placeholder="One per line" className={inputCls} required/></div>
                            <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Qualifications *</label><textarea value={jobData.qualifications} onChange={e=>handleInputChange("qualifications",e.target.value)} rows={3} placeholder="One per line" className={inputCls} required/></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Required Skills</h3>
                        <div className="flex gap-2 mb-3">
                          <input type="text" placeholder="Add a skill" value={newSkill} onChange={e=>setNewSkill(e.target.value)}
                            onKeyPress={e=>{if(e.key==="Enter"){e.preventDefault();handleAddSkill();}}}
                            className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}/>
                          <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1"><Plus size={14}/> Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {jobData.skills_required.map((s,i)=>(
                            <span key={i} className={`px-3 py-1 ${isDark?"bg-blue-900/30 text-blue-400 border border-blue-700":"bg-blue-100 text-blue-700 border border-blue-200"} rounded-lg text-sm flex items-center gap-2`}>
                              {s}<button type="button" onClick={()=>handleRemoveSkill(s)} className="hover:text-red-500"><Trash2 size={12}/></button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div><label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Application Deadline</label>
                        <input type="date" value={jobData.application_deadline} onChange={e=>handleInputChange("application_deadline",e.target.value)} className={inputCls}/></div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={()=>setEditingTask(null)} className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium`}>Cancel</button>
                        <button type="submit" disabled={loadingJobEdit} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                          {loadingJobEdit?<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/> Updating…</>:<><Check size={16}/> Update Job</>}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;