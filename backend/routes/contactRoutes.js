const express = require('express');
const router = express.Router();
const { submitContact, getContacts, updateContactStatus, deleteContact } = require('../controllers/contactController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', submitContact);
router.get('/', verifyToken, authorizeRoles('admin'), getContacts);
router.put('/:id/status', verifyToken, authorizeRoles('admin'), updateContactStatus);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteContact);

module.exports = router;
