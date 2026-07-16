import api from './api';

const API_URL = '/budgets';

// Get all budgets
const getBudgets = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// Get single budget
const getBudget = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// Create budget
const createBudget = async (budgetData) => {
  const response = await api.post(API_URL, budgetData);
  return response.data;
};

// Update budget
const updateBudget = async (id, budgetData) => {
  const response = await api.put(`${API_URL}/${id}`, budgetData);
  return response.data;
};

// Delete budget
const deleteBudget = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
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
