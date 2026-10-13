const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, addManager, toggleUserStatus, deleteUser } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/stats', verifyToken, authorizeRoles('admin', 'manager'), getDashboardStats);
router.get('/users', verifyToken, authorizeRoles('admin'), getUsers);
router.post('/managers', verifyToken, authorizeRoles('admin'), addManager);
router.put('/users/:id/status', verifyToken, authorizeRoles('admin'), toggleUserStatus);
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), deleteUser);

module.exports = router;
