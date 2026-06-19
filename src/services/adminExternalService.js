// Admin External Service - AWS API Gateway approval endpoints
import axios from 'axios';

// Use environment variables for API URLs, with fallbacks for local development
const ADMIN_EDIT_URL = import.meta.env.VITE_ADMIN_EDIT_URL || 'https://pxp7c1q6w0.execute-api.ap-southeast-1.amazonaws.com/default/approvededitjobs';
const ADMIN_CLOSE_URL = import.meta.env.VITE_ADMIN_CLOSE_URL || 'https://4ua54ajyt2.execute-api.ap-southeast-1.amazonaws.com/default/approvedjobclosing';
const ADMIN_POST_URL = import.meta.env.VITE_ADMIN_POST_URL || 'https://dpe8786t44.execute-api.ap-southeast-1.amazonaws.com/default/approvedjobposting';
const ADMIN_APPLICATION_APPROVAL_URL = import.meta.env.VITE_ADMIN_APPLICATION_APPROVAL_URL || 'https://w6j19ipnk8.execute-api.ap-southeast-1.amazonaws.com/default/approcedjobapplicationbyatudent';
const ADMIN_APPLICATION_STATUS_URL = import.meta.env.VITE_ADMIN_APPLICATION_STATUS_URL || 'https://xnaf1mh5p2.execute-api.ap-southeast-1.amazonaws.com/default/approvedapplicationstatuschanged';
const ADMIN_GET_ALL_TASKS_URL = import.meta.env.VITE_ADMIN_GET_ALL_TASKS_URL || 'https://3ciltqmaa4.execute-api.ap-southeast-1.amazonaws.com/default/getalltasks';
const GET_JOB_DETAIL_URL =
  import.meta.env.VITE_ADMIN_GET_JOB_DETAIL_URL ||
  'https://md9s5hywf2.execute-api.ap-southeast-1.amazonaws.com/default/getjobdetail';
const ADMIN_CLOSE_JOB_ADMIN_URL =
  import.meta.env.VITE_ADMIN_CLOSE_JOB_ADMIN_URL ||
  'https://sls3h02vab.execute-api.ap-southeast-1.amazonaws.com/dev/close-job-admin';
const ADMIN_GET_ALL_JOB_ADMIN_URL =
  import.meta.env.VITE_ADMIN_GET_ALL_JOB_ADMIN_URL ||
  'https://9voh0hfu5i.execute-api.ap-southeast-1.amazonaws.com/dev/getalljobadmin';

const ADMIN_REOPEN_APPROVE_URL =
  import.meta.env.VITE_ADMIN_REOPEN_APPROVE_URL ||
  'http://localhost:4000/api/job/admin/approve-reopen-job';

export const adminExternalService = {
  // Get admin jobs from cursor-based paginated endpoint
  async getAllJobAdminPage({ limit = 10, lastKey } = {}) {
    const params = { limit };
    if (lastKey) params.lastKey = lastKey;
    const { data } = await axios.get(ADMIN_GET_ALL_JOB_ADMIN_URL, { params });
    return data;
  },

  // Fetches all pages until API returns lastKey as null
  async getAllJobAdmin({ limit = 100 } = {}) {
    const allJobs = [];
    let cursor;
    let count = 0;

    do {
      const response = await this.getAllJobAdminPage({ limit, lastKey: cursor });
      const jobs = Array.isArray(response?.jobs) ? response.jobs : [];
      allJobs.push(...jobs);
      count = response?.count ?? count;
      cursor = response?.lastKey || null;
    } while (cursor);

    return {
      count,
      jobs: allJobs,
      lastKey: null,
    };
  },

  // Get all tasks
  async getAllTasks() {
    const { data } = await axios.get(ADMIN_GET_ALL_TASKS_URL);
    return data;
  },

  /** Lambda getjobdetail — same pattern as recruiterExternalService.getAllApplicants (axios + params). */
  async getJobDetailFromLambda(jobId) {
    if (jobId == null || jobId === '') return null;
    try {
      const { data } = await axios.get(GET_JOB_DETAIL_URL, { params: { job_id: jobId } });
      return data;
    } catch (error) {
      console.error('Failed to fetch job detail from Lambda:', error);
      return null;
    }
  },

  // Approve edited job (fulfill edit task)
  async approveEditedJob(taskId) {
    if (!taskId) throw new Error('task_id is required for edit approval');
    const { data } = await axios.post(ADMIN_EDIT_URL, { task_id: taskId });
    return data;
  },

  // Approve job closing
  async approveJobClosing(taskId) {
    if (!taskId) throw new Error('task_id is required for close approval');
    const { data } = await axios.get(ADMIN_CLOSE_URL, { params: { task_id: taskId } });
    return data;
  },

  // Approve new job posting
  async approveJobPosting(taskId) {
    if (!taskId) throw new Error('task_id is required for new job approval');
    const { data } = await axios.post(ADMIN_POST_URL, { task_id: taskId, approve: 1 });
    return data;
  },

  async approveReopenJob(taskId, jobId) {
    const { data } = await axios.post(ADMIN_REOPEN_APPROVE_URL, { task_id: taskId, job_id :jobId });
    return data;
  },

  async closeJobAdmin(payload) {
    const { data } = await axios.post(ADMIN_CLOSE_JOB_ADMIN_URL, payload);
    return data;
  },

  // Reject job posting (approve: 0); optional rejection_reason for admin / employer visibility
  async rejectJobPosting(taskId, rejectionReason) {
    const payload = { task_id: taskId, approve: 0 };
    const trimmed =
      rejectionReason != null ? String(rejectionReason).trim() : "";
    if (trimmed) {
      payload.rejection_reason = trimmed;
    }
    const { data } = await axios.post(ADMIN_POST_URL, payload);
    return data;
  },

  // Approve job application by student
  async approveJobApplicationByStudent(taskId) {
    const { data } = await axios.get(ADMIN_APPLICATION_APPROVAL_URL, { params: { task_id: taskId } });
    return data;
  },

  // Approve application status change
  async approveApplicationStatusChanged(taskId) {
    const { data } = await axios.get(ADMIN_APPLICATION_STATUS_URL, { params: { task_id: taskId } });
    return data;
  }
};

export default adminExternalService;
