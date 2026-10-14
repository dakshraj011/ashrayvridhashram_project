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

// File filter validation: Supports Images AND Videos
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp|gif|mp4|webm|mov|mkv|avi|mpeg/;
  const extName = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimeType = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('केवल इमेज (JPG, PNG, WEBP, GIF) या वीडियो (MP4, WEBM, MOV) फ़ाइलें ही अपलोड की जा सकती हैं!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max for videos & images
  fileFilter: fileFilter
});

// Cloudinary upload helper: Supports Free Cloud Storage for Images AND Videos
const processImageUpload = async (file) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const isConfigured = Boolean(cloudName && apiKey && apiSecret);

  if (isConfigured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    try {
      const isVideo = file.mimetype.startsWith('video/');
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'aashray_uploads',
        resource_type: 'auto', // Automatically detects images and videos
      });

      // Clean local temporary file after cloud upload
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

      return {
        url: result.secure_url,
        isCloud: true,
        resourceType: result.resource_type || (isVideo ? 'video' : 'image'),
        message: `${isVideo ? 'वीडियो' : 'इमेज'} सफलतापूर्वक मुफ़्त क्लाउड स्टोरेज (Cloudinary) पर सहेज दी गई!`
      };
    } catch (error) {
      console.warn('⚠️ Cloudinary upload failed, using local file URL:', error.message);
    }
  }

  // Fallback to local server static URL if Cloudinary is not configured yet
  const localUrl = `/uploads/${path.basename(file.path)}`;
  const isVideo = file.mimetype.startsWith('video/');
  return {
    url: localUrl,
    isCloud: false,
    resourceType: isVideo ? 'video' : 'image',
    message: `${isVideo ? 'वीडियो' : 'इमेज'} लोकल सर्वर पर सहेजी गई (Cloudinary क्रेडेंशियल्स जोड़ने पर स्वतः मुफ़्त क्लाउड पर स्टोर होगी)।`
  };
};

module.exports = { upload, processImageUpload };
