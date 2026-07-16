import api from './api';

const API_URL = '/notifications';

const getNotifications = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

const markAsRead = async (id) => {
  const response = await api.put(`${API_URL}/${id}/read`);
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.put(`${API_URL}/read-all`);
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

export default notificationService;
