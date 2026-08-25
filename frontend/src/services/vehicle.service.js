import { fetchMethod } from "../utils/helper";
import api from './api';

const API_URL = '/vehicles';

// Get all vehicles
const getVehicles = async () => {
  const { response } = await fetchMethod(() => api.get(API_URL));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Get single vehicle
const getVehicle = async (id) => {
  const { response } = await fetchMethod(() => api.get(`${API_URL}/${id}`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Create vehicle
const createVehicle = async (vehicleData) => {
  const { response } = await fetchMethod(() => api.post(API_URL, vehicleData));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Update vehicle
const updateVehicle = async (id, vehicleData) => {
  const { response } = await fetchMethod(() => api.put(`${API_URL}/${id}`, vehicleData));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Delete vehicle
const deleteVehicle = async (id) => {
  const { response } = await fetchMethod(() => api.delete(`${API_URL}/${id}`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

// Get available drivers
const getAvailableDrivers = async () => {
  const { response } = await fetchMethod(() => api.get(`${API_URL}/drivers/available`));
  if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');
  return response.data;
};

const vehicleService = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableDrivers
};

export default vehicleService;
