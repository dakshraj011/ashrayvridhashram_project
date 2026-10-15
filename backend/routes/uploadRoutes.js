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
      const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);

      if (files.length === 0) {
        return res.status(400).json({ success: false, message: 'कोई इमेज या वीडियो फ़ाइल नहीं चुनी गई।' });
      }

      // Process up to 5 files at a time
      const toProcess = files.slice(0, 5);
      const results = [];
      for (const file of toProcess) {
        const uploadResult = await processImageUpload(file);
        results.push(uploadResult);
      }

      res.json({
        success: true,
        url: results[0].url,
        urls: results.map(r => r.url),
        isCloud: results[0].isCloud,
        resourceType: results[0].resourceType,
        count: results.length,
        message: results.length > 1
          ? `${results.length} फ़ाइलें सफलतापूर्वक अपलोड हो गईं!`
          : results[0].message
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'मीडिया अपलोड में त्रुटि: ' + error.message });
    }
  });
});

module.exports = router;
