const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, addManager, toggleUserStatus, deleteUser, syncMongoData, getMongoInfo } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/stats', verifyToken, authorizeRoles('admin', 'manager'), getDashboardStats);
router.get('/users', verifyToken, authorizeRoles('admin'), getUsers);
router.post('/managers', verifyToken, authorizeRoles('admin'), addManager);
router.put('/users/:id/status', verifyToken, authorizeRoles('admin'), toggleUserStatus);
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), deleteUser);

router.get('/mongo-status', verifyToken, authorizeRoles('admin'), getMongoInfo);
router.post('/sync-mongo', verifyToken, authorizeRoles('admin'), syncMongoData);

module.exports = router;

