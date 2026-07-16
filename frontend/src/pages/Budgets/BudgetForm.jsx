import { Box, CircularProgress, Container, Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import budgetService from '../../services/budget.service';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const BudgetForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const currentDate = new Date();
  const [formData, setFormData] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    totalLimit: '',
    alertThreshold: 80
  });
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const budget = await budgetService.getBudget(id);
        setFormData({
          month: budget.month,
          year: budget.year,
          totalLimit: budget.totalLimit,
          alertThreshold: budget.alertThreshold
        });
      } catch (error) {
        toast.error('Failed to load budget data');
        navigate('/budgets');
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchBudget();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await budgetService.updateBudget(id, formData);
        toast.success('Budget updated successfully');
      } else {
        await budgetService.createBudget(formData);
        toast.success('Budget created successfully');
      }
      navigate('/budgets');
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

  // Generate array of years (current year and next 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(6), (val, index) => currentYear + index);

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          {isEditMode ? 'Edit Budget' : 'Set New Budget'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                required
                id="month"
                label="Month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                disabled={isEditMode}
                options={monthNames.map((name, index) => ({ value: index + 1, label: name }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                required
                id="year"
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                disabled={isEditMode}
                options={years.map(year => ({ value: year, label: year.toString() }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="totalLimit"
                label="Total Budget Limit ($)"
                name="totalLimit"
                type="number"
                inputProps={{ step: "100", min: "0" }}
                value={formData.totalLimit}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="alertThreshold"
                label="Alert Threshold (%)"
                name="alertThreshold"
                type="number"
                inputProps={{ step: "1", min: "1", max: "100" }}
                value={formData.alertThreshold}
                onChange={handleChange}
                helperText="Percentage at which UI displays a warning"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/budgets')}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Update Budget' : 'Save Budget'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BudgetForm;
