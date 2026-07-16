import { Box, CircularProgress, Container, Grid, Input, Paper, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import { AuthContext } from '../../context/AuthContext';
import fuelService from '../../services/fuel.service';

const FuelForm = () => {
  const { vehicleId, id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    liters: '',
    cost: '',
    odometerReading: ''
  });
  const [receiptImage, setReceiptImage] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    // Drivers can Add, but only Admins/Managers can Edit
    if (isEditMode && user && user.role === 'Driver') {
      navigate(`/vehicles/${vehicleId}/fuel`);
      toast.error('Drivers cannot edit fuel records');
      return;
    }

    const fetchRecord = async () => {
      try {
        const record = await fuelService.getFuelRecord(id);
        setFormData({
          date: new Date(record.date).toISOString().split('T')[0],
          liters: record.liters,
          cost: record.cost,
          odometerReading: record.odometerReading
        });
      } catch (error) {
        toast.error('Failed to load fuel record');
        navigate(`/vehicles/${vehicleId}/fuel`);
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchRecord();
    }
  }, [id, isEditMode, navigate, user, vehicleId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setReceiptImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use FormData for file upload
      const submitData = new FormData();
      submitData.append('vehicle', vehicleId);
      submitData.append('date', formData.date);
      submitData.append('liters', formData.liters);
      submitData.append('cost', formData.cost);
      submitData.append('odometerReading', formData.odometerReading);

      if (receiptImage) {
        submitData.append('receiptImage', receiptImage);
      }

      if (isEditMode) {
        await fuelService.updateFuelRecord(id, submitData);
        toast.success('Fuel record updated successfully');
      } else {
        await fuelService.createFuelRecord(submitData);
        toast.success('Fuel logged successfully');
      }
      navigate(`/vehicles/${vehicleId}/fuel`);
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
        {isEditMode ? 'Edit Fuel Record' : 'Log Fuel'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
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
              id="odometerReading"
              label="Odometer Reading (km)"
              name="odometerReading"
              type="number"
              value={formData.odometerReading}
              onChange={handleChange}
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              id="liters"
              label="Liters Pumped"
              name="liters"
              type="number"
              inputProps={{ step: "0.01" }}
              value={formData.liters}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              id="cost"
              label="Total Cost ($)"
              name="cost"
              type="number"
              inputProps={{ step: "0.01" }}
              value={formData.cost}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Upload Receipt (Optional)
            </Typography>
            <Input
              type="file"
              name="receiptImage"
              onChange={handleFileChange}
              fullWidth
              inputProps={{ accept: "image/*" }}
              sx={{ mt: 1, mb: 2 }}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => navigate(`/vehicles/${vehicleId}/fuel`)}>
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

export default FuelForm;
