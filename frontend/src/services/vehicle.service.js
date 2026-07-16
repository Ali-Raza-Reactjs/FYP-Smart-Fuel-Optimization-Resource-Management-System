import api from './api';

const API_URL = '/vehicles';

// Get all vehicles
const getVehicles = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// Get single vehicle
const getVehicle = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// Create vehicle
const createVehicle = async (vehicleData) => {
  const response = await api.post(API_URL, vehicleData);
  return response.data;
};

// Update vehicle
const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`${API_URL}/${id}`, vehicleData);
  return response.data;
};

// Delete vehicle
const deleteVehicle = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

// Get available drivers
const getAvailableDrivers = async () => {
  const response = await api.get(`${API_URL}/drivers/available`);
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
