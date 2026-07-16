import api from './api';

const API_URL = '/maintenance';

// Get maintenance logs for a vehicle
const getMaintenanceLogs = async (vehicleId) => {
  const response = await api.get(`${API_URL}/vehicle/${vehicleId}`);
  return response.data;
};

// Get single maintenance log
const getMaintenanceLog = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// Create maintenance log
const createMaintenanceLog = async (logData) => {
  const response = await api.post(API_URL, logData);
  return response.data;
};

// Update maintenance log
const updateMaintenanceLog = async (id, logData) => {
  const response = await api.put(`${API_URL}/${id}`, logData);
  return response.data;
};

// Delete maintenance log
const deleteMaintenanceLog = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

const maintenanceService = {
  getMaintenanceLogs,
  getMaintenanceLog,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog
};

export default maintenanceService;
