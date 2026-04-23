const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Optional: add debug logging
      // console.log('[Auth] Token received:', token.substring(0,20)+'...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, isAdmin: decoded.isAdmin };
      next();
    } catch (error) {
      console.error('[Auth] Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  // Accept any truthy value (1, true, "true") – works with both number and boolean
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };