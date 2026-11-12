const estimateFuelLiters = (distanceKm, fuelEfficiencyKmPerLiter) => {
  const efficiency = Number(fuelEfficiencyKmPerLiter);
  if (!efficiency || efficiency <= 0 || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return null;
  }
  return Number((distanceKm / efficiency).toFixed(2));
};

const mapOsrmRoutes = (osrmRoutes, fuelEfficiencyKmPerLiter) => {
  const routes = (osrmRoutes || []).map((route) => {
    const distanceKm = route.distance / 1000;
    const estimatedDuration = Math.round(route.duration / 60);
    const estimatedFuel = estimateFuelLiters(distanceKm, fuelEfficiencyKmPerLiter);
    return {
      distance: Number(distanceKm.toFixed(2)),
      estimatedDuration,
      estimatedFuel,
      geometry: JSON.stringify(route.geometry),
    };
  }).filter((route) => route.estimatedFuel != null);

  if (routes.length === 0) return [];

  const cheapestFuel = Math.min(...routes.map((route) => route.estimatedFuel));
  return routes.map((route) => ({
    ...route,
    isRecommended: route.estimatedFuel === cheapestFuel,
  }));
};

const pickRoute = (routes, preferredGeometry) => {
  if (!routes.length) return null;
  if (preferredGeometry) {
    const match = routes.find((route) => route.geometry === preferredGeometry);
    if (match) return match;
  }
  return routes.find((route) => route.isRecommended) || routes[0];
};

module.exports = { estimateFuelLiters, mapOsrmRoutes, pickRoute };
