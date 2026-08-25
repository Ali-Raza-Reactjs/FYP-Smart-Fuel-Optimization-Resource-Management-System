import { fetchMethod } from "../utils/helper";
import api from './api';

const API_URL = '/dashboard';

// Get dashboard statistics
const getDashboardStats = async () => {
  const { response } = await fetchMethod(() => api.get(API_URL));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const dashboardService = {
  getDashboardStats
};

export default dashboardService;
