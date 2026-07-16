import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TableRow, TableCell, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import { AuthContext } from '../../context/AuthContext';
import orgService from '../../services/org.service';
import { toast } from 'react-toastify';

const OrganizationList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrganizations = async () => {
    try {
      const data = await orgService.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleDeleteClick = (id) => {
    setSelectedOrgId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrgId) return;
    try {
      await orgService.deleteOrganization(selectedOrgId);
      toast.success('Organization deleted successfully');
      setOrganizations(organizations.filter(org => org._id !== selectedOrgId));
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
    setDeleteConfirmOpen(false);
  };

  if (loading) {
    return <PageLoader text="Loading organizations..." />;
  }

  const isAdmin = user?.role === 'Admin';

  const filteredOrganizations = organizations.filter(org =>
    (org.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.contactEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Organizations"
        subtitle="Manage business units and sub-organizations"
        action={
          isAdmin && (
            <Button
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/organizations/new"
            >
              Add Organization
            </Button>
          )
        }
      />

      <DataTable
        columns={[
          { label: 'Name' },
          { label: 'Contact Email' },
          { label: 'Contact Phone' },
          { label: 'Address' },
          ...(isAdmin ? [{ label: 'Actions', align: 'center' }] : [])
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search organizations..."
      >
        {filteredOrganizations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ p: 0 }}>
              <EmptyState
                icon={BusinessIcon}
                title="No organizations found"
                description={searchTerm ? "Try adjusting your search query." : "Add a new organization to get started."}
              />
            </TableCell>
          </TableRow>
        ) : (
          filteredOrganizations.map((org) => (
            <TableRow key={org._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                {org.name}
              </TableCell>
              <TableCell>{org.contactEmail}</TableCell>
              <TableCell>{org.contactPhone}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {org.address}
                </Typography>
              </TableCell>
              {isAdmin && (
                <TableCell align="center">
                  <IconButton component={RouterLink} to={`/organizations/edit/${org._id}`} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(org._id)} color="error">
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
        title="Delete Organization"
        content="Are you sure you want to delete this organization? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirmText="Delete"
      />
    </Box>
  );
};

export default OrganizationList;
