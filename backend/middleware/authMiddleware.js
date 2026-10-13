const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'अनधिकृत: कृपया पहले लॉगिन करें (Authentication required)'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aashray_krishna_prem_jwt_secret_key_2026_super_secure');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।'
    });
  }
};

const optionalToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aashray_krishna_prem_jwt_secret_key_2026_super_secure');
      req.user = decoded;
    } catch (err) {
      // optional token verification
    }
  }
  next();
};

module.exports = { verifyToken, optionalToken };
