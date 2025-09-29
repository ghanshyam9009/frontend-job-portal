import React, { useState } from "react";
import styles from "../../Styles/AdminDashboard.module.css";

const NotificationsLogs = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: "user_registration",
      message: "New user registered: john.doe@email.com",
      timestamp: "2025-01-15T10:30:00Z",
      status: "unread"
    },
    {
      id: 2,
      type: "job_posted",
      message: "New job posted: Senior Developer at Tech Corp",
      timestamp: "2025-01-15T09:15:00Z",
      status: "read"
    },
    {
      id: 3,
      type: "payment_received",
      message: "Payment received: $299 from StartupXYZ",
      timestamp: "2025-01-14T16:45:00Z",
      status: "read"
    },
    {
      id: 4,
      type: "system_alert",
      message: "High server load detected",
      timestamp: "2025-01-14T14:20:00Z",
      status: "unread"
    },
    {
      id: 5,
      type: "user_login",
      message: "Admin login from IP: 192.168.1.100",
      timestamp: "2025-01-13T11:10:00Z",
      status: "read"
    }
  ]);

  const getNotificationIcon = (type) => {
    const icons = {
      user_registration: "👤",
      job_posted: "📄",
      payment_received: "💰",
      system_alert: "⚠️",
      user_login: "🔐"
    };
    return icons[type] || "📢";
  };

  const getNotificationType = (type) => {
    const types = {
      user_registration: "User Registration",
      job_posted: "Job Posted",
      payment_received: "Payment",
      system_alert: "System Alert",
      user_login: "User Login"
    };
    return types[type] || "Notification";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Notifications & Logs</h1>
        <p className={styles.pageSubtitle}>View system notifications and activity logs</p>
      </div>

      {/* Notifications Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id} className={notification.status === 'unread' ? styles.unreadRow : ''}>
                <td>
                  <div className={styles.notificationType}>
                    <span className={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <span>{getNotificationType(notification.type)}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.messageCell}>
                    <p className={styles.messageText}>{notification.message}</p>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${notification.status === 'unread' ? styles.statusNew : styles.statusCompleted}`}>
                    {notification.status === 'unread' ? 'Unread' : 'Read'}
                  </span>
                </td>
                <td className={styles.dateCell}>{formatDate(notification.timestamp)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionBtn} title="Mark as Read">
                      ✅
                    </button>
                    <button className={styles.actionBtn} title="Delete">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notifications.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔔</div>
          <h3>No notifications</h3>
          <p>No notifications to display at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsLogs;