const express = require('express');
const router = express.Router();
const { upload, processImageUpload } = require('../middleware/uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'कोई इमेज फाइल नहीं चुनी गई।' });
    }

    const uploadResult = await processImageUpload(req.file);

    res.json({
      success: true,
      url: uploadResult.url,
      isCloud: uploadResult.isCloud,
      message: uploadResult.message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'इमेज अपलोड में त्रुटि: ' + error.message });
  }
});

module.exports = router;
