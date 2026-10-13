const express = require('express');
const router = express.Router();
const { createAssistanceRequest, getMyAssistanceRequests, getAllAssistanceRequests, updateAssistanceStatus, deleteAssistanceRequest } = require('../controllers/assistanceController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', optionalToken, createAssistanceRequest);
router.get('/my', verifyToken, getMyAssistanceRequests);
router.get('/', verifyToken, authorizeRoles('admin', 'manager'), getAllAssistanceRequests);
router.put('/:id/status', verifyToken, authorizeRoles('admin', 'manager'), updateAssistanceStatus);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteAssistanceRequest);

module.exports = router;

