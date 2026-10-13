const express = require('express');
const router = express.Router();
const { registerVolunteer, getMyVolunteers, getAllVolunteers, updateVolunteerStatus, deleteVolunteer } = require('../controllers/volunteerController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', optionalToken, registerVolunteer);
router.get('/my', verifyToken, getMyVolunteers);
router.get('/', verifyToken, authorizeRoles('admin', 'manager'), getAllVolunteers);
router.put('/:id/status', verifyToken, authorizeRoles('admin', 'manager'), updateVolunteerStatus);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteVolunteer);

module.exports = router;

