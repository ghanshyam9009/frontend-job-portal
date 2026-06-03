import apiClient from "./apiClient";

const JOBS_ENDPOINT = "/Recruiter/jobs";

const normalizeList = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

export const adminRecruiterJobService = {
  async getRecruiterJobs(params = {}) {
    const response = await apiClient.get(JOBS_ENDPOINT, { params });
    const jobs = normalizeList(response).map((job) => ({
      ...job,
      id: job.job_id || job.id,
      application_count:
        job.applications_count ?? job.application_count ?? 0,
    }));

    return {
      success: Boolean(response?.success),
      tab: response?.tab || params?.tab || "all",
      page: Number(response?.page || params?.page || 1),
      limit: Number(response?.limit || 10),
      total: Number(response?.total || jobs.length),
      total_pages: Number(response?.total_pages || 1),
      showing: Number(response?.showing || jobs.length),
      data: jobs,
    };
  },
};

export default adminRecruiterJobService;
