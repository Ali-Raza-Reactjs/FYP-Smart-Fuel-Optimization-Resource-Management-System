import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TableRow, TableCell, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusChip from '../../components/ui/StatusChip';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import { AuthContext } from '../../context/AuthContext';
import maintenanceService from '../../services/maintenance.service';
import vehicleService from '../../services/vehicle.service';
import { toast } from 'react-toastify';

const MaintenanceList = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, vehicleData] = await Promise.all([
          maintenanceService.getMaintenanceLogs(vehicleId),
          vehicleService.getVehicle(vehicleId)
        ]);
        setLogs(logsData);
        setVehicle(vehicleData);
      } catch (error) {
        toast.error('Failed to load maintenance data');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId, navigate]);

  const handleDeleteClick = (id) => {
    setSelectedLogId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLogId) return;
    try {
      await maintenanceService.deleteMaintenanceLog(selectedLogId);
      toast.success('Log deleted successfully');
      setLogs(logs.filter(log => log._id !== selectedLogId));
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
    setDeleteConfirmOpen(false);
  };

  if (loading) {
    return <PageLoader text="Loading maintenance logs..." />;
  }

  const canManage = user?.role === 'Admin' || user?.role === 'Manager';
  const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);

  return (
    <Box>
      <Box mb={3}>
        <Button variant="text" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => navigate('/vehicles')}>
          Back to Vehicles
        </Button>
      </Box>

      <PageHeader
        title="Maintenance Logs"
        subtitle={`${vehicle?.make || ''} ${vehicle?.model || ''} (${vehicle?.licensePlate || ''})`}
        action={
          <Box display="flex" alignItems="center" gap={3}>
            <Typography variant="h6" color="secondary" fontWeight="bold">
              Total Cost: ${totalCost.toFixed(2)}
            </Typography>
            {canManage && (
              <Button
                startIcon={<AddIcon />}
                component={RouterLink}
                to={`/vehicles/${vehicleId}/maintenance/new`}
              >
                Log Maintenance
              </Button>
            )}
          </Box>
        }
      />

      <DataTable
        columns={[
          { label: 'Date' },
          { label: 'Description' },
          { label: 'Performed By' },
          { label: 'Odometer' },
          { label: 'Cost' },
          { label: 'Status' },
          ...(canManage ? [{ label: 'Actions', align: 'center' }] : [])
        ]}
        showFilter={false} // No searching in this view currently
      >
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={canManage ? 7 : 6} align="center" sx={{ p: 0 }}>
              <EmptyState
                icon={BuildIcon}
                title="No maintenance records found"
                description="Keep your vehicle in top condition by logging maintenance tasks."
              />
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>
                {new Date(log.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {log.description}
                </Typography>
              </TableCell>
              <TableCell>{log.performedBy}</TableCell>
              <TableCell>{log.odometerReading} km</TableCell>
              <TableCell>${log.cost.toFixed(2)}</TableCell>
              <TableCell>
                <StatusChip status={log.status} />
              </TableCell>
              {canManage && (
                <TableCell align="center">
                  <IconButton component={RouterLink} to={`/vehicles/${vehicleId}/maintenance/edit/${log._id}`} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(log._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </DataTable>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Maintenance Log"
        content="Are you sure you want to delete this maintenance log? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirmText="Delete"
      />
    </Box>
  );
};

export default MaintenanceList;
