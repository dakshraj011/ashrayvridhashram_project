const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, sendBroadcast } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/my', verifyToken, getMyNotifications);
router.put('/:id/read', verifyToken, markAsRead);
router.post('/broadcast', verifyToken, authorizeRoles('admin', 'manager'), sendBroadcast);

module.exports = router;
