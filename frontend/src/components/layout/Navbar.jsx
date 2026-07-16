import React, { useContext, useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Badge, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { AuthContext } from '../../context/AuthContext';
import notificationService from '../../services/notification.service';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for new notifications
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

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifMenu = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
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
      handleNotifClose();
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <LocalGasStationIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component={RouterLink} to="/dashboard" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
          Smart Fuel Optimization System        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard">
                Dashboard
              </Button>
              {user.role === 'Admin' && (
                <Button color="inherit" component={RouterLink} to="/organizations">
                  Organizations
                </Button>
              )}
              {(user.role === 'Admin' || user.role === 'Manager') && (
                <>
                  <Button color="inherit" component={RouterLink} to="/budgets">
                    Budgets
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/reports">
                    Reports
                  </Button>
                </>
              )}
              <Button color="inherit" component={RouterLink} to="/vehicles">
                Vehicles
              </Button>
              <Button color="inherit" component={RouterLink} to="/trips">
                Trips
              </Button>

              {/* Notifications */}
              <IconButton
                size="large"
                color="inherit"
                onClick={handleNotifMenu}
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Menu
                id="menu-notifications"
                anchorEl={notifAnchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(notifAnchorEl)}
                onClose={handleNotifClose}
                PaperProps={{ style: { maxHeight: 400, width: '350px' } }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Notifications</Typography>
                  {unreadCount > 0 && (
                    <Button size="small" onClick={handleMarkAllRead}>Mark all read</Button>
                  )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                  <MenuItem onClick={handleNotifClose}>
                    <Typography color="text.secondary">No notifications</Typography>
                  </MenuItem>
                ) : (
                  notifications.map((notif) => (
                    <MenuItem
                      key={notif._id}
                      onClick={() => { if (!notif.isRead) handleMarkAsRead(notif._id); }}
                      sx={{
                        backgroundColor: notif.isRead ? 'transparent' : 'action.hover',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        whiteSpace: 'normal',
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={notif.isRead ? 'normal' : 'bold'} color={notif.type === 'Alert' ? 'error' : 'textPrimary'}>
                        {notif.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {notif.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(notif.createdAt).toLocaleString()}
                      </Typography>
                    </MenuItem>
                  ))
                )}
              </Menu>

              {/* Profile Menu */}
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                  Profile ({user.role})
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
