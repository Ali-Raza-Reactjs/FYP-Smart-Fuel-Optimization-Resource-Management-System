import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import Select from '../../components/ui/Select';
import { AuthContext } from '../../context/AuthContext';
import tripService from '../../services/trip.service';
import vehicleService from '../../services/vehicle.service';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LocationSearch from '../../components/map/LocationSearch';
import RouteMap from '../../components/map/RouteMap';

const TripForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    vehicle: '',
    startLocation: '',
    startCoordinates: { lat: null, lng: null },
    endLocation: '',
    endCoordinates: { lat: null, lng: null },
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    distance: '',
    estimatedFuel: '',
    estimatedDuration: '',
    routeGeometry: '',
    status: 'Scheduled'
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vehiclesData = await vehicleService.getVehicles();
        setVehicles(vehiclesData);

        if (isEditMode) {
          const trip = await tripService.getTrip(id);
          setFormData({
            vehicle: trip.vehicle._id,
            startLocation: trip.startLocation,
            startCoordinates: trip.startCoordinates || { lat: null, lng: null },
            endLocation: trip.endLocation,
            endCoordinates: trip.endCoordinates || { lat: null, lng: null },
            startTime: new Date(trip.startTime).toISOString().slice(0, 16),
            endTime: trip.endTime ? new Date(trip.endTime).toISOString().slice(0, 16) : '',
            distance: trip.distance,
            estimatedFuel: trip.estimatedFuel,
            estimatedDuration: trip.estimatedDuration || '',
            routeGeometry: trip.routeGeometry || '',
            status: trip.status
          });
        }
      } catch (error) {
        toast.error('Failed to load data');
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (type, data) => {
    setFormData({
      ...formData,
      [`${type}Location`]: data.name,
      [`${type}Coordinates`]: { lat: data.lat, lng: data.lng }
    });
  };

  const handleCalculateRoute = async () => {
    if (!formData.startCoordinates.lat || !formData.endCoordinates.lat || !formData.vehicle) {
      toast.warning('Please select valid start/end locations from the dropdown and a vehicle.');
      return;
    }

    setCalculatingRoute(true);
    try {
      const response = await api.post('/routes/optimize', {
        startCoordinates: formData.startCoordinates,
        endCoordinates: formData.endCoordinates,
        vehicleId: formData.vehicle
      });

      const { distance, estimatedDuration, estimatedFuel, geometry } = response.data;

      setFormData(prev => ({
        ...prev,
        distance,
        estimatedDuration,
        estimatedFuel,
        routeGeometry: geometry
      }));

      toast.success('Route optimized successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to calculate route.');
    } finally {
      setCalculatingRoute(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.distance) {
      toast.warning('Please calculate the route before submitting.');
      return;
    }

    try {
      if (isEditMode) {
        await tripService.updateTrip(id, formData);
        toast.success('Trip updated successfully');
      } else {
        await tripService.createTrip(formData);
        toast.success('Trip scheduled successfully');
      }
      navigate('/trips');
    } catch (error) {
      const message = error.response?.data?.message || 'Action failed';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          {isEditMode ? 'Edit Trip & Route' : 'Schedule Trip & Optimize Route'}
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Select
                    required
                    id="vehicle"
                    label="Vehicle"
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select a vehicle' },
                      ...vehicles.map(v => ({ value: v._id, label: `${v.make} ${v.model} (${v.licensePlate})` }))
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <LocationSearch
                    required
                    label="Start Location"
                    value={formData.startLocation}
                    onChange={(data) => handleLocationChange('start', data)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <LocationSearch
                    required
                    label="Destination"
                    value={formData.endLocation}
                    onChange={(data) => handleLocationChange('end', data)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={handleCalculateRoute}
                    disabled={calculatingRoute}
                  >
                    {calculatingRoute ? 'Calculating...' : 'Optimize Route & Calculate Fuel'}
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    disabled
                    id="distance"
                    label="Distance (km)"
                    value={formData.distance}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    disabled
                    id="estimatedDuration"
                    label="Est. Duration (mins)"
                    value={formData.estimatedDuration}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    disabled
                    id="estimatedFuel"
                    label="Estimated Fuel (Liters)"
                    value={formData.estimatedFuel}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    required
                    id="startTime"
                    label="Start Time"
                    name="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={handleChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Select
                    id="status"
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={['Scheduled', 'In Transit', 'Completed', 'Cancelled']}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" color="inherit" onClick={() => navigate('/trips')}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? 'Update Trip' : 'Create Trip'}
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ height: '100%', minHeight: 500, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Route Preview
              </Typography>
              <RouteMap
                startCoords={formData.startCoordinates.lat ? formData.startCoordinates : null}
                endCoords={formData.endCoordinates.lat ? formData.endCoordinates : null}
                geometryString={formData.routeGeometry}
                height="100%"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container >
  );
};

export default TripForm;
