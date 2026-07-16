import React, { useState, useContext } from 'react';
import { Box, Toolbar, useTheme } from '@mui/material';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import PageLoader from '../../components/ui/PageLoader';
import { AuthContext } from '../../context/AuthContext';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const theme = useTheme();

  if (loading) {
    return <PageLoader text="Verifying session..." />;
  }

  // Redirect to login if unauthenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 0,
          width: { md: `calc(100% - 260px)` } // matches sidebar width
        }}
      >
        <Header handleDrawerToggle={handleDrawerToggle} />
        
        <Box sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          flexGrow: 1, 
          maxWidth: '1280px', 
          width: '100%', 
          mx: 'auto' 
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
