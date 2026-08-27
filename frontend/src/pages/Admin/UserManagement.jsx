import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, IconButton, TableRow, TableCell,
  Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress, Tabs, Tab,
  useTheme
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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
import { AuthContext } from '../../context/AuthContext';

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

// Shared field set for both Add Admin and Edit Admin dialogs
const AdminAccountFields = ({ formData, onChange, isEditMode = false }) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12 }}>
      <TextField required name="name" label="Full Name" value={formData.name} onChange={onChange} />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <TextField required type="email" name="email" label="Email Address" value={formData.email} onChange={onChange} />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <TextField name="contactNumber" label="Contact Number" value={formData.contactNumber} onChange={onChange} />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        required={!isEditMode}
        type="password"
        name="password"
        label={isEditMode ? 'New Password (optional)' : 'Password'}
        value={formData.password}
        onChange={onChange}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        required={!isEditMode || Boolean(formData.password)}
        type="password"
        name="confirmPassword"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={onChange}
      />
    </Grid>
  </Grid>
);

const UserManagement = () => {
  const theme = useTheme();
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const isSuperAdmin = currentUser?.role === 'Admin' && currentUser?.adminRole === 'superAdmin';
  const [activeTab, setActiveTab] = useState(0);

  // Edit dialog state (Individual users)
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

  // Edit dialog state (Admin accounts - handled separately from Individuals)
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);
  const [editAdminFormData, setEditAdminFormData] = useState({
    _id: '',
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });

  // Action Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '', email: '', contactNumber: '', password: '', confirmPassword: ''
  });

  // Confirmations
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInactiveConfirmOpen, setDeleteInactiveConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async (tabIndex = activeTab) => {
    setLoading(true);
    try {
      const data = await userService.getUsers({ role: tabIndex === 0 ? ['Individual'] : ['Admin'] });
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, []);

  const handleTabChange = (_, value) => {
    setActiveTab(value);
    fetchUsers(value);
  };

  const handleOpenMenu = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Admin accounts are edited via a separate dialog/flow from Individuals
  const handleOpenEditDialog = () => {
    if (!selectedUser) return;
    if (selectedUser.role === 'Admin') {
      setEditAdminFormData({
        _id: selectedUser._id,
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        contactNumber: selectedUser.profile?.phoneNumber || '',
        password: '',
        confirmPassword: ''
      });
      setEditAdminDialogOpen(true);
      handleCloseMenu();
      return;
    }
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

  const handleOpenViewDialog = async () => {
    if (!selectedUser) return;
    handleCloseMenu();
    setViewDialogOpen(true);
    setViewUser(selectedUser);
    setViewLoading(true);
    try {
      const details = await userService.getUserById(selectedUser._id);
      setViewUser(details);
    } catch (error) {
      toast.error('Failed to load user details');
      setViewDialogOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleCreateChange = (e) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
  };

  const handleEditAdminChange = (e) => {
    setEditAdminFormData({ ...editAdminFormData, [e.target.name]: e.target.value });
  };

  // Shared by Add Admin and Edit Admin: confirmPassword only guards input, never sent to the API
  const passwordsMatch = (password, confirmPassword) => {
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!passwordsMatch(createFormData.password, createFormData.confirmPassword)) return;
    setSubmitting(true);
    try {
      const payload = {
        name: createFormData.name,
        email: createFormData.email,
        contactNumber: createFormData.contactNumber,
        password: createFormData.password
      };
      const created = await userService.createAdmin(payload);
      setUsers([created, ...users]);
      setCreateDialogOpen(false);
      setCreateFormData({ name: '', email: '', contactNumber: '', password: '', confirmPassword: '' });
      toast.success('Admin account created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create admin account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!passwordsMatch(editAdminFormData.password, editAdminFormData.confirmPassword)) return;
    setSubmitting(true);
    try {
      const payload = {
        name: editAdminFormData.name,
        email: editAdminFormData.email,
        phoneNumber: editAdminFormData.contactNumber
      };
      if (editAdminFormData.password) {
        payload.password = editAdminFormData.password;
      }

      const updated = await userService.updateUser(editAdminFormData._id, payload);
      toast.success('Admin updated successfully');
      setUsers(users.map(u => u._id === updated._id ? { ...u, ...updated } : u));
      setEditAdminDialogOpen(false);
    } catch (error) {
      const message = error.message || error.response?.data?.message || 'Update failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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
      const message = error.message || error.response?.data?.message || 'Update failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (selectedUser.status !== 'Inactive' || String(selectedUser._id) === String(currentUser?._id)) return;
    setDeleting(true);
    try {
      await userService.deleteUser(selectedUser._id);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setDeleteConfirmOpen(false);
    } catch (error) {
      const message = error.message || error.response?.data?.message || 'Delete failed';
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
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.profile?.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Statistics calculations
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const inactiveUsersCount = users.filter(u => u.status === 'Inactive').length;

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle={activeTab === 1 ? 'View administrator accounts and access levels.' : 'View details and manage individual user accounts.'}
        action={
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {activeTab === 1 && isSuperAdmin && (
              <Button startIcon={<PersonAddIcon />} onClick={() => setCreateDialogOpen(true)}>
                Create Admin
              </Button>
            )}
            {activeTab === 0 && inactiveUsersCount > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<PersonAddDisabledIcon />}
                onClick={() => setDeleteInactiveConfirmOpen(true)}
              >
                Delete Inactive ({inactiveUsersCount})
              </Button>
            )}
          </Box>
        }
      />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        aria-label="User management sections"
      >
        <Tab label="Individuals" />
        <Tab label="Admins" />
      </Tabs>

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

      {activeTab === 1 && isSuperAdmin && (
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Create Admin Account</span>
            <IconButton onClick={() => setCreateDialogOpen(false)} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          <form onSubmit={handleCreateAdmin}>
            <DialogContent dividers>
              <AdminAccountFields formData={createFormData} onChange={handleCreateChange} />
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1.5 }}>
              <Button variant="outlined" color="inherit" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Create Admin</Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* Edit Admin Modal - kept separate from the Individual user Edit modal */}
      <Dialog open={editAdminDialogOpen} onClose={() => setEditAdminDialogOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Edit Admin Account</span>
          <IconButton onClick={() => setEditAdminDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleUpdateAdmin}>
          <DialogContent dividers>
            <AdminAccountFields formData={editAdminFormData} onChange={handleEditAdminChange} isEditMode />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1.5 }}>
            <Button variant="outlined" color="inherit" onClick={() => setEditAdminDialogOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Changes</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>User Details</span>
          <IconButton onClick={() => setViewDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewLoading ? (
            <Box sx={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' }, display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: viewUser?.role === 'Admin' ? 'error.light' : 'primary.light', color: viewUser?.role === 'Admin' ? 'error.dark' : 'primary.dark' }}>
                  {viewUser?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{viewUser?.name || 'Unknown user'}</Typography>
                  <Typography variant="body2" color="text.secondary">{viewUser?.email || 'No email available'}</Typography>
                </Box>
              </Box>
              <Box><Typography variant="caption" color="text.secondary">Role</Typography><Typography variant="body1" fontWeight={600}>{viewUser?.role || 'Not provided'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Status</Typography><Box><StatusChip status={viewUser?.status === 'Active' ? 'Active' : 'Inactive'} /></Box></Box>
              <Box><Typography variant="caption" color="text.secondary">Contact Number</Typography><Typography variant="body1">{viewUser?.profile?.phoneNumber || 'Not provided'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Organization</Typography><Typography variant="body1">{viewUser?.organization?.name || viewUser?.organization || 'Not assigned'}</Typography></Box>
              <Box sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}><Typography variant="caption" color="text.secondary">Address</Typography><Typography variant="body1">{viewUser?.profile?.address || 'Not provided'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Account Created</Typography><Typography variant="body1">{viewUser?.createdAt ? new Date(viewUser.createdAt).toLocaleDateString() : 'Not available'}</Typography></Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Row Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{ paper: { elevation: 3, sx: { width: 180, borderRadius: 2, mt: 1 } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleOpenViewDialog}>
          <ListItemIcon><VisibilityIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {(selectedUser?.role !== 'Admin' || isSuperAdmin) && (
          <MenuItem onClick={handleOpenEditDialog}>
            <ListItemIcon><EditIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText>{selectedUser?.role === 'Admin' ? 'Edit Admin Info' : 'Edit Info'}</ListItemText>
          </MenuItem>
        )}
        {selectedUser?.status === 'Inactive' && String(selectedUser?._id) !== String(currentUser?._id) && !(selectedUser?.role === 'Admin' && !isSuperAdmin) && (
          <MenuItem onClick={() => setDeleteConfirmOpen(true)} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete Inactive </ListItemText>
          </MenuItem>
        )}
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
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-input': { cursor: 'not-allowed' } }}
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
