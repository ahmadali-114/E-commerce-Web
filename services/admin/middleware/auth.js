const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Ensure isAdmin is treated as boolean
      req.user = { id: decoded.id, isAdmin: decoded.isAdmin === 1 || decoded.isAdmin === true };
      console.log('[Admin] Decoded user:', req.user); // Debug
      next();
    } catch (error) {
      console.error('[Admin] Token error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    console.log('[Admin] Access denied. User:', req.user);
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };