const express = require('express');
const router = express.Router();

// Import các routes
const userRoutes = require('./userRoutes');
const apartmentRoutes = require('./apartmentRoutes');
const residentRoutes = require('./residentRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const serviceReadingRoutes = require('./serviceReadingRoutes');
const incidentRoutes = require('./incidentRoutes');
const buildingRoutes = require('./buildingRoutes');
const serviceRoutes = require('./serviceRoutes');
const uploadRoutes = require('./uploadRoutes');

// Sử dụng các routes - English API paths
router.use('/users', userRoutes);
router.use('/apartments', apartmentRoutes);
router.use('/residents', residentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/service-readings', serviceReadingRoutes);
router.use('/incidents', incidentRoutes);
router.use('/buildings', buildingRoutes);
router.use('/services', serviceRoutes);
router.use('/upload', uploadRoutes);

// Route kiểm tra API
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Apartment Management API is running!',
        version: '2.0.0',
        endpoints: {
            users: '/api/users',
            apartments: '/api/apartments',
            residents: '/api/residents',
            invoices: '/api/invoices',
            serviceReadings: '/api/service-readings',
            incidents: '/api/incidents',
            buildings: '/api/buildings',
            services: '/api/services',
            upload: '/api/upload'
        }
    });
});

module.exports = router;
