import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'workforce-jwt-secret-key-12345';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Token Required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
    }
    
    // Fetch latest user details from mock db to ensure they aren't locked/deleted
    const latestUser = db.users.findById(user.userId);
    if (!latestUser) {
      return res.status(403).json({ success: false, message: 'User Account Not Found' });
    }
    if (latestUser.locked) {
      return res.status(403).json({ success: false, message: 'Account Locked. Please Contact Administrator.' });
    }

    req.user = latestUser;
    next();
  });
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (req.user.role === 'SUPER_ADMIN') {
      // Super Admin bypasses all checks
      return next();
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access Denied: Insufficient Permissions' });
  };
};
