import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Box } from '@mui/material';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-fit map bounds
const MapFitter = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

const RouteMap = ({ startCoords, endCoords, geometryString, height = '400px' }) => {
  const [routePositions, setRoutePositions] = useState([]);
  const [bounds, setBounds] = useState([]);

  useEffect(() => {
    if (geometryString) {
      try {
        const geojson = typeof geometryString === 'string' ? JSON.parse(geometryString) : geometryString;
        if (geojson && geojson.coordinates) {
          // GeoJSON returns [lng, lat], Leaflet Polyline expects [lat, lng]
          const positions = geojson.coordinates.map(coord => [coord[1], coord[0]]);
          setRoutePositions(positions);
          
          if (positions.length > 0) {
            // Calculate bounds from all route points
            const lats = positions.map(p => p[0]);
            const lngs = positions.map(p => p[1]);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            setBounds([[minLat, minLng], [maxLat, maxLng]]);
          }
        }
      } catch (err) {
        console.error("Failed to parse route geometry", err);
      }
    } else if (startCoords && endCoords) {
      // Just fit to markers if no route
      setBounds([
        [startCoords.lat, startCoords.lng],
        [endCoords.lat, endCoords.lng]
      ]);
    } else if (startCoords) {
      setBounds([[startCoords.lat, startCoords.lng]]);
    }
  }, [geometryString, startCoords, endCoords]);

  // Default center (e.g. New York or any central point) if nothing is provided
  const center = startCoords ? [startCoords.lat, startCoords.lng] : [40.7128, -74.0060];
  const zoom = startCoords ? 13 : 4;

  return (
    <Box sx={{ height, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {startCoords && (
          <Marker position={[startCoords.lat, startCoords.lng]}>
            <Popup>Start Location</Popup>
          </Marker>
        )}
        
        {endCoords && (
          <Marker position={[endCoords.lat, endCoords.lng]}>
            <Popup>End Location</Popup>
          </Marker>
        )}
        
        {routePositions.length > 0 && (
          <Polyline positions={routePositions} color="#1976d2" weight={4} opacity={0.8} />
        )}

        <MapFitter bounds={bounds.length > 0 ? bounds : null} />
      </MapContainer>
    </Box>
  );
};

export default RouteMap;
