import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrganizationList from './pages/Organizations/OrganizationList';
import OrganizationForm from './pages/Organizations/OrganizationForm';
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleForm from './pages/Vehicles/VehicleForm';
import MaintenanceList from './pages/Maintenance/MaintenanceList';
import MaintenanceForm from './pages/Maintenance/MaintenanceForm';
import FuelList from './pages/Fuel/FuelList';
import FuelForm from './pages/Fuel/FuelForm';
import TripList from './pages/Trips/TripList';
import TripForm from './pages/Trips/TripForm';
import BudgetList from './pages/Budgets/BudgetList';
import BudgetForm from './pages/Budgets/BudgetForm';
import Reports from './pages/Reports';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './routes/ProtectedRoutes';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorBoundaryFallback from './components/common/ErrorBoundaryFallback';
import theme from './theme';

function App() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorBoundaryFallback}
      onReset={() => window.location.replace('/')}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Authenticated Layout Shell */}
              <Route element={<AppLayout />}>
                {/* Protected Routes - All authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/vehicles" element={<VehicleList />} />
                  <Route path="/vehicles/:vehicleId/fuel" element={<FuelList />} />
                  <Route path="/vehicles/:vehicleId/fuel/new" element={<FuelForm />} />
                  <Route path="/trips" element={<TripList />} />
                  <Route path="/trips/new" element={<TripForm />} />
                  <Route path="/trips/edit/:id" element={<TripForm />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                {/* Protected Routes - Admin & Manager only */}
                <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
                  <Route path="/vehicles/new" element={<VehicleForm />} />
                  <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
                  <Route path="/vehicles/:vehicleId/maintenance" element={<MaintenanceList />} />
                  <Route path="/vehicles/:vehicleId/maintenance/new" element={<MaintenanceForm />} />
                  <Route path="/vehicles/:vehicleId/maintenance/edit/:id" element={<MaintenanceForm />} />
                  <Route path="/vehicles/:vehicleId/fuel/edit/:id" element={<FuelForm />} />
                  <Route path="/budgets" element={<BudgetList />} />
                  <Route path="/budgets/new" element={<BudgetForm />} />
                  <Route path="/budgets/edit/:id" element={<BudgetForm />} />
                  <Route path="/reports" element={<Reports />} />
                </Route>

                {/* Protected Routes - Admin only */}
                <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                  <Route path="/organizations" element={<OrganizationList />} />
                  <Route path="/organizations/new" element={<OrganizationForm />} />
                  <Route path="/organizations/edit/:id" element={<OrganizationForm />} />
                </Route>
              </Route>

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Routes>
          </Router>
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
