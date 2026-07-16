import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Box, Card, CardContent, Dialog, DialogContent, DialogTitle, Grid, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import { AuthContext } from '../../context/AuthContext';
import fuelService from '../../services/fuel.service';
import vehicleService from '../../services/vehicle.service';

const FuelList = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState('');
  const { user } = useContext(AuthContext);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fuelData, vehicleData] = await Promise.all([
          fuelService.getFuelRecords(vehicleId),
          vehicleService.getVehicle(vehicleId)
        ]);
        setRecords(fuelData.records);
        setAnalytics(fuelData.analytics);
        setVehicle(vehicleData);
      } catch (error) {
        toast.error('Failed to load fuel data');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId, navigate]);

  const handleDeleteClick = (id) => {
    setSelectedRecordId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecordId) return;
    try {
      await fuelService.deleteFuelRecord(selectedRecordId);
      toast.success('Record deleted successfully');

      // Re-fetch to update analytics accurately
      const fuelData = await fuelService.getFuelRecords(vehicleId);
      setRecords(fuelData.records);
      setAnalytics(fuelData.analytics);
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
    setDeleteConfirmOpen(false);
  };

  const handleOpenReceipt = (imgUrl) => {
    setSelectedReceipt(`http://localhost:5000${imgUrl}`);
    setReceiptOpen(true);
  };

  const handleCloseReceipt = () => {
    setReceiptOpen(false);
    setSelectedReceipt('');
  };

  if (loading) {
    return <PageLoader text="Loading fuel records..." />;
  }

  const isDriver = user?.role === 'Driver';
  const canManage = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <Box>
      <Box mb={3}>
        <Button variant="text" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => navigate('/vehicles')}>
          Back to Vehicles
        </Button>
      </Box>

      <PageHeader
        title="Fuel Records & Analytics"
        subtitle={`${vehicle?.make || ''} ${vehicle?.model || ''} (${vehicle?.licensePlate || ''})`}
        action={
          <Button
            startIcon={<AddIcon />}
            component={RouterLink}
            to={`/vehicles/${vehicleId}/fuel/new`}
          >
            Log Fuel
          </Button>
        }
      />

      {/* Analytics Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Fuel Cost
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="primary">
                ${analytics?.totalCost.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Liters Pumped
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="secondary">
                {analytics?.totalLiters.toFixed(2) || '0.00'} L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Fill-Ups Tracked
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold">
                {analytics?.recordCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DataTable
            columns={[
              { label: 'Date' },
              { label: 'Driver' },
              { label: 'Odometer' },
              { label: 'Liters' },
              { label: 'Cost' },
              { label: 'Receipt', align: 'center' },
              ...(canManage ? [{ label: 'Actions', align: 'center' }] : [])
            ]}
            showFilter={false} // No searching in this view currently
          >
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} align="center" sx={{ p: 0 }}>
                  <EmptyState
                    icon={ReceiptIcon}
                    title="No fuel records found"
                    description="Log your first fuel fill-up for this vehicle."
                  />
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{record.driver?.name || 'Unknown'}</TableCell>
                  <TableCell>{record.odometerReading} km</TableCell>
                  <TableCell>{record.liters} L</TableCell>
                  <TableCell>${record.cost.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    {record.receiptImage ? (
                      <IconButton onClick={() => handleOpenReceipt(record.receiptImage)} color="info">
                        <ReceiptIcon />
                      </IconButton>
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell align="center">
                      <IconButton component={RouterLink} to={`/vehicles/${vehicleId}/fuel/edit/${record._id}`} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(record._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </DataTable>

          {/* Receipt Image Dialog */}
          <Dialog open={receiptOpen} onClose={handleCloseReceipt} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Receipt Image</DialogTitle>
            <DialogContent>
              {selectedReceipt && (
                <img src={selectedReceipt} alt="Receipt" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
              )}
            </DialogContent>
          </Dialog>

          <ConfirmDialog
            open={deleteConfirmOpen}
            title="Delete Fuel Record"
            content="Are you sure you want to delete this fuel record? This action cannot be undone."
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteConfirmOpen(false)}
            confirmText="Delete"
          />


        </Grid>
      </Grid>
    </Box>
  );
};

export default FuelList;
