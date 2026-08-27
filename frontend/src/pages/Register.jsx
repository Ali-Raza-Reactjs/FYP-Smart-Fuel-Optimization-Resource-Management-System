import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, Paper, useTheme, IconButton, Grid } from '@mui/material';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';

const Register = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', contactNumber: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(formData);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', backgroundColor: theme.palette.background.default }}>

      {/* Left side - Branding (hidden on mobile) */}
      <Box sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        color: '#fff',
        p: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }} />

        <Box sx={{ maxWidth: 480, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ backgroundColor: '#fff', color: theme.palette.primary.main, p: 1.5, borderRadius: 3, display: 'flex', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
              <LocalGasStationIcon fontSize="large" />
            </Box>
            <Typography variant="h3" fontWeight="bold" letterSpacing="-1px">   Smart Fuel Optimization System</Typography>
          </Box>
          <Typography variant="h4" fontWeight="600" sx={{ mb: 2, lineHeight: 1.2 }}>
            Join the Fleet<br />Management Revolution
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.5 }}>
            Create your account to start managing operations securely and efficiently.
          </Typography>

          <Box sx={{ mt: 6, p: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Account Selection</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Register as an Individual to manage your personal vehicles and logs, or as an Admin to oversee all users and assets in the system.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right side - Register Form */}
      <Box sx={{
        flex: { xs: 1, md: 0.8, lg: 0.6 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, sm: 6, md: 8 }
      }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 480, p: 4, borderRadius: 3 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 6, justifyContent: 'center' }}>
            <Box sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', p: 1, borderRadius: 2, display: 'flex' }}>
              <LocalGasStationIcon />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="primary.main">Smart Fuel Optimization System</Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
              Create an account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your details to get started.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  id="name"
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  startIcon={<PersonOutlineOutlinedIcon sx={{ color: 'text.secondary' }} />}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  id="email"
                  name="email"
                  label="Email Address"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  startIcon={<EmailOutlinedIcon sx={{ color: 'text.secondary' }} />}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  id="contactNumber"
                  name="contactNumber"
                  label="Contact Number"
                  placeholder="+92 300 1234567"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  startIcon={<PhoneOutlinedIcon sx={{ color: 'text.secondary' }} />}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  startIcon={<LockOutlinedIcon sx={{ color: 'text.secondary' }} />}
                  endIcon={
                    <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  loading={loading}
                  sx={{ mt: 1 }}
                >
                  Create Account
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Box component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sign in
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Register;
