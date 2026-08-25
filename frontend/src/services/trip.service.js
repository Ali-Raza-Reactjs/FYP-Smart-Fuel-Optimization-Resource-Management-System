import { fetchMethod } from "../utils/helper";
import api from './api';

const API_URL = '/trips';

// Get all trips (filtered by backend based on role)
const getTrips = async () => {
  const { response } = await fetchMethod(() => api.get(API_URL));
  return response.data;
};

// Get single trip
const getTrip = async (id) => {
  const { response } = await fetchMethod(() => api.get(`${API_URL}/${id}`));
  return response.data;
};

// Create trip
const createTrip = async (tripData) => {
  const { response } = await fetchMethod(() => api.post(API_URL, tripData));
  return response.data;
};

// Update trip
const updateTrip = async (id, tripData) => {
  const { response } = await fetchMethod(() => api.put(`${API_URL}/${id}`, tripData));
  return response.data;
};

// Delete trip
const deleteTrip = async (id) => {
  const { response } = await fetchMethod(() => api.delete(`${API_URL}/${id}`));
  return response.data;
};

const tripService = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip
};

export default tripService;
