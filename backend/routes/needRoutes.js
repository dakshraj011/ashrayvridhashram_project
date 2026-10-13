const express = require('express');
const router = express.Router();
const { getNeeds, createNeed, updateNeed, deleteNeed } = require('../controllers/needController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getNeeds);
router.post('/', verifyToken, authorizeRoles('admin', 'manager'), createNeed);
router.put('/:id', verifyToken, authorizeRoles('admin', 'manager'), updateNeed);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteNeed);

module.exports = router;
