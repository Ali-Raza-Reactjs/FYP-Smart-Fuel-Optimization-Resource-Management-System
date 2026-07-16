import api from './api';

const API_URL = '/organizations';

// Get all organizations
const getOrganizations = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// Get single organization
const getOrganization = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// Create organization
const createOrganization = async (orgData) => {
  const response = await api.post(API_URL, orgData);
  return response.data;
};

// Update organization
const updateOrganization = async (id, orgData) => {
  const response = await api.put(`${API_URL}/${id}`, orgData);
  return response.data;
};

// Delete organization
const deleteOrganization = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

const orgService = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
};

export default orgService;
