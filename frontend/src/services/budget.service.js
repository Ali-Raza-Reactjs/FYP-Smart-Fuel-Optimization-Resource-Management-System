import { fetchMethod } from "../utils/helper";
import api from './api';

const API_URL = '/budgets';

// Get all budgets
const getBudgets = async () => {
  const { response } = await fetchMethod(() => api.get(API_URL));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Get single budget
const getBudget = async (id) => {
  const { response } = await fetchMethod(() => api.get(`${API_URL}/${id}`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Create budget
const createBudget = async (budgetData) => {
  const { response } = await fetchMethod(() => api.post(API_URL, budgetData));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Update budget
const updateBudget = async (id, budgetData) => {
  const { response } = await fetchMethod(() => api.put(`${API_URL}/${id}`, budgetData));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Delete budget
const deleteBudget = async (id) => {
  const { response } = await fetchMethod(() => api.delete(`${API_URL}/${id}`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const budgetService = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
};

export default budgetService;
