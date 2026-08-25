const fs = require('fs');
const path = require('path');

const dir = 'd:/Ali Raza/FYP/frontend/src';

const filesToReplace = [
  {
    file: 'routes/ProtectedRoutes.jsx',
    find: '<Box display="flex" justifyContent="center" alignItems="center" height="100vh">',
    replace: '<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>'
  },
  {
    file: 'pages/Vehicles/VehicleForm.jsx',
    find: '<Box display="flex" justifyContent="center" alignItems="center" height="100vh">',
    replace: '<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>'
  },
  {
    file: 'pages/Trips/TripForm.jsx',
    find: '<Box display="flex" justifyContent="center" alignItems="center" height="100vh">',
    replace: '<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>'
  },
  {
    file: 'pages/Organizations/OrganizationForm.jsx',
    find: '<Box display="flex" justifyContent="center" alignItems="center" height="100vh">',
    replace: '<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>'
  },
  {
    file: 'pages/Maintenance/MaintenanceList.jsx',
    find: '<Box display="flex" alignItems="center" gap={3}>',
    replace: '<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>'
  },
  {
    file: 'pages/Maintenance/MaintenanceForm.jsx',
    find: '<Box display="flex" justifyContent="center" alignItems="center" height="100vh">',
    replace: '<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>'
  },
  {
    file: 'pages/Fuel/FuelForm.jsx',
    find: '<Box display="flex" justifyContent="center" alignItems="center" height="100vh">',
    replace: '<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>'
  },
  {
    file: 'pages/Dashboard.jsx',
    find: '<Box display="flex" alignItems="center" mb={2}>',
    replace: '<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>'
  },
  {
    file: 'pages/Dashboard.jsx',
    find: '<Box display="flex" alignItems="baseline" mt={1} gap={1}>',
    replace: '<Box sx={{ display: "flex", alignItems: "baseline", mt: 1, gap: 1 }}>'
  },
  {
    file: 'pages/Budgets/BudgetForm.jsx',
    find: '<Box display="flex" justifyContent="center" alignItems="center" height="100vh">',
    replace: '<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>'
  }
];

filesToReplace.forEach(({ file, find, replace }) => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(find, replace);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed:', file);
  } else {
    console.log('File not found:', filePath);
  }
});
