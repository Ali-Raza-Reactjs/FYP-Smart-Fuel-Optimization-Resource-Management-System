import { fetchMethod } from "../utils/helper";
import api from './api';

const API_URL = '/notifications';

const getNotifications = async () => {
  const { response } = await fetchMethod(() => api.get(API_URL));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const markAsRead = async (id) => {
  const { response } = await fetchMethod(() => api.put(`${API_URL}/${id}/read`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const markAllAsRead = async () => {
  const { response } = await fetchMethod(() => api.put(`${API_URL}/read-all`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

export default notificationService;
