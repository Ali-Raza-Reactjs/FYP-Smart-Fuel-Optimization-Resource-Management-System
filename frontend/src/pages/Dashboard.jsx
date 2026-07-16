import React, { useState, useEffect, useContext } from 'react';
import { Typography, Box, Grid, Card, CardContent, CircularProgress, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar, useTheme, Skeleton } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import dashboardService from '../services/dashboard.service';
import { toast } from 'react-toastify';
import EmptyState from '../components/ui/EmptyState';
import BusinessIcon from '@mui/icons-material/Business';
import { Link as RouterLink } from 'react-router-dom';
import Button from '../components/ui/Button';
import RouteMap from '../components/map/RouteMap';
// Modern KPI Card Component
const StatCard = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: color }} />
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="subtitle2" fontWeight={600} textTransform="uppercase" letterSpacing={0.5} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
          </Box>
          <Box sx={{
            backgroundColor: `${color}1A`,
            color: color,
            p: 1.5,
            borderRadius: 2,
            display: 'flex'
          }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" color="success.main" fontWeight={600}>
              {trend}
            </Typography>
            <Typography variant="caption" color="text.tertiary">
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager';

  const renderSkeletons = () => (
    <Grid container spacing={2}>
      {[1, 2, 3, 4].map(i => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
          <Skeleton variant="rounded" height={140} />
        </Grid>
      ))}
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="rounded" height={400} />
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.name}! Here is your fleet's status for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.
        </Typography>
      </Box>

      {loading || !stats ? renderSkeletons() : (
        isAdminOrManager ? (
          // Admin / Manager View
          stats.hasOrganization === false ? (
            <Box sx={{ mt: 4 }}>
              <Card elevation={0} sx={{ p: 4, borderRadius: 2 }}>
                <EmptyState
                  icon={BusinessIcon}
                  title="No Organization Assigned"
                  description="You currently don't belong to any organization. Please create an organization to start managing your fleet, vehicles, and budgets."
                  action={
                    <Button variant="contained" component={RouterLink} to="/organizations">
                      Manage Organizations
                    </Button>
                  }
                />
              </Card>
            </Box>
          ) : (
            <>
              <Grid container spacing={2} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Active Vehicles"
                    value={`${stats?.activeVehicles || 0} / ${stats?.totalVehicles || 0}`}
                    icon={<DirectionsCarIcon />}
                    color={theme.palette.primary.main}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Total Drivers"
                    value={stats?.totalDrivers || 0}
                    icon={<PersonIcon />}
                    color={theme.palette.secondary.main}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Active Trips"
                    value={stats?.activeTrips || 0}
                    icon={<RouteIcon />}
                    color={theme.palette.info.main}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="MTD Spend"
                    value={`$${(stats?.currentMonthSpend ?? 0).toFixed(2)}`}
                    icon={<AttachMoneyIcon />}
                    color={theme.palette.error.main}
                    trend="+12%"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: stats?.latestTrip ? 8 : 12 }}>
                  <Card elevation={0} sx={{ p: 0, overflow: 'hidden', height: '100%' }}>
                    <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          6-Month Spend History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total fuel and maintenance costs over time
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ width: '100%', height: 400, p: 3 }}>
                      <ResponsiveContainer>
                        <BarChart data={stats?.historicalSpend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            cursor={{ fill: theme.palette.action.hover }}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                            formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
                          />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                          <Bar dataKey="fuel" name="Fuel Costs" stackId="a" fill={theme.palette.primary.main} radius={[0, 0, 4, 4]} barSize={40} />
                          <Bar dataKey="maintenance" name="Maintenance Costs" stackId="a" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Card>
                </Grid>

                {stats?.latestTrip && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          Latest Planned Trip
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {stats.latestTrip.startLocation} &rarr; {stats.latestTrip.endLocation}
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1, minHeight: 250, p: 2 }}>
                        <RouteMap
                          startCoords={stats.latestTrip.startCoordinates?.lat ? stats.latestTrip.startCoordinates : null}
                          endCoords={stats.latestTrip.endCoordinates?.lat ? stats.latestTrip.endCoordinates : null}
                          geometryString={stats.latestTrip.routeGeometry}
                          height="100%"
                        />
                      </Box>
                      <Box sx={{ p: 2, backgroundColor: 'background.default', borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2"><strong>Driver:</strong> {stats.latestTrip.driver?.name || 'Unassigned'}</Typography>
                        <Typography variant="body2"><strong>Vehicle:</strong> {stats.latestTrip.vehicle?.make} {stats.latestTrip.vehicle?.model} ({stats.latestTrip.vehicle?.licensePlate})</Typography>
                        <Typography variant="body2"><strong>Distance:</strong> {stats.latestTrip.distance} km</Typography>
                        <Typography variant="body2"><strong>Est. Fuel:</strong> {stats.latestTrip.estimatedFuel} L</Typography>
                      </Box>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </>
          )
        ) : (
          // Driver View
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ height: '100%', borderTop: `4px solid ${theme.palette.primary.main}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" textTransform="uppercase" color="text.secondary" gutterBottom letterSpacing={0.5}>
                    My Assigned Vehicle
                  </Typography>

                  {stats.assignedVehicle ? (
                    <Box sx={{ mt: 3, p: 3, backgroundColor: 'background.default', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Box sx={{ backgroundColor: 'primary.main', color: '#fff', p: 1.5, borderRadius: 2, mr: 2, display: 'flex' }}>
                          <DirectionsCarIcon />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">{stats.assignedVehicle.make} {stats.assignedVehicle.model}</Typography>
                          <Typography color="text.secondary" variant="body2">{stats.assignedVehicle.licensePlate}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 3, p: 4, textAlign: 'center', backgroundColor: 'background.default', borderRadius: 2, border: `1px dashed ${theme.palette.divider}` }}>
                      <Typography color="text.secondary">No vehicle assigned currently.</Typography>
                    </Box>
                  )}

                  <Box mt={4}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom letterSpacing={0.5}>
                      Month-to-Date Fuel
                    </Typography>
                    <Box display="flex" alignItems="baseline" mt={1} gap={1}>
                      <Typography variant="h3" fontWeight="bold" color="text.primary">
                        {(stats.monthlyFuel?.totalLiters ?? 0).toFixed(1)}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">Liters</Typography>
                    </Box>
                    <Typography variant="body2" color="error.main" fontWeight={600} sx={{ mt: 1 }}>
                      Total Cost: ${(stats.monthlyFuel?.totalCost ?? 0).toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Upcoming & Active Trips
                  </Typography>
                </Box>

                {stats.trips && stats.trips.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {stats.trips.map((trip, index) => (
                      <ListItem
                        key={trip._id}
                        divider={index !== stats.trips.length - 1}
                        sx={{ p: 3, '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{
                            bgcolor: trip.status === 'In Transit' ? 'warning.light' : 'info.light',
                            color: trip.status === 'In Transit' ? 'warning.dark' : 'info.dark',
                            width: 48,
                            height: 48,
                            mr: 2
                          }}>
                            <RouteIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {trip.startLocation} &rarr; {trip.endLocation}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {new Date(trip.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          }
                        />
                        <Box sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 4,
                          bgcolor: trip.status === 'In Transit' ? 'warning.light' : 'info.light',
                          color: trip.status === 'In Transit' ? 'warning.dark' : 'info.dark',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          {trip.status}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <EmptyState
                    icon={RouteIcon}
                    title="No upcoming trips"
                    description="You have no upcoming trips scheduled."
                  />
                )}
              </Card>
            </Grid>
          </Grid>
        )
      )}
    </Box>
  );
};

export default Dashboard;
