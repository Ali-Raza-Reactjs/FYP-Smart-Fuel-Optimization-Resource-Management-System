import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, Paper, Grid, useTheme, IconButton, Divider } from '@mui/material';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData);
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
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: '#fff',
        p: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract shapes for premium feel */}
        <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }} />

        <Box sx={{ maxWidth: 480, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ backgroundColor: '#fff', color: theme.palette.primary.main, p: 1.5, borderRadius: 3, display: 'flex', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
              <LocalGasStationIcon fontSize="large" />
            </Box>
            <Typography variant="h3" fontWeight="bold" letterSpacing="-1px">   Smart Fuel Optimization System</Typography>
          </Box>
          <Typography variant="h4" fontWeight="600" sx={{ mb: 2, lineHeight: 1.2 }}>
            Enterprise Resource &<br />Fleet Optimization
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.5 }}>
            Manage vehicles, track trips, monitor fuel consumption, and enforce budgets all in one unified platform.
          </Typography>
        </Box>
      </Box>

      {/* Right side - Login Form */}
      <Box sx={{
        flex: { xs: 1, md: 0.8, lg: 0.6 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, sm: 6, md: 8 }
      }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
            <Box sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', p: 1, borderRadius: 2, display: 'flex' }}>
              <LocalGasStationIcon />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="primary.main">Smart Fuel Optimization System</Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your credentials to access your account.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                id="email"
                name="email"
                placeholder="name@company.com"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                startIcon={<EmailOutlinedIcon sx={{ color: 'text.secondary' }} />}
              />

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
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
              />

              <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                  Forgot password?
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                size="large"
              >
                Sign In
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Box component={RouterLink} to="/register" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sign up
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
