import React, { useContext } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme, Avatar, IconButton, Tooltip, Button } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RouteIcon from '@mui/icons-material/Route';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../../context/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard', roles: ['Admin', 'Manager', 'Driver'] },
    { text: 'Vehicles', icon: <DirectionsCarIcon fontSize="small" />, path: '/vehicles', roles: ['Admin', 'Manager', 'Driver'] },
    { text: 'Trips', icon: <RouteIcon fontSize="small" />, path: '/trips', roles: ['Admin', 'Manager', 'Driver'] },
  ];

  const managerItems = [
    { text: 'Budgets', icon: <AccountBalanceWalletIcon fontSize="small" />, path: '/budgets', roles: ['Admin', 'Manager'] },
    { text: 'Reports', icon: <AssessmentIcon fontSize="small" />, path: '/reports', roles: ['Admin', 'Manager'] },
  ];

  const adminItems = [
    { text: 'Organizations', icon: <BusinessIcon fontSize="small" />, path: '/organizations', roles: ['Admin'] },
  ];

  const renderListItems = (items) => (
    items.filter(item => item.roles.includes(user.role)).map((item) => {
      const active = isActive(item.path);
      return (
        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to={item.path}
            selected={active}
            sx={{
              borderRadius: 2,
              mx: 2,
              px: 2,
              py: 1,
              transition: 'all 0.2s ease-in-out',
              color: '#fff',
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{
              minWidth: 36,
              color: '#fff',
              opacity: active ? 1 : 0.8,
              transition: 'all 0.2s ease-in-out'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: active ? 600 : 500,
                fontSize: '0.9rem',
                letterSpacing: 0.2,
                opacity: active ? 1 : 0.8
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    })
  );

  const drawerContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      color: '#fff'
    }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          backgroundColor: '#fff',
          color: theme.palette.primary.main,
          p: 0.75,
          borderRadius: 2,
          display: 'flex',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <LocalGasStationIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" color="inherit" letterSpacing="-0.3px">
          SmartFuel
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ overflow: 'auto', flex: 1, mt: 1 }}>
        <List sx={{ pt: 0 }}>
          {renderListItems(menuItems)}
        </List>

        {(user.role === 'Admin' || user.role === 'Manager') && (
          <>
            <Typography variant="overline" sx={{ px: 4, py: 1, display: 'block', fontWeight: 600, mt: 2, color: 'rgba(255,255,255,0.6)' }}>
              Management
            </Typography>
            <List sx={{ pt: 0 }}>
              {renderListItems(managerItems)}
            </List>
          </>
        )}

        {user.role === 'Admin' && (
          <>
            <Typography variant="overline" sx={{ px: 4, py: 1, display: 'block', fontWeight: 600, mt: 2, color: 'rgba(255,255,255,0.6)' }}>
              System
            </Typography>
            <List sx={{ pt: 0 }}>
              {renderListItems(adminItems)}
            </List>
          </>
        )}
      </Box>

      {/* Logout Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          fullWidth
          onClick={handleLogout}
          sx={{
            color: '#fff',
            justifyContent: 'flex-start',
            py: 1,
            px: 2,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            }
          }}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: `1px solid ${theme.palette.divider}` },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
