import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, TableRow, TableCell, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusChip from '../../components/ui/StatusChip';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import { AuthContext } from '../../context/AuthContext';
import tripService from '../../services/trip.service';
import { toast } from 'react-toastify';

const TripList = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await tripService.getTrips();
      setTrips(data);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (trip) => {
    setSelectedTrip(trip);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTrip) return;
    try {
      await tripService.deleteTrip(selectedTrip._id);
      toast.success('Trip deleted successfully');
      setTrips(trips.filter(trip => trip._id !== selectedTrip._id));
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
    setDeleteConfirmOpen(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await tripService.updateTrip(id, {
        status: newStatus,
        ...(newStatus === 'Completed' ? { endTime: new Date().toISOString() } : {})
      });
      toast.success(`Trip marked as ${newStatus}`);
      fetchTrips();
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
    }
  };

  if (loading) {
    return <PageLoader text="Loading trips..." />;
  }

  const canManage = user?.role === 'Admin' || user?.role === 'Manager';

  const filteredTrips = trips.filter(t =>
    (t.startLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.endLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.vehicle?.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.driver?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Trip Management"
        subtitle="Track and manage vehicle journeys"
        action={
          <Button
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/trips/new"
          >
            Schedule Trip
          </Button>
        }
      />

      <DataTable
        columns={[
          { label: 'Start Time' },
          { label: 'Vehicle (Driver)' },
          { label: 'Route (Start → End)' },
          { label: 'Distance' },
          { label: 'Est. Fuel' },
          { label: 'Status' },
          { label: 'Actions', align: 'center' }
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search location, vehicle, driver..."
      >
        {filteredTrips.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} align="center" sx={{ p: 0 }}>
              <EmptyState
                icon={DirectionsCarIcon}
                title="No trips found"
                description={searchTerm ? "Try adjusting your search criteria" : "Get started by scheduling a new trip."}
              />
            </TableCell>
          </TableRow>
        ) : (
          filteredTrips.map((trip) => (
            <TableRow key={trip._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>
                {new Date(trip.startTime).toLocaleString()}
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="500">{trip.vehicle?.licensePlate}</Typography>
                <Typography variant="caption" color="text.secondary">{trip.driver?.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{trip.startLocation}</Typography>
                <Typography variant="body2" color="primary">↓</Typography>
                <Typography variant="body2">{trip.endLocation}</Typography>
              </TableCell>
              <TableCell>{trip.distance} km</TableCell>
              <TableCell>{trip.estimatedFuel} L</TableCell>
              <TableCell>
                <StatusChip status={trip.status} />
              </TableCell>
              <TableCell align="center">
                {/* Status quick actions for drivers/managers */}
                {trip.status === 'Scheduled' && (
                  <IconButton onClick={() => handleStatusChange(trip._id, 'In Transit')} color="warning" title="Start Trip">
                    <PlayCircleOutlinedIcon />
                  </IconButton>
                )}
                {trip.status === 'In Transit' && (
                  <IconButton onClick={() => handleStatusChange(trip._id, 'Completed')} color="success" title="Complete Trip">
                    <CheckCircleIcon />
                  </IconButton>
                )}

                <IconButton component={RouterLink} to={`/trips/edit/${trip._id}`} color="primary">
                  <EditIcon />
                </IconButton>
                {canManage && (
                  <IconButton onClick={() => handleDeleteClick(trip)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </DataTable>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Trip"
        content="Are you sure you want to delete this trip? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirmText="Delete"
      />
    </Box>
  );
};

export default TripList;
