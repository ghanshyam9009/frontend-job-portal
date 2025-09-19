// Notification Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const notificationService = {
  // Get all notifications
  async getAllNotifications(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.notifications.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get notifications by user
  async getNotificationsByUser(userId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.notifications.getByUser(userId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.notifications.markAsRead(notificationId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark all notifications as read for user
  async markAllAsRead(userId) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.notifications.markAllAsRead(userId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create notification
  async createNotification(notificationData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.notifications.create, notificationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get unread notifications count
  async getUnreadCount(userId) {
    try {
      const response = await apiClient.get(`/notifications/unread-count/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get notifications by type
  async getNotificationsByType(userId, type, params = {}) {
    try {
      const response = await apiClient.get(`/notifications/user/${userId}/type/${type}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default notificationService;
