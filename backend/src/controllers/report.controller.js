const { ApiResponseModel } = require("../utils/classes");
const FuelRecord = require('../models/FuelRecord');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

// @desc    Export financial report as CSV
// @route   GET /api/reports/export
// @access  Private (Admin/Manager/Individual)
exports.exportFinancialReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400);
      throw new Error('Please provide startDate and endDate');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that the dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400);
      throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
    }

    if (start > end) {
      res.status(400);
      throw new Error('startDate cannot be after endDate.');
    }
    
    // Set end to the end of the day if it's just a date
    end.setHours(23, 59, 59, 999);

    // Determine vehicle filter based on user role
    let vehicleFilter = {};
    if (req.user.role === 'Individual') {
      vehicleFilter = { owner: req.user._id };
    } else if (req.user.role === 'Manager') {
      if (req.user.organization) {
        vehicleFilter = { organization: req.user.organization };
      }
    } else if (req.user.role === 'Admin') {
      if (req.query.organizationId) {
        vehicleFilter = { organization: req.query.organizationId };
      } else if (req.user.organization) {
        vehicleFilter = { organization: req.user.organization };
      }
      // If Admin has no organization specified, they export report for all vehicles
    }

    // Get all vehicles matching filter
    const vehicles = await Vehicle.find(vehicleFilter).select('_id licensePlate registrationNumber make model vehicleName');
    const vehicleIds = vehicles.map(v => v._id);
    const vehicleMap = {};
    vehicles.forEach(v => {
      const reg = v.registrationNumber || v.licensePlate || 'N/A';
      const name = v.vehicleName || `${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle';
      vehicleMap[v._id.toString()] = `${name} (${reg})`;
    });

    // Fetch Fuel Records
    const fuelRecords = await FuelRecord.find({
      vehicle: { $in: vehicleIds },
      date: { $gte: start, $lte: end }
    }).populate('driver', 'name');

    // Fetch Maintenance Records
    const maintenanceRecords = await Maintenance.find({
      vehicle: { $in: vehicleIds },
      date: { $gte: start, $lte: end }
    });

    // Build CSV Content
    let csvContent = 'Date,Type,Vehicle,Description/Driver,Cost ($)\n';
    
    let totalFuel = 0;
    let totalMaintenance = 0;

    // Process Fuel
    fuelRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      const type = 'Fuel';
      const vehicleStr = vehicleMap[record.vehicle.toString()] || 'Unknown';
      const desc = `Driver: ${record.driver?.name || 'N/A'}, Liters: ${record.liters}`;
      const cost = Number(record.cost || 0).toFixed(2);
      totalFuel += Number(record.cost || 0);

      // Escape quotes for CSV
      csvContent += `"${date}","${type}","${vehicleStr}","${desc}","${cost}"\n`;
    });

    // Process Maintenance
    maintenanceRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      const type = 'Maintenance';
      const vehicleStr = vehicleMap[record.vehicle.toString()] || 'Unknown';
      const desc = `By: ${record.performedBy || 'N/A'}, Desc: ${(record.description || '').replace(/"/g, '""')}`;
      const cost = Number(record.cost || 0).toFixed(2);
      totalMaintenance += Number(record.cost || 0);

      csvContent += `"${date}","${type}","${vehicleStr}","${desc}","${cost}"\n`;
    });

    // Summary Rows
    csvContent += `\n"","","","Total Fuel Cost","${totalFuel.toFixed(2)}"\n`;
    csvContent += `"","","","Total Maintenance Cost","${totalMaintenance.toFixed(2)}"\n`;
    csvContent += `"","","","GRAND TOTAL","${(totalFuel + totalMaintenance).toFixed(2)}"\n`;

    // Send File
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="financial_report_${startDate}_to_${endDate}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    next(error);
  }
};
