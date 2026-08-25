import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, IconButton, TableRow, TableCell,
  Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select as MuiSelect,
  useTheme
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

import userService from '../../services/user.service';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusChip from '../../components/ui/StatusChip';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';

// Mini KPI Card
const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  return (
    <Card elevation={0} sx={{ position: 'relative', overflow: 'hidden', borderTop: `4px solid ${color}` }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="text.secondary" variant="caption" fontWeight={600}  letterSpacing={0.5} sx={{ textTransform: 'uppercase' }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ backgroundColor: `${color}1A`, color: color, p: 1.5, borderRadius: 2, display: 'flex' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const UserManagement = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: '',
    name: '',
    email: '',
    role: '',
    status: '',
    phoneNumber: '',
    address: ''
  });

  // Action Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Confirmations
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInactiveConfirmOpen, setDeleteInactiveConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenMenu = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenEditDialog = () => {
    if (!selectedUser) return;
    setEditFormData({
      _id: selectedUser._id,
      name: selectedUser.name || '',
      email: selectedUser.email || '',
      role: selectedUser.role || 'Individual',
      status: selectedUser.status || 'Active',
      phoneNumber: selectedUser.profile?.phoneNumber || '',
      address: selectedUser.profile?.address || ''
    });
    setEditDialogOpen(true);
    handleCloseMenu();
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        status: editFormData.status,
        phoneNumber: editFormData.phoneNumber,
        address: editFormData.address
      };

      const updated = await userService.updateUser(editFormData._id, payload);
      toast.success('User updated successfully');
      setUsers(users.map(u => u._id === updated._id ? { ...u, ...updated } : u));
      setEditDialogOpen(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      await userService.deleteUser(selectedUser._id);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setDeleteConfirmOpen(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    } finally {
      setDeleting(false);
      handleCloseMenu();
    }
  };

  const handleDeleteInactiveUsers = async () => {
    setDeleting(true);
    try {
      const response = await userService.deleteInactiveUsers();
      toast.success(response.message || 'Inactive users deleted');
      setUsers(users.filter(u => u.status !== 'Inactive'));
      setDeleteInactiveConfirmOpen(false);
    } catch (error) {
      toast.error('Failed to delete inactive users');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading users..." />;
  }

  // Filter users by search term
  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.profile?.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculations
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const inactiveUsersCount = users.filter(u => u.status === 'Inactive').length;

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="View details, edit roles, and delete inactive users from the system."
        action={
          inactiveUsersCount > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<PersonAddDisabledIcon />}
              onClick={() => setDeleteInactiveConfirmOpen(true)}
            >
              Delete Inactive ({inactiveUsersCount})
            </Button>
          )
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Total Registered Users"
            value={totalUsersCount}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Active Users"
            value={activeUsersCount}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Inactive Users"
            value={inactiveUsersCount}
            icon={<PersonAddDisabledIcon />}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* User Table */}
      <DataTable
        columns={[
          { label: 'User Details' },
          { label: 'Contact Number' },
          { label: 'Role' },
          { label: 'Status' },
          { label: 'Actions', align: 'right' }
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name, email, role, phone..."
      >
        {filteredUsers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} align="center" sx={{ p: 0 }}>
              <EmptyState
                icon={PersonIcon}
                title="No users found"
                description={searchTerm ? "Try adjusting your search criteria" : "There are currently no other users registered."}
              />
            </TableCell>
          </TableRow>
        ) : (
          filteredUsers.map((u) => (
            <TableRow key={u._id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: u.role === 'Admin' ? 'error.light' : 'primary.light', color: u.role === 'Admin' ? 'error.dark' : 'primary.dark' }}>
                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {u.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {u.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {u.profile?.phoneNumber || (
                    <Typography component="span" variant="body2" color="text.disabled" fontStyle="italic">
                      Not Provided
                    </Typography>
                  )}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {u.role}
                </Typography>
              </TableCell>
              <TableCell>
                <StatusChip status={u.status === 'Active' ? 'Active' : 'Inactive'} />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => handleOpenMenu(e, u)} size="small">
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        )}
      </DataTable>

      {/* Row Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{ paper: { elevation: 3, sx: { width: 180, borderRadius: 2, mt: 1 } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleOpenEditDialog}>
          <ListItemIcon><EditIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Edit Info</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setDeleteConfirmOpen(true)} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit User Modal */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Edit User Information</span>
          <IconButton onClick={() => setEditDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleUpdateUser}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  name="name"
                  label="Full Name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  type="email"
                  name="email"
                  label="Email Address"
                  value={editFormData.email}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Select
                  required
                  name="role"
                  label="Role"
                  value={editFormData.role}
                  onChange={handleEditChange}
                  options={['Admin', 'Individual', 'Manager', 'Driver']}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Select
                  required
                  name="status"
                  label="Status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  options={['Active', 'Inactive']}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="phoneNumber"
                  label="Phone Number"
                  value={editFormData.phoneNumber}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={editFormData.address}
                  onChange={handleEditChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1.5 }}>
            <Button variant="outlined" color="inherit" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmations */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete User"
        content={`Are you sure you want to delete user ${selectedUser?.name}? All associated vehicle assignments might be affected.`}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirmText="Delete"
        loading={deleting}
      />

      <ConfirmDialog
        open={deleteInactiveConfirmOpen}
        title="Delete Inactive Users"
        content={`Are you sure you want to delete all ${inactiveUsersCount} inactive users from the system? This action is permanent.`}
        onConfirm={handleDeleteInactiveUsers}
        onCancel={() => setDeleteInactiveConfirmOpen(false)}
        confirmText="Delete Inactive"
        loading={deleting}
      />
    </Box>
  );
};

export default UserManagement;
