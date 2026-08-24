import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography, Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Chip, Avatar, Tooltip,
  InputAdornment, Menu, MenuItem, ListItemIcon, ListItemText,
  Divider
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { AuthContext } from '../../context/AuthContext';
import vehicleService from '../../services/vehicle.service';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusChip from '../../components/ui/StatusChip';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  // Action Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = async () => {
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenMenu = (event, vehicle) => {
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicle);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    setDeleting(true);
    try {
      await vehicleService.deleteVehicle(selectedVehicle._id);
      toast.success('Vehicle deleted successfully');
      setVehicles(vehicles.filter(v => v._id !== selectedVehicle._id));
      setDeleteConfirmOpen(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    } finally {
      setDeleting(false);
      handleCloseMenu();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Maintenance': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return <PageLoader text="Loading vehicles..." />;
  }

  const canManage = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Individual';

  const filteredVehicles = vehicles.filter(v =>
    (v.registrationNumber || v.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.manufacturer || v.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.vehicleName || v.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.driver?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Vehicles"
        subtitle="Manage your fleet, track maintenance, and monitor fuel consumption."
        action={canManage && (
          <Button
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/vehicles/new"
          >
            Add Vehicle
          </Button>
        )}
      />

      <DataTable
        columns={user?.role === 'Admin' ? [
          { label: 'Vehicle Details' },
          { label: 'Owner' },
          { label: 'Assigned Driver' },
          { label: 'Odometer' },
          { label: 'Status' },
          { label: 'Actions', align: 'right' }
        ] : [
          { label: 'Vehicle Details' },
          { label: 'Assigned Driver' },
          { label: 'Odometer' },
          { label: 'Status' },
          { label: 'Actions', align: 'right' }
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search license/reg number, name, driver..."
      >
        {filteredVehicles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={user?.role === 'Admin' ? 6 : 5} align="center" sx={{ p: 0 }}>
              <EmptyState
                icon={DirectionsCarIcon}
                title="No vehicles found"
                description={searchTerm ? "Try adjusting your search criteria" : "Get started by adding a new vehicle."}
              />
            </TableCell>
          </TableRow>
        ) : (
          filteredVehicles.map((vehicle) => (
            <TableRow
              key={vehicle._id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', borderRadius: 2 }}>
                    <DirectionsCarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {vehicle.registrationNumber || vehicle.licensePlate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vehicle.manufacturer || vehicle.make} {vehicle.vehicleName || vehicle.model} ({vehicle.modelYear || vehicle.year})
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              {user?.role === 'Admin' && (
                <TableCell>
                  {vehicle.owner ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                        {vehicle.owner.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight="500">
                        {vehicle.owner.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled" fontStyle="italic">
                      System
                    </Typography>
                  )}
                </TableCell>
              )}
              <TableCell>
                {vehicle.driver ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {vehicle.driver.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="500">
                      {vehicle.driver.name}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled" fontStyle="italic">
                    Unassigned
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {(vehicle.currentOdometer || 0).toLocaleString()} km
                </Typography>
              </TableCell>
              <TableCell>
                <StatusChip status={vehicle.status} />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => handleOpenMenu(e, vehicle)} size="small">
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        )}
      </DataTable>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{ elevation: 3, sx: { width: 200, borderRadius: 2, mt: 1 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={RouterLink} to={`/vehicles/${selectedVehicle?._id}/fuel`} onClick={handleCloseMenu}>
          <ListItemIcon><LocalGasStationIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Fuel Logs</ListItemText>
        </MenuItem>
        <MenuItem component={RouterLink} to={`/vehicles/${selectedVehicle?._id}/maintenance`} onClick={handleCloseMenu}>
          <ListItemIcon><BuildIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Maintenance</ListItemText>
        </MenuItem>

        {canManage && [
          <Divider key="divider" />,
          <MenuItem key="edit" component={RouterLink} to={`/vehicles/edit/${selectedVehicle?._id}`} onClick={handleCloseMenu}>
            <ListItemIcon><EditIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText>Edit Vehicle</ListItemText>
          </MenuItem>,
          <MenuItem key="delete" onClick={() => setDeleteConfirmOpen(true)} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        ]}
      </Menu>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Vehicle"
        content={`Are you sure you want to delete ${selectedVehicle?.licensePlate || selectedVehicle?.registrationNumber}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirmText="Delete"
        loading={deleting}
      />
    </Box>
  );
};

export default VehicleList;
