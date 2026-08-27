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
import PeopleIcon from '@mui/icons-material/People';
import { AuthContext } from '../../context/AuthContext';
import ConfirmDialog from '../ui/ConfirmDialog';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard', roles: ['Admin', 'Individual', 'Manager', 'Driver'] },
    { text: 'Vehicles', icon: <DirectionsCarIcon fontSize="small" />, path: '/vehicles', roles: ['Admin', 'Individual', 'Manager', 'Driver'] },
    { text: 'Trips', icon: <RouteIcon fontSize="small" />, path: '/trips', roles: ['Admin', 'Individual', 'Manager', 'Driver'] },
  ];

  const managerItems = [
    { text: 'Budgets', icon: <AccountBalanceWalletIcon fontSize="small" />, path: '/budgets', roles: ['Admin', 'Manager'] },
    { text: 'Reports', icon: <AssessmentIcon fontSize="small" />, path: '/reports', roles: ['Admin', 'Manager'] },
  ];

  const adminItems = [
    { text: 'Organizations', icon: <BusinessIcon fontSize="small" />, path: '/organizations', roles: ['Admin'] },
    { text: 'User Management', icon: <PeopleIcon fontSize="small" />, path: '/admin/users', roles: ['Admin'] },
  ];

  const adminManagementItems = [
    { text: 'Admin Management', icon: <PeopleIcon fontSize="small" />, path: '/admin/admins', roles: ['Admin'] },
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
                backgroundColor: 'rgba(255, 255, 255, 0.13)',
                fontWeight: 600,
                boxShadow: `inset 3px 0 0 ${theme.palette.secondary.light}`,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
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
              slotProps={{ primary: { sx: {
                fontWeight: active ? 600 : 500,
                fontSize: '0.9rem',
                letterSpacing: 0.2,
                opacity: active ? 1 : 0.8
              } } }}
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
      background: 'linear-gradient(160deg, #123C69 0%, #0B2948 100%)',
      color: '#fff'
    }}>
      {/* Brand Header */}
      <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          backgroundColor: '#fff',
          color: theme.palette.primary.main,
          p: 0.75,
          borderRadius: 2.5,
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
            {user.adminRole === 'superAdmin' && (
              <List sx={{ pt: 0 }}>
                {renderListItems(adminManagementItems)}
              </List>
            )}
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
      <ConfirmDialog
        open={logoutDialogOpen}
        title="Sign out?"
        content="Are you sure you want to sign out of your account?"
        confirmText="Sign out"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutDialogOpen(false)}
      />
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', borderRadius: 0 },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: `1px solid ${theme.palette.divider}`, borderRadius: 0 },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
