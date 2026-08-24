import api from './api';

const API_URL = '/users';

// Get all users (Admin only)
const getUsers = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// Get user details (Admin only)
const getUserById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// Update user details (Admin only)
const updateUser = async (id, userData) => {
  const response = await api.put(`${API_URL}/${id}`, userData);
  return response.data;
};

// Delete user (Admin only)
const deleteUser = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

// Delete all inactive users (Admin only)
const deleteInactiveUsers = async () => {
  const response = await api.delete(`${API_URL}/inactive`);
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteInactiveUsers
};

export default userService;
