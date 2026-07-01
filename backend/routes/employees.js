import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to filter salary information based on roles (RBAC rule)
const stripSensitiveFields = (employee, reqUser) => {
  if (!employee) return null;
  
  const privilegedRoles = ['SUPER_ADMIN', 'HR', 'FINANCE'];
  const isSelf = reqUser.employeeId && reqUser.employeeId === employee.employeeId;

  if (privilegedRoles.includes(reqUser.role) || isSelf) {
    return employee;
  }

  // Strip basicSalary and hra
  const { basicSalary, hra, ...publicDetails } = employee;
  return publicDetails;
};

// Get all/search employees
router.get('/', authenticateToken, (req, res) => {
  const { search, department } = req.query;
  let list = db.employees.find();

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(emp => 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)
    );
  }

  if (department) {
    list = list.filter(emp => emp.department === department);
  }

  // Filter sensitive fields for role restrictions
  const filteredList = list.map(emp => stripSensitiveFields(emp, req.user));

  res.json({ success: true, employees: filteredList });
});

// Get employee by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const emp = db.employees.findById(id) || db.employees.findOne({ employeeId: id });

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  res.json({ success: true, employee: stripSensitiveFields(emp, req.user) });
});

// Add employee (Super Admin and HR only)
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'HR']), (req, res) => {
  const {
    firstName,
    lastName,
    email,
    mobile,
    address,
    gender,
    bloodGroup,
    dob,
    department,
    designation,
    joiningDate,
    reportingManager,
    employmentType,
    salaryGrade,
    basicSalary,
    hra
  } = req.body;

  // Validations
  if (!firstName || !lastName || !email || !joiningDate) {
    return res.status(400).json({ success: false, message: 'First name, last name, email, and joining date are required.' });
  }

  // Email unique (BR-01)
  const existingEmail = db.employees.findOne({ email }) || db.users.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ success: false, message: 'Email address already in use.' });
  }

  // Joining Date check
  const now = new Date();
  const join = new Date(joiningDate);
  if (join > now) {
    return res.status(400).json({ success: false, message: 'Joining Date cannot be in the future.' });
  }

  // Auto-generate employee ID
  const allEmployees = db.employees.find();
  const nextNumber = 1000 + allEmployees.length + 1;
  const employeeId = `EMP${nextNumber}`;

  // Create Employee
  const newEmp = db.employees.create({
    employeeId,
    firstName,
    lastName,
    email,
    mobile: mobile || '',
    address: address || '',
    gender: gender || 'Male',
    bloodGroup: bloodGroup || 'O+',
    dob: dob || '',
    department: department || '',
    designation: designation || '',
    joiningDate,
    reportingManager: reportingManager || '',
    employmentType: employmentType || 'Permanent',
    salaryGrade: salaryGrade || 'Grade-B',
    basicSalary: parseFloat(basicSalary) || 50000,
    hra: parseFloat(hra) || 10000,
    status: 'Active'
  });

  // Automatically create a user login account (BR-05)
  // Default password will be EmployeeId@123 (e.g. EMP1005@123) which satisfies BR-03
  const defaultPassword = `${employeeId}@123`;
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

  // Map employee role: default is EMPLOYEE
  // (If designating as Manager or specific role, HR can edit or default mapping applies)
  let initialRole = 'EMPLOYEE';
  if (designation.toLowerCase().includes('manager') || designation.toLowerCase().includes('director')) {
    initialRole = 'MANAGER';
  } else if (designation.toLowerCase().includes('finance')) {
    initialRole = 'FINANCE';
  } else if (designation.toLowerCase().includes('it admin') || designation.toLowerCase().includes('sysadmin')) {
    initialRole = 'IT';
  }

  db.users.create({
    email,
    password: hashedPassword,
    role: initialRole,
    name: `${firstName} ${lastName}`,
    employeeId,
    failedLoginAttempts: 0,
    locked: false
  });

  // Update employee count in Department
  if (department) {
    const dep = db.departments.findOne({ departmentName: department });
    if (dep) {
      db.departments.findByIdAndUpdate(dep._id, { employees: (dep.employees || 0) + 1 });
    }
  }

  // Log audit
  db.auditLogs.create({
    userId: req.user._id,
    action: 'Employee Added',
    details: `Employee ${firstName} ${lastName} created with ID ${employeeId}`,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    employee: newEmp,
    generatedCredentials: {
      email,
      password: defaultPassword
    }
  });
});

// Edit employee details
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'HR', 'MANAGER']), (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  const emp = db.employees.findById(id) || db.employees.findOne({ employeeId: id });
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  // Restrict who can edit salary details
  const allowedSalaryEdit = ['SUPER_ADMIN', 'HR', 'FINANCE'].includes(req.user.role);
  if (!allowedSalaryEdit) {
    delete updateFields.basicSalary;
    delete updateFields.hra;
    delete updateFields.salaryGrade;
  }

  // Handle department count adjustments if department changes
  if (updateFields.department && updateFields.department !== emp.department) {
    // Decrement old
    if (emp.department) {
      const oldDep = db.departments.findOne({ departmentName: emp.department });
      if (oldDep) {
        db.departments.findByIdAndUpdate(oldDep._id, { employees: Math.max(0, (oldDep.employees || 0) - 1) });
      }
    }
    // Increment new
    const newDep = db.departments.findOne({ departmentName: updateFields.department });
    if (newDep) {
      db.departments.findByIdAndUpdate(newDep._id, { employees: (newDep.employees || 0) + 1 });
    }
  }

  const updated = db.employees.findByIdAndUpdate(emp._id, updateFields);

  db.auditLogs.create({
    userId: req.user._id,
    action: 'Employee Updated',
    details: `Employee profile updated for ${emp.firstName} ${emp.lastName}`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, employee: stripSensitiveFields(updated, req.user) });
});

// Archive Employee (instead of hard delete)
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'HR']), (req, res) => {
  const { id } = req.params;
  const emp = db.employees.findById(id) || db.employees.findOne({ employeeId: id });

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  // Archive
  db.employees.findByIdAndUpdate(emp._id, { status: 'Archived' });
  
  // Disable user account
  const u = db.users.findOne({ email: emp.email });
  if (u) {
    db.users.findByIdAndUpdate(u._id, { locked: true });
  }

  // Adjust department count
  if (emp.department) {
    const dep = db.departments.findOne({ departmentName: emp.department });
    if (dep) {
      db.departments.findByIdAndUpdate(dep._id, { employees: Math.max(0, (dep.employees || 0) - 1) });
    }
  }

  db.auditLogs.create({
    userId: req.user._id,
    action: 'Employee Archived',
    details: `Employee ${emp.firstName} ${emp.lastName} marked as Archived/Terminated`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Employee successfully archived and account locked.' });
});

export default router;
