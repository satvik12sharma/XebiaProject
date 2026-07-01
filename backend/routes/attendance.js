import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get employee's personal attendance history
router.get('/my', authenticateToken, (req, res) => {
  if (!req.user.employeeId) {
    return res.status(400).json({ success: false, message: 'User is not linked to any employee record.' });
  }
  const history = db.attendance.find({ employeeId: req.user.employeeId });
  res.json({ success: true, attendance: history });
});

// Get team attendance (Managers)
router.get('/team', authenticateToken, requireRole(['SUPER_ADMIN', 'HR', 'MANAGER']), (req, res) => {
  const allAttendance = db.attendance.find();
  const allEmployees = db.employees.find();
  
  // If user is a department manager, filter by department or direct reports
  if (req.user.role === 'MANAGER') {
    const managerId = req.user.employeeId;
    const teamEmpIds = allEmployees
      .filter(emp => emp.reportingManager === managerId)
      .map(emp => emp.employeeId);
      
    const teamAttendance = allAttendance.filter(att => teamEmpIds.includes(att.employeeId));
    return res.json({ success: true, attendance: teamAttendance });
  }

  // HR & Admin see all
  res.json({ success: true, attendance: allAttendance });
});

// Clock In (FR-A01 / ATT-01)
router.post('/clock-in', authenticateToken, (req, res) => {
  const { latitude, longitude, isWfh, qrScanned } = req.body;
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'User is not linked to an employee profile.' });
  }

  const today = new Date().toISOString().split('T')[0];

  // Rule ATT-01: Only mark once per day
  const existingRecord = db.attendance.findOne({ employeeId, date: today });
  if (existingRecord) {
    return res.status(400).json({ success: false, message: 'Attendance already marked for today.' });
  }

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const clockInTime = `${hours}:${minutes}`;

  // Late Arrival Check (Standard start time is 09:00)
  let status = 'Present';
  if (!isWfh && (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15))) {
    status = 'Late';
  } else if (isWfh) {
    status = 'Work From Home';
  }

  const gpsLocation = latitude && longitude ? `Coordinates: ${latitude}, ${longitude}` : 'Office WiFi Location';
  const locationDetails = qrScanned ? 'Office (QR Code Scan)' : (isWfh ? `Remote (GPS: ${gpsLocation})` : 'Office Desk');

  const record = db.attendance.create({
    employeeId,
    date: today,
    clockIn: clockInTime,
    clockOut: '',
    workingHours: 0,
    status,
    overtime: 0,
    location: locationDetails,
    correctionRequest: null
  });

  res.json({ success: true, message: 'Clocked In Successfully', record });
});

// Clock Out
router.post('/clock-out', authenticateToken, (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'User is not linked to an employee profile.' });
  }

  const today = new Date().toISOString().split('T')[0];
  const record = db.attendance.findOne({ employeeId, date: today });

  if (!record) {
    return res.status(400).json({ success: false, message: 'No Clock-In record found for today.' });
  }
  if (record.clockOut) {
    return res.status(400).json({ success: false, message: 'Already clocked out for today.' });
  }

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const clockOutTime = `${hours}:${minutes}`;

  // Calculate working hours
  const [inH, inM] = record.clockIn.split(':').map(Number);
  const outH = now.getHours();
  const outM = now.getMinutes();

  const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
  const workingHours = parseFloat((totalMinutes / 60).toFixed(2));

  // Rule ATT-05: Overtime calculation (Standard shift is 8.00 hours)
  let overtime = 0;
  if (workingHours > 8.0) {
    overtime = parseFloat((workingHours - 8.0).toFixed(2));
  }

  // Adjust Status based on working hours (e.g. Worked less than 4 hours is Half Day)
  let finalStatus = record.status;
  if (workingHours < 4.0 && finalStatus !== 'Work From Home') {
    finalStatus = 'Half Day';
  }

  const updated = db.attendance.findByIdAndUpdate(record._id, {
    clockOut: clockOutTime,
    workingHours,
    overtime,
    status: finalStatus
  });

  res.json({ success: true, message: 'Clocked Out Successfully', record: updated });
});

// Raise Correction Request (ATT-04)
router.post('/correction', authenticateToken, (req, res) => {
  const { date, reason, correctedClockIn, correctedClockOut } = req.body;
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'User is not linked to an employee profile.' });
  }

  const record = db.attendance.findOne({ employeeId, date });
  if (!record) {
    return res.status(404).json({ success: false, message: 'Attendance record not found for this date. Contact HR.' });
  }

  const updated = db.attendance.findByIdAndUpdate(record._id, {
    correctionRequest: {
      reason,
      correctedClockIn,
      correctedClockOut,
      status: 'Pending',
      requestedAt: new Date().toISOString()
    }
  });

  res.json({ success: true, message: 'Correction request submitted to manager.', record: updated });
});

// Review Correction Request (Manager/HR)
router.post('/correction/:id/review', authenticateToken, requireRole(['SUPER_ADMIN', 'HR', 'MANAGER']), (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'Approve' or 'Reject'

  const record = db.attendance.findById(id);
  if (!record || !record.correctionRequest) {
    return res.status(404).json({ success: false, message: 'Correction request not found.' });
  }

  if (action === 'Approve') {
    const { correctedClockIn, correctedClockOut } = record.correctionRequest;
    
    // Recalculate working hours
    const [inH, inM] = correctedClockIn.split(':').map(Number);
    const [outH, outM] = correctedClockOut.split(':').map(Number);
    const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    const workingHours = parseFloat((totalMinutes / 60).toFixed(2));
    
    let overtime = 0;
    if (workingHours > 8.0) {
      overtime = parseFloat((workingHours - 8.0).toFixed(2));
    }

    db.attendance.findByIdAndUpdate(id, {
      clockIn: correctedClockIn,
      clockOut: correctedClockOut,
      workingHours,
      overtime,
      status: 'Present', // Revert to present post-correction
      correctionRequest: {
        ...record.correctionRequest,
        status: 'Approved',
        reviewedBy: req.user.name,
        reviewedAt: new Date().toISOString()
      }
    });

    res.json({ success: true, message: 'Attendance correction approved and updated.' });
  } else {
    db.attendance.findByIdAndUpdate(id, {
      correctionRequest: {
        ...record.correctionRequest,
        status: 'Rejected',
        reviewedBy: req.user.name,
        reviewedAt: new Date().toISOString()
      }
    });
    res.json({ success: true, message: 'Attendance correction rejected.' });
  }
});

export default router;
