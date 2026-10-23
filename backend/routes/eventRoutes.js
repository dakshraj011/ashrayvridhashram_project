const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  addGalleryImage,
  deleteGalleryImage
} = require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getEvents);
router.post('/', verifyToken, authorizeRoles('admin', 'manager'), createEvent);
router.put('/:id', verifyToken, authorizeRoles('admin', 'manager'), updateEvent);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteEvent);

// Gallery endpoints
router.post('/gallery', verifyToken, authorizeRoles('admin', 'manager'), addGalleryImage);
router.delete('/gallery/:id', verifyToken, authorizeRoles('admin', 'manager'), deleteGalleryImage);

module.exports = router;
