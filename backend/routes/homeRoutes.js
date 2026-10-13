const express = require('express');
const router = express.Router();
const { getHomeInfo, updateHomeInfo } = require('../controllers/homeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/info', getHomeInfo);
router.put('/info', verifyToken, authorizeRoles('admin', 'manager'), updateHomeInfo);

module.exports = router;
