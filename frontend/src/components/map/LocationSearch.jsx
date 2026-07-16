import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, List, ListItem, ListItemButton, ListItemText, ListItemIcon, CircularProgress, Paper, InputAdornment, ClickAwayListener } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';

const LocationSearch = ({ label, value, onChange, required, error, helperText }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Timeout for debouncing
  const timeoutRef = useRef(null);

  // Initialize searchTerm if a location string is provided (e.g. edit mode)
  useEffect(() => {
    if (value && typeof value === 'string' && !searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  const searchNominatim = async (query) => {
    if (!query || query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    // Clear previous value from parent to force re-selection if user types
    onChange({ name: val, lat: null, lng: null });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchNominatim(val);
    }, 500);
  };

  const handleSelect = (place) => {
    setSearchTerm(place.display_name);
    setOpen(false);
    onChange({
      name: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon)
    });
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          fullWidth
          label={label}
          value={searchTerm}
          onChange={handleInputChange}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null
          }}
          onClick={() => {
            if (results.length > 0) setOpen(true);
          }}
        />
        
        {(open && (results.length > 0 || loading)) && (
          <Paper 
            elevation={4} 
            sx={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              zIndex: 9999,
              mt: 0.5,
              maxHeight: 250,
              overflow: 'auto',
              borderRadius: 2
            }}
          >
            <List disablePadding>
              {loading ? (
                <ListItem sx={{ justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <ListItemText primary="Fetching locations..." />
                </ListItem>
              ) : (
                results.map((place) => (
                  <ListItemButton 
                    key={place.place_id} 
                    onClick={() => handleSelect(place)}
                    sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LocationOnIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={place.display_name} 
                      primaryTypographyProps={{ variant: 'body2', noWrap: false }}
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default LocationSearch;
