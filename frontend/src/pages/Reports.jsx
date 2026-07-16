import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import DownloadIcon from '@mui/icons-material/Download';
import reportService from '../services/report.service';
import { toast } from 'react-toastify';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.warning('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.warning('Start date cannot be after end date');
      return;
    }

    try {
      setLoading(true);
      await reportService.exportFinancialReport(startDate, endDate);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Financial Reports"
        subtitle="Export organizational spending (Fuel & Maintenance) to CSV"
      />

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Generate Financial Report
        </Typography>
        <Box component="form" onSubmit={handleExport} sx={{ mt: 3 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="startDate"
                label="Start Date"
                name="startDate"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="endDate"
                label="End Date"
                name="endDate"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<DownloadIcon />}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Download CSV'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Reports;
