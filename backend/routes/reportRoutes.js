const express = require('express');
const router = express.Router();
const { getReportSummary } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/summary', verifyToken, authorizeRoles('admin', 'manager'), getReportSummary);

module.exports = router;
