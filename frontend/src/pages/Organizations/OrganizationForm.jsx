import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import { AuthContext } from '../../context/AuthContext';
import orgService from '../../services/org.service';
import { toast } from 'react-toastify';

const OrganizationForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    // Only Admins can access this form
    if (user && user.role !== 'Admin') {
      navigate('/organizations');
      toast.error('Unauthorized access');
      return;
    }

    const fetchOrganization = async () => {
      try {
        const org = await orgService.getOrganization(id);
        setFormData({
          name: org.name,
          address: org.address,
          contactEmail: org.contactEmail,
          contactPhone: org.contactPhone
        });
      } catch (error) {
        toast.error('Failed to load organization details');
        navigate('/organizations');
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchOrganization();
    }
  }, [id, isEditMode, navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await orgService.updateOrganization(id, formData);
        toast.success('Organization updated successfully');
      } else {
        await orgService.createOrganization(formData);
        toast.success('Organization created successfully');
      }
      navigate('/organizations');
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
          {isEditMode ? 'Update Organization' : 'Add New Organization'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                id="name"
                label="Organization Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="contactEmail"
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="contactPhone"
                label="Contact Phone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                id="address"
                label="Full Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/organizations')}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Update Organization' : 'Add Organization'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrganizationForm;
