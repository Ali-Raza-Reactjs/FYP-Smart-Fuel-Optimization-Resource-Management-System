import { Box, Grid, Paper, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        phoneNumber: user.profile?.phoneNumber || '',
        address: user.profile?.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      name: formData.name,
      profile: {
        phoneNumber: formData.phoneNumber,
        address: formData.address
      }
    });
  };

  return (
    <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          User Profile
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={formData.email}
                disabled // Email shouldn't be easily changeable in this demo
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="role"
                label="Role"
                name="role"
                value={formData.role}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="address"
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'right' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3 }}
            >
              Update Profile
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
