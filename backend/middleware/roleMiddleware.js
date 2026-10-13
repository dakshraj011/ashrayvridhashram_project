const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'अनुमति अस्वीकृत: आपके पास इस कार्य को करने की अनुमति नहीं है।'
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
