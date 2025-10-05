// Admin External Service - AWS API Gateway approval endpoints
import axios from 'axios';

// Production URLs for external admin services
const ADMIN_EDIT_URL = 'https://pxp7c1q6w0.execute-api.ap-southeast-1.amazonaws.com/default/approvededitjobs';
const ADMIN_CLOSE_URL = 'https://4ua54ajyt2.execute-api.ap-southeast-1.amazonaws.com/default/approvedjobclosing';
const ADMIN_POST_URL = 'https://dpe8786t44.execute-api.ap-southeast-1.amazonaws.com/default/approvedjobposting';
const ADMIN_APPLICATION_APPROVAL_URL = 'https://w6j19ipnk8.execute-api.ap-southeast-1.amazonaws.com/default/approcedjobapplicationbyatudent';
const ADMIN_APPLICATION_STATUS_URL = 'https://xnaf1mh5p2.execute-api.ap-southeast-1.amazonaws.com/default/approvedapplicationstatuschanged';

export const adminExternalService = {
  // Approve edited job (fulfill edit task)
  async approveEditedJob(taskId) {
    const { data } = await axios.get(ADMIN_EDIT_URL, { params: { task_id: taskId } });
    return data;
  },

  // Approve job closing
  async approveJobClosing(taskId) {
    const { data } = await axios.get(ADMIN_CLOSE_URL, { params: { task_id: taskId } });
    return data;
  },

  // Approve job posting
  async approveJobPosting(taskId) {
    const { data } = await axios.get(ADMIN_POST_URL, { params: { task_id: taskId } });
    return data;
  },

  // Approve job application by student (endpoint name contains a typo per spec)
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
