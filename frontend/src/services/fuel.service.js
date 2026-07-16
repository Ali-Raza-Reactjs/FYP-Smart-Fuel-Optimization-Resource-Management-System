import api from './api';

const API_URL = '/fuel';

// Get fuel records and analytics for a vehicle
const getFuelRecords = async (vehicleId) => {
  const response = await api.get(`${API_URL}/vehicle/${vehicleId}`);
  return response.data;
};

// Get single fuel record
const getFuelRecord = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// Create fuel record (handles FormData for file upload)
const createFuelRecord = async (formData) => {
  const response = await api.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update fuel record (handles FormData for file upload)
const updateFuelRecord = async (id, formData) => {
  const response = await api.put(`${API_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete fuel record
const deleteFuelRecord = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

const fuelService = {
  getFuelRecords,
  getFuelRecord,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord
};

export default fuelService;
