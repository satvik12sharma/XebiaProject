import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'workforce-jwt-secret-key-12345';

// Validate password requirements (BR-02 & BR-03)
export const validatePassword = (password) => {
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

// User Login (FR-A01)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and Password are required' });
  }

  const user = db.users.findOne({ email });

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid Credentials' });
  }

  if (user.locked) {
    return res.status(403).json({ success: false, message: 'Account locked due to 5 failed login attempts. Contact Admin.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const isLocked = attempts >= 5;
    
    db.users.findByIdAndUpdate(user._id, {
      failedLoginAttempts: attempts,
      locked: isLocked
    });

    if (isLocked) {
      db.auditLogs.create({
        userId: user._id,
        action: 'Account Locked',
        details: `Account locked for email ${email} after 5 failed attempts`,
        timestamp: new Date().toISOString()
      });
      return res.status(403).json({ success: false, message: 'Account locked due to 5 failed login attempts. Contact Admin.' });
    }

    return res.status(401).json({ success: false, message: `Invalid Credentials. ${5 - attempts} attempts remaining.` });
  }

  // Clear failed login attempts on success
  db.users.findByIdAndUpdate(user._id, { failedLoginAttempts: 0 });

  // Generate JWT Token (FR-A05)
  const token = jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  db.auditLogs.create({
    userId: user._id,
    action: 'User Login',
    details: `Successful login from ${email}`,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    token,
    role: user.role,
    userId: user._id,
    employeeId: user.employeeId || null,
    name: user.name
  });
});

// Forgot Password (FR-A02)
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.users.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: 'Email address not registered' });
  }

  // Simulate password reset link
  const resetToken = Math.random().toString(36).substring(2, 10);
  res.json({
    success: true,
    message: 'Reset instructions have been sent to your email.',
    resetToken // Returned for easy simulation
  });
});

// Reset Password (FR-A03)
router.post('/reset-password', (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long, contain uppercase, lowercase, numeric and special characters.'
    });
  }

  const user = db.users.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.users.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    locked: false,
    failedLoginAttempts: 0
  });

  db.auditLogs.create({
    userId: user._id,
    action: 'Password Reset',
    details: `Password reset successfully for ${email}`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Password has been reset successfully.' });
});

// Change Password (FR-A04)
router.post('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, req.user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long, contain uppercase, lowercase, numeric and special characters.'
    });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.users.findByIdAndUpdate(req.user._id, { password: hashedPassword });

  db.auditLogs.create({
    userId: req.user._id,
    action: 'Password Changed',
    details: 'User password changed from profile settings',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Password changed successfully' });
});

// Profile Management (FR-A09)
router.get('/profile', authenticateToken, (req, res) => {
  const user = req.user;
  let employee = null;

  if (user.employeeId) {
    employee = db.employees.findOne({ employeeId: user.employeeId });
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      employeeId: user.employeeId
    },
    employee
  });
});

export default router;
