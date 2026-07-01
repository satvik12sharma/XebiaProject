import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const LEAVE_ALLOWANCES = {
  'Casual Leave': 12,
  'Sick Leave': 10,
  'Earned Leave': 15
};

// Helper to calculate remaining leave balances dynamically
const getLeaveBalances = (employeeId) => {
  const approvedLeaves = db.leaves.find({ employeeId, status: 'Approved' });
  
  // Calculate days used
  const used = {
    'Casual Leave': 0,
    'Sick Leave': 0,
    'Earned Leave': 0
  };

  approvedLeaves.forEach(lv => {
    const start = new Date(lv.startDate);
    const end = new Date(lv.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    if (used[lv.leaveType] !== undefined) {
      used[lv.leaveType] += days;
    }
  });

  return {
    allocated: LEAVE_ALLOWANCES,
    used,
    remaining: {
      'Casual Leave': LEAVE_ALLOWANCES['Casual Leave'] - used['Casual Leave'],
      'Sick Leave': LEAVE_ALLOWANCES['Sick Leave'] - used['Sick Leave'],
      'Earned Leave': LEAVE_ALLOWANCES['Earned Leave'] - used['Earned Leave']
    }
  };
};

// Get personal leave history & balances
router.get('/my', authenticateToken, (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'User profile not linked to an employee.' });
  }

  const history = db.leaves.find({ employeeId });
  const balances = getLeaveBalances(employeeId);

  res.json({ success: true, history, balances });
});

// Get all leave applications for approvals (Managers/HR)
router.get('/pending', authenticateToken, requireRole(['SUPER_ADMIN', 'HR', 'MANAGER']), (req, res) => {
  const allLeaves = db.leaves.find();
  const allEmployees = db.employees.find();

  if (req.user.role === 'MANAGER') {
    // Return leaves of employees reporting directly to this manager
    const managerId = req.user.employeeId;
    const teamEmpIds = allEmployees
      .filter(emp => emp.reportingManager === managerId)
      .map(emp => emp.employeeId);

    const teamLeaves = allLeaves.filter(lv => teamEmpIds.includes(lv.employeeId)).map(lv => {
      const emp = allEmployees.find(e => e.employeeId === lv.employeeId);
      return { ...lv, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown' };
    });
    
    return res.json({ success: true, leaves: teamLeaves });
  }

  // HR & Super Admin see all leaves
  const enrichedLeaves = allLeaves.map(lv => {
    const emp = allEmployees.find(e => e.employeeId === lv.employeeId);
    return { ...lv, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown' };
  });

  res.json({ success: true, leaves: enrichedLeaves });
});

// Apply for leave (M-06)
router.post('/apply', authenticateToken, (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'User profile not linked to an employee.' });
  }

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Rule 2: Past leave cannot be applied
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0,0,0,0);

  if (start < today) {
    return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
  }
  if (end < start) {
    return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
  }

  // Calculate requested duration
  const timeDiff = end.getTime() - start.getTime();
  const requestedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

  // Rule 1: Leave balance cannot be negative
  const balances = getLeaveBalances(employeeId);
  const remaining = balances.remaining[leaveType];

  if (remaining === undefined) {
    return res.status(400).json({ success: false, message: 'Invalid Leave Type.' });
  }

  if (requestedDays > remaining) {
    return res.status(400).json({
      success: false,
      message: `Insufficient leave balance. You requested ${requestedDays} days, but only have ${remaining} days remaining.`
    });
  }

  // Apply Leave
  const leaveRequest = db.leaves.create({
    employeeId,
    leaveType,
    startDate,
    endDate,
    reason,
    status: 'Pending',
    approvedBy: ''
  });

  res.json({ success: true, message: 'Leave application submitted successfully.', leaveRequest });
});

// Review leave (Approve/Reject)
router.post('/review/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'HR', 'MANAGER']), (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'Approved' or 'Rejected'

  const leave = db.leaves.findById(id);
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave application not found.' });
  }

  if (leave.status !== 'Pending') {
    return res.status(400).json({ success: false, message: 'Leave application has already been processed.' });
  }

  const updated = db.leaves.findByIdAndUpdate(id, {
    status: action,
    approvedBy: req.user.employeeId || 'SUPER_ADMIN'
  });

  // If approved, verify balance again just in case of parallel approvals (Rule 1 enforcement)
  if (action === 'Approved') {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    
    const balances = getLeaveBalances(leave.employeeId);
    
    // Create notification for employee
    db.notifications.create({
      recipientId: leave.employeeId,
      message: `Your ${leave.leaveType} request for ${leave.startDate} to ${leave.endDate} has been Approved.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    // Create notifications for HR (Rule 4)
    const hrUsers = db.users.find({ role: 'HR' });
    hrUsers.forEach(hr => {
      db.notifications.create({
        recipientId: hr.employeeId || hr._id,
        message: `Leave application approved for Employee ${leave.employeeId} (${days} days of ${leave.leaveType})`,
        read: false,
        createdAt: new Date().toISOString()
      });
    });
  } else {
    // Rejected Notification
    db.notifications.create({
      recipientId: leave.employeeId,
      message: `Your ${leave.leaveType} request for ${leave.startDate} to ${leave.endDate} was Rejected.`,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json({ success: true, message: `Leave application ${action.toLowerCase()} successfully.` });
});

export default router;
