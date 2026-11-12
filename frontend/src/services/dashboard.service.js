import { fetchMethod } from "../utils/helper";
import api from './api';

const API_URL = '/dashboard';

// Get dashboard statistics
const getDashboardStats = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
  const query = params.toString();
  const { response } = await fetchMethod(() => api.get(query ? `${API_URL}?${query}` : API_URL));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const dashboardService = {
  getDashboardStats
};

export default dashboardService;
