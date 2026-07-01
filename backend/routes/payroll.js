import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get payroll slips history (All for HR/Finance, Personal for Employees)
router.get('/history', authenticateToken, (req, res) => {
  const isPrivileged = ['SUPER_ADMIN', 'HR', 'FINANCE'].includes(req.user.role);
  
  if (!isPrivileged) {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'User is not linked to any employee record.' });
    }
    const history = db.payroll.find({ employeeId: req.user.employeeId });
    return res.json({ success: true, payrolls: history });
  }

  // Privileged roles see all records
  const allPayrolls = db.payroll.find();
  const enrichedPayrolls = allPayrolls.map(pay => {
    const emp = db.employees.findOne({ employeeId: pay.employeeId });
    return {
      ...pay,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
      department: emp ? emp.department : 'N/A'
    };
  });
  
  res.json({ success: true, payrolls: enrichedPayrolls });
});

// Run monthly payroll (HR and Finance only)
router.post('/run', authenticateToken, requireRole(['SUPER_ADMIN', 'HR', 'FINANCE']), (req, res) => {
  const { month } = req.body; // e.g. "July 2026"

  if (!month) {
    return res.status(400).json({ success: false, message: 'Month specification is required (e.g., "July 2026")' });
  }

  // Rule: Payroll generated once per month for each employee
  const existingMonth = db.payroll.findOne({ month });
  if (existingMonth) {
    return res.status(400).json({ success: false, message: `Payroll for ${month} has already been run.` });
  }

  const employees = db.employees.find({ status: 'Active' });
  const results = [];

  employees.forEach(emp => {
    // 1. Mandatory Attendance Checks: Find all attendance records for this employee during the month
    // We will simulate deductions based on logged Absences in the DB
    const attendanceLogs = db.attendance.find({ employeeId: emp.employeeId });
    const absentDaysCount = attendanceLogs.filter(att => att.status === 'Absent').length;

    // 2. Overtime calculation
    const totalOvertimeHours = attendanceLogs.reduce((sum, att) => sum + (att.overtime || 0), 0);
    const overtimeRate = 500; // Rs 500 or $50 per hour
    const overtimePayout = totalOvertimeHours * overtimeRate;

    // 3. Leave deductions (Unpaid leave / Absenteeism)
    // Daily wage base calculation
    const dailyWage = Math.round(emp.basicSalary / 30);
    const leaveDeduction = absentDaysCount * dailyWage;

    // 4. Financial components
    const basic = emp.basicSalary || 50000;
    const hra = emp.hra || 10000;
    const bonus = 5000; // Standard monthly performance bonus
    const pf = Math.round(basic * 0.12); // 12% PF contribution
    const professionalTax = 200; // Fixed professional tax
    
    const grossSalary = basic + hra + bonus + overtimePayout;
    const totalDeductions = pf + professionalTax + leaveDeduction;
    const netSalary = grossSalary - totalDeductions;

    // Save Payslip
    const payRecord = db.payroll.create({
      employeeId: emp.employeeId,
      month,
      basicSalary: basic,
      hra,
      bonus,
      overtime: overtimePayout,
      deductions: totalDeductions,
      netSalary,
      pf,
      professionalTax,
      absentDays: absentDaysCount,
      overtimeHours: totalOvertimeHours,
      status: 'Paid',
      processedDate: new Date().toISOString().split('T')[0]
    });

    results.push(payRecord);

    // Notify employee of payslip generation
    db.notifications.create({
      recipientId: emp.employeeId,
      message: `Your payslip for ${month} has been generated. Net Credit: Rs. ${netSalary}`,
      read: false,
      createdAt: new Date().toISOString()
    });
  });

  db.auditLogs.create({
    userId: req.user._id,
    action: 'Run Payroll',
    details: `Successfully completed monthly payroll process for ${month}`,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Payroll run completed successfully for ${employees.length} employees.`,
    processedRecords: results
  });
});

export default router;
