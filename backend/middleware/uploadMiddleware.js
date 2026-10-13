const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('केवल इमेज फाइलें (JPG, PNG, WEBP, GIF) ही अपलोड की जा सकती हैं!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Cloudinary upload helper
const processImageUpload = async (file) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'aashray_uploads'
      });
      // Optionally clean local file after cloud upload
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return {
        url: result.secure_url,
        isCloud: true,
        message: 'इमेज सफलतापूर्वक क्लाउड पर अपलोड की गई।'
      };
    } catch (error) {
      console.warn('⚠️ Cloudinary upload failed, using local file URL:', error.message);
    }
  }

  // Fallback to local server URL
  const localUrl = `/uploads/${path.basename(file.path)}`;
  return {
    url: localUrl,
    isCloud: false,
    message: 'इमेज लोकल सर्वर पर सहेजी गई (Cloudinary क्रेडेंशियल मिलने पर क्लाउड पर अपलोड होगी)।'
  };
};

module.exports = { upload, processImageUpload };
