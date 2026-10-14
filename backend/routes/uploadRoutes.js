const express = require('express');
const router = express.Router();
const { upload, processImageUpload } = require('../middleware/uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, (req, res) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'फ़ाइल अपलोड त्रुटि: ' + err.message });
    }

    try {
      const file = req.files && req.files.length > 0 ? req.files[0] : req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'कोई इमेज या वीडियो फ़ाइल नहीं चुनी गई।' });
      }

      const uploadResult = await processImageUpload(file);

      res.json({
        success: true,
        url: uploadResult.url,
        isCloud: uploadResult.isCloud,
        resourceType: uploadResult.resourceType,
        message: uploadResult.message
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'मीडिया अपलोड में त्रुटि: ' + error.message });
    }
  });
});

module.exports = router;
