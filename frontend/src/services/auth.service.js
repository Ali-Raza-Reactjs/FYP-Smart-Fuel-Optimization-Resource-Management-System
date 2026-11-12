import { fetchMethod } from "../utils/helper";
import api from "./api";

// Register user
const register = async (userData) => {
  const { response } = await fetchMethod(() =>
    api.post("/auth/register", userData),
  );
  if (!response?.status) {
    throw new Error(response?.msg || response?.message || "Registration failed");
  }
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const { response } = await fetchMethod(() =>
    api.post("/auth/login", userData),
  );
  if (!response?.status) {
    throw new Error(response?.msg || response?.message || "Login failed");
  }
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

// Get user profile
const getProfile = async () => {
  const { response } = await fetchMethod(() => api.get("/users/profile"));
  if (!response?.status) {
    throw new Error(response?.msg || response?.message || "Failed to get profile");
  }
  return response.data;
};

// Update user profile
const updateProfile = async (userData) => {
  const { response } = await fetchMethod(() =>
    api.put("/users/profile", userData),
  );
  if (!response?.status) {
    throw new Error(response?.msg || response?.message || "Profile update failed");
  }
  return response.data;
};

// Reset password (Forgot password)
const resetPassword = async (email, newPassword) => {
  const { response } = await fetchMethod(() =>
    api.post("/auth/reset-password", { email, newPassword }),
  );
  if (!response?.status) {
    throw new Error(response?.msg || response?.message || "Password reset failed");
  }
  return response;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  resetPassword,
};

export default authService;
