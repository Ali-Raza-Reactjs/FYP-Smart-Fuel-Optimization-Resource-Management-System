import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, Grid, CircularProgress, MenuItem } from '@mui/material';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import Select from '../../components/ui/Select';
import { AuthContext } from '../../context/AuthContext';
import maintenanceService from '../../services/maintenance.service';
import { toast } from 'react-toastify';

const MaintenanceForm = () => {
  const { vehicleId, id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    performedBy: '',
    status: 'Completed',
    odometerReading: ''
  });
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    // Only Admins and Managers can access this form
    if (user && user.role !== 'Admin' && user.role !== 'Manager') {
      navigate(`/vehicles/${vehicleId}/maintenance`);
      toast.error('Unauthorized access');
      return;
    }

    const fetchLog = async () => {
      try {
        const log = await maintenanceService.getMaintenanceLog(id);
        setFormData({
          date: new Date(log.date).toISOString().split('T')[0],
          description: log.description,
          cost: log.cost,
          performedBy: log.performedBy,
          status: log.status,
          odometerReading: log.odometerReading
        });
      } catch (error) {
        toast.error('Failed to load maintenance record');
        navigate(`/vehicles/${vehicleId}/maintenance`);
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchLog();
    }
  }, [id, isEditMode, navigate, user, vehicleId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, vehicle: vehicleId };

      if (isEditMode) {
        await maintenanceService.updateMaintenanceLog(id, payload);
        toast.success('Maintenance record updated successfully');
      } else {
        await maintenanceService.createMaintenanceLog(payload);
        toast.success('Maintenance logged successfully');
      }
      navigate(`/vehicles/${vehicleId}/maintenance`);
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
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
      <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        {isEditMode ? 'Update Maintenance Record' : 'Log Maintenance'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              id="date"
              label="Date"
              name="date"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formData.date}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              id="performedBy"
              label="Performed By (Workshop/Mechanic)"
              name="performedBy"
              value={formData.performedBy}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              required
              id="description"
              label="Description of Work"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              required
              id="cost"
              label="Cost ($)"
              name="cost"
              type="number"
              inputProps={{ step: "0.01" }}
              value={formData.cost}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              required
              id="odometerReading"
              label="Odometer Reading (km)"
              name="odometerReading"
              type="number"
              value={formData.odometerReading}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Select
              required
              id="status"
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={['Scheduled', 'In Progress', 'Completed']}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => navigate(`/vehicles/${vehicleId}/maintenance`)}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? 'Update Record' : 'Save Record'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MaintenanceForm;
