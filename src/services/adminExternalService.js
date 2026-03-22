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

export const adminExternalService = {
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
    const { data } = await axios.post(ADMIN_EDIT_URL, { task_id: taskId });
    return data;
  },

  // Approve job closing
  async approveJobClosing(taskId) {
    const { data } = await axios.get(ADMIN_CLOSE_URL, { params: { task_id: taskId } });
    return data;
  },

  // Approve job posting
  async approveJobPosting(taskId, approve) {
    const { data } = await axios.post(ADMIN_POST_URL, { task_id: taskId, approve });
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
