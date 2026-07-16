import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Card, CardContent, Grid, IconButton, LinearProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import budgetService from '../../services/budget.service';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedBudgetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBudgetId) return;
    try {
      await budgetService.deleteBudget(selectedBudgetId);
      toast.success('Budget deleted successfully');
      setBudgets(budgets.filter(budget => budget._id !== selectedBudgetId));
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
    setDeleteConfirmOpen(false);
  };

  if (loading) {
    return <PageLoader text="Loading budgets..." />;
  }

  return (
    <Box>
      <PageHeader
        title="Budget Management"
        subtitle="Track monthly spending against organizational limits"
        action={
          <Button
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/budgets/new"
          >
            Set New Budget
          </Button>
        }
      />

      {budgets.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <EmptyState
            icon={AccountBalanceWalletIcon}
            title="No budgets found"
            description="Create your first budget to start tracking expenses."
          />
        </Card>
      ) : (
        <Grid container spacing={2}>
          {budgets.map((budget) => {
            const spendPercentage = (budget.actualSpend / budget.totalLimit) * 100;
            const isOverBudget = spendPercentage >= 100;
            const isWarning = spendPercentage >= budget.alertThreshold && !isOverBudget;

            let barColor = 'primary';
            if (isOverBudget) barColor = 'error';
            else if (isWarning) barColor = 'warning';

            return (
              <Grid size={{ xs: 12, md: 6 }} key={budget._id}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton component={RouterLink} to={`/budgets/edit/${budget._id}`} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(budget._id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ pt: 3 }}>
                    <Typography variant="h5" component="div" fontWeight="bold" gutterBottom>
                      {monthNames[budget.month - 1]} {budget.year}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" mt={3} mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Actual Spend
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Limit
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="h6" fontWeight="bold" color={isOverBudget ? 'error.main' : 'text.primary'}>
                        ${budget.actualSpend.toFixed(2)}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        ${budget.totalLimit.toFixed(2)}
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(spendPercentage, 100)}
                      color={barColor}
                      sx={{ height: 10, borderRadius: 5, mb: 1 }}
                    />

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {spendPercentage.toFixed(1)}% Used
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Alert at {budget.alertThreshold}%
                      </Typography>
                    </Box>

                    {isOverBudget && (
                      <Typography variant="body2" color="error.main" fontWeight="bold" sx={{ mt: 2 }}>
                        Warning: Budget Exceeded by ${(budget.actualSpend - budget.totalLimit).toFixed(2)}
                      </Typography>
                    )}
                    {isWarning && (
                      <Typography variant="body2" color="warning.main" fontWeight="bold" sx={{ mt: 2 }}>
                        Caution: Approaching Budget Limit
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Budget"
        content="Are you sure you want to delete this budget? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirmText="Delete"
      />
    </Box>
  );
};

export default BudgetList;
