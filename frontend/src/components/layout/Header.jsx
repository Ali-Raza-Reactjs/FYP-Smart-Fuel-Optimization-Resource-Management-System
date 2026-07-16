import React, { useContext, useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Badge, Avatar, Menu, MenuItem, Divider, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import notificationService from '../../services/notification.service';
import { toast } from 'react-toastify';

const Header = ({ handleDrawerToggle }) => {
  const theme = useTheme();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setNotifAnchorEl(null);
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Determine page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/vehicles')) return 'Vehicles';
    if (path.includes('/trips')) return 'Trips';
    if (path.includes('/budgets')) return 'Budgets';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/organizations')) return 'Organizations';
    if (path.includes('/profile')) return 'Profile';
    return 'Smart Fuel Optimization System';
  };

  if (!user) return null;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" fontWeight="600" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {getPageTitle()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            sx={{
              backgroundColor: unreadCount > 0 ? `${theme.palette.primary.main}1A` : 'transparent',
              color: unreadCount > 0 ? theme.palette.primary.main : theme.palette.text.secondary,
              '&:hover': { backgroundColor: `${theme.palette.primary.main}2A` }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={() => setNotifAnchorEl(null)}
            PaperProps={{
              elevation: 3,
              sx: { width: '360px', maxHeight: '400px', mt: 1.5, borderRadius: 2 }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
              {unreadCount > 0 && (
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                  onClick={handleMarkAllRead}
                >
                  Mark all as read
                </Typography>
              )}
            </Box>
            <Divider />
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">You're all caught up!</Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => { if (!notif.isRead) handleMarkAsRead(notif._id); }}
                  sx={{
                    backgroundColor: notif.isRead ? 'transparent' : `${theme.palette.primary.main}0A`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    whiteSpace: 'normal',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    p: 2,
                    position: 'relative'
                  }}
                >
                  {!notif.isRead && (
                    <Box sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.palette.primary.main }} />
                  )}
                  <Typography variant="subtitle2" fontWeight={notif.isRead ? 500 : 600} color={notif.type === 'Alert' ? 'error.main' : 'text.primary'} sx={{ pl: notif.isRead ? 0 : 1.5 }}>
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, pl: notif.isRead ? 0 : 1.5 }}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.tertiary" sx={{ pl: notif.isRead ? 0 : 1.5 }}>
                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* User Profile */}
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              ml: 1,
              p: 0.5,
              pr: 1.5,
              borderRadius: 8,
              cursor: 'pointer',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': { backgroundColor: theme.palette.action.hover }
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontSize: '1rem', fontWeight: 'bold' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="600" lineHeight={1.2}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'capitalize' }}>
                {user.role}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon color="action" fontSize="small" />
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ elevation: 3, sx: { width: '200px', mt: 1, borderRadius: 2 } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, display: { xs: 'block', sm: 'none' } }}>
              <Typography variant="subtitle2" fontWeight="bold">{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              <Divider sx={{ mt: 1 }} />
            </Box>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>Profile Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Sign out</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
