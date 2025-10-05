// Admin External Service - AWS API Gateway approval endpoints
import axios from 'axios';

// Allow environment overrides; default to provided execute-api hosts
const ADMIN_EDIT_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EDIT_BASE) || 'https://pxp7c1q6w0.execute-api.ap-southeast-1.amazonaws.com';
const ADMIN_CLOSE_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_CLOSE_BASE) || 'https://4ua54ajyt2.execute-api.ap-southeast-1.amazonaws.com';
const ADMIN_POST_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_POST_BASE) || 'https://dpe8786t44.execute-api.ap-southeast-1.amazonaws.com';
const ADMIN_APPLICATION_APPROVAL_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_APPLICATION_APPROVAL_BASE) || 'https://w6j19ipnk8.execute-api.ap-southeast-1.amazonaws.com';
const ADMIN_APPLICATION_STATUS_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_APPLICATION_STATUS_BASE) || 'https://xnaf1mh5p2.execute-api.ap-southeast-1.amazonaws.com';

export const adminExternalService = {
  // Approve edited job (fulfill edit task)
  async approveEditedJob(taskId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/admin/edit/default/approvededitjobs`
      : `${ADMIN_EDIT_BASE}/default/approvededitjobs`;
    const { data } = await axios.get(url, { params: { task_id: taskId } });
    return data;
  },

  // Approve job closing
  async approveJobClosing(taskId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/admin/close/default/approvedjobclosing`
      : `${ADMIN_CLOSE_BASE}/default/approvedjobclosing`;
    const { data } = await axios.get(url, { params: { task_id: taskId } });
    return data;
  },

  // Approve job posting
  async approveJobPosting(taskId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/admin/post/default/approvedjobposting`
      : `${ADMIN_POST_BASE}/default/approvedjobposting`;
    const { data } = await axios.get(url, { params: { task_id: taskId } });
    return data;
  },

  // Approve job application by student (endpoint name contains a typo per spec)
  async approveJobApplicationByStudent(taskId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/admin/app-approve/default/approvedjobapplicationbystudent`
      : `${ADMIN_APPLICATION_APPROVAL_BASE}/default/approvedjobapplicationbystudent`;
    const { data } = await axios.get(url, { params: { task_id: taskId } });
    return data;
  },

  // Approve application status change
  async approveApplicationStatusChanged(taskId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/admin/app-status/default/approvedapplicationstatuschanged`
      : `${ADMIN_APPLICATION_STATUS_BASE}/default/approvedapplicationstatuschanged`;
    const { data } = await axios.get(url, { params: { task_id: taskId } });
    return data;
  }
};

export default adminExternalService;
