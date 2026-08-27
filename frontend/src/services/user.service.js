import { fetchMethod } from "../utils/helper";
import api from './api';

const API_URL = '/users';

const getAdmins = async () => {
  const { response } = await fetchMethod(() => api.get(`${API_URL}/admins`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const createAdmin = async (adminData) => {
  const { response } = await fetchMethod(() => api.post(`${API_URL}/admins`, adminData));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Get all users (Admin only)
const getUsers = async () => {
  const { response } = await fetchMethod(() => api.get(API_URL));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Get user details (Admin only)
const getUserById = async (id) => {
  const { response } = await fetchMethod(() => api.get(`${API_URL}/${id}`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Update user details (Admin only)
const updateUser = async (id, userData) => {
  const { response } = await fetchMethod(() => api.put(`${API_URL}/${id}`, userData));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Delete user (Admin only)
const deleteUser = async (id) => {
  const { response } = await fetchMethod(() => api.delete(`${API_URL}/${id}`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Delete all inactive users (Admin only)
const deleteInactiveUsers = async () => {
  const { response } = await fetchMethod(() => api.delete(`${API_URL}/inactive`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const userService = {
  getAdmins,
  createAdmin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteInactiveUsers
};

export default userService;
