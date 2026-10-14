const express = require('express');
const router = express.Router();
const {
  createMealRequest,
  getMyMealRequests,
  getAllMealRequests,
  updateMealStatus,
  deleteMealRequest,
  getBookedSlots
} = require('../controllers/mealController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', optionalToken, createMealRequest);
router.get('/booked-slots', getBookedSlots);
router.get('/my', verifyToken, getMyMealRequests);
router.get('/', verifyToken, authorizeRoles('admin', 'manager'), getAllMealRequests);
router.put('/:id/status', verifyToken, authorizeRoles('admin', 'manager'), updateMealStatus);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteMealRequest);

module.exports = router;

