import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, Grid, CircularProgress, MenuItem } from '@mui/material';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import Select from '../../components/ui/Select';
import { AuthContext } from '../../context/AuthContext';
import vehicleService from '../../services/vehicle.service';
import { toast } from 'react-toastify';

const VehicleForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    vehicleName: '',
    registrationNumber: '',
    manufacturer: '',
    modelYear: new Date().getFullYear(),
    fuelCapacity: '',
    fuelEfficiency: '',
    fuelType: 'Petrol',
    status: 'Active',
    driver: '',
    currentOdometer: 0
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only Admins, Managers, and Individuals can access this form
    if (user && user.role !== 'Admin' && user.role !== 'Manager' && user.role !== 'Individual') {
      navigate('/vehicles');
      toast.error('Unauthorized access');
      return;
    }

    const fetchData = async () => {
      try {
        // Skip driver list fetch for individual users
        if (user && user.role !== 'Individual') {
          const driversData = await vehicleService.getAvailableDrivers();
          setDrivers(driversData);
        }

        if (isEditMode) {
          const vehicle = await vehicleService.getVehicle(id);
          setFormData({
            vehicleName: vehicle.vehicleName || vehicle.model || '',
            registrationNumber: vehicle.registrationNumber || vehicle.licensePlate || '',
            manufacturer: vehicle.manufacturer || vehicle.make || '',
            modelYear: vehicle.modelYear || vehicle.year || new Date().getFullYear(),
            fuelCapacity: vehicle.fuelCapacity || '',
            fuelEfficiency: vehicle.fuelEfficiency || '',
            fuelType: vehicle.fuelType || 'Petrol',
            status: vehicle.status || 'Active',
            driver: vehicle.driver ? vehicle.driver._id : '',
            currentOdometer: vehicle.currentOdometer || 0
          });
        }
      } catch (error) {
        toast.error('Failed to load data');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (payload.driver === '') {
        payload.driver = null;
      }

      if (isEditMode) {
        await vehicleService.updateVehicle(id, payload);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleService.createVehicle(payload);
        toast.success('Vehicle created successfully');
      }
      navigate('/vehicles');
    } catch (error) {
      const message = error.response?.data?.message || 'Action failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="vehicleName"
                label="Vehicle Name"
                name="vehicleName"
                placeholder="e.g. Corolla"
                value={formData.vehicleName}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="registrationNumber"
                label="Registration Number"
                name="registrationNumber"
                placeholder="e.g. ABC-1234"
                value={formData.registrationNumber}
                onChange={handleChange}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="manufacturer"
                label="Manufacturer/Company"
                name="manufacturer"
                placeholder="e.g. Toyota"
                value={formData.manufacturer}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="modelYear"
                label="Model Year"
                name="modelYear"
                type="number"
                value={formData.modelYear}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="fuelEfficiency"
                label="Fuel Efficiency (km/liter)"
                name="fuelEfficiency"
                type="number"
                value={formData.fuelEfficiency}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="fuelCapacity"
                label="Fuel Tank Capacity (Liters)"
                name="fuelCapacity"
                type="number"
                value={formData.fuelCapacity}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                required
                id="fuelType"
                label="Fuel Type"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                options={['Petrol', 'Diesel', 'Electric']}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="currentOdometer"
                label="Current Odometer (km)"
                name="currentOdometer"
                type="number"
                value={formData.currentOdometer}
                onChange={handleChange}
              />
            </Grid>
            {user?.role !== 'Individual' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Select
                    id="status"
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={['Active', 'Inactive', 'Maintenance']}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Select
                    id="driver"
                    label="Assign Driver (Optional)"
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...drivers.map(d => ({ value: d._id, label: `${d.name} (${d.email})` }))
                    ]}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/vehicles')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VehicleForm;
