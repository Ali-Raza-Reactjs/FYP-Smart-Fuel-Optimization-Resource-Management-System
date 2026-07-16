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
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    fuelCapacity: '',
    fuelType: 'Petrol',
    status: 'Active',
    driver: '',
    currentOdometer: 0
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only Admins and Managers can access this form
    if (user && user.role !== 'Admin' && user.role !== 'Manager') {
      navigate('/vehicles');
      toast.error('Unauthorized access');
      return;
    }

    const fetchData = async () => {
      try {
        const driversData = await vehicleService.getAvailableDrivers();
        setDrivers(driversData);

        if (isEditMode) {
          const vehicle = await vehicleService.getVehicle(id);
          setFormData({
            licensePlate: vehicle.licensePlate,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            fuelCapacity: vehicle.fuelCapacity,
            fuelType: vehicle.fuelType,
            status: vehicle.status,
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
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
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
                id="licensePlate"
                label="License Plate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                autoFocus
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="make"
                label="Make"
                name="make"
                placeholder="e.g. Toyota"
                value={formData.make}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="model"
                label="Model"
                name="model"
                placeholder="e.g. Corolla"
                value={formData.model}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="year"
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="fuelCapacity"
                label="Fuel Capacity (Liters)"
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
                options={['Petrol', 'Diesel', 'Hybrid', 'EV']}
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
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/vehicles')}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VehicleForm;
