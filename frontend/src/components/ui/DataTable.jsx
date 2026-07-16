import React from 'react';
import {
  Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Box, TextField, InputAdornment, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * Enterprise standardized Data Table component
 * Wraps MUI Table with consistent card styling, optional search bar, and standardized table head/body.
 */
const DataTable = ({
  columns,
  children,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  showFilter = true,
  onFilterClick
}) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      {/* Table Toolbar */}
      {(onSearchChange !== undefined || showFilter) && (
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          {onSearchChange !== undefined && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ width: { xs: '100%', sm: 320 }, bgcolor: 'background.paper', borderRadius: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          {showFilter && (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FilterListIcon />}
              size="small"
              onClick={onFilterClick}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Filter
            </Button>
          )}
        </Box>
      )}

      {/* Table */}
      <TableContainer>
        <Table sx={{ minWidth: 700 }} aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx} align={col.align || 'left'} sx={col.sx}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default DataTable;
