import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { withErrorHandling } from '../utils/errorHandler';

export const taskService = {
  // Get all tasks
  async getAllTasks(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.tasks.getAll, { params });
      return response;
    }, 'Failed to fetch tasks');
  },

  // Get task by ID
  async getTaskById(taskId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.tasks.getById(taskId));
      return response;
    }, 'Failed to fetch task');
  },

  // Update task
  async updateTask(taskId, taskData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.tasks.update(taskId), taskData);
      return response;
    }, 'Failed to update task');
  },

  // Delete task
  async deleteTask(taskId) {
    return withErrorHandling(async () => {
      const response = await apiClient.delete(API_ENDPOINTS.tasks.delete(taskId));
      return response;
    }, 'Failed to delete task');
  },

  // Get tasks by category
  async getTasksByCategory(category, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.tasks.getByCategory(category), { params });
      return response;
    }, 'Failed to fetch tasks by category');
  },

  // Get tasks by status
  async getTasksByStatus(status, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.tasks.getByStatus(status), { params });
      return response;
    }, 'Failed to fetch tasks by status');
  },

  // Approve task
  async approveTask(taskId) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.tasks.approve(taskId));
      return response;
    }, 'Failed to approve task');
  },

  // Reject task
  async rejectTask(taskId) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.tasks.reject(taskId));
      return response;
    }, 'Failed to reject task');
  }
};

export default taskService;

