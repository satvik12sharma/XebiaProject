import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const URI = "mongodb+srv://XebiaProject:hashpassword@cluster0.8sabszt.mongodb.net/workforce?retryWrites=true&w=majority&appName=Cluster0";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(URI, { family: 4 });
    console.log("Connected.");

    // Import Schemas
    const { UserSchema, EmployeeSchema, DepartmentSchema } = await import('./models/schemas.js');
    const User = mongoose.model('User', UserSchema, 'users');
    const Employee = mongoose.model('Employee', EmployeeSchema, 'employees');
    const Department = mongoose.model('Department', DepartmentSchema, 'departments');

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});

    console.log("Seeding Departments...");
    const depts = await Department.insertMany([
      { departmentName: 'Engineering', departmentCode: 'ENG', manager: 'EMP002', employees: 2, status: 'Active' },
      { departmentName: 'HR', departmentCode: 'HR', manager: 'EMP001', employees: 1, status: 'Active' },
      { departmentName: 'Finance', departmentCode: 'FIN', manager: 'EMP004', employees: 1, status: 'Active' }
    ]);

    console.log("Seeding Users & Employees...");
    const defaultPassword = await bcrypt.hash('Admin@123', 10);

    const accounts = [
      { email: 'admin@company.com', role: 'SUPER_ADMIN', name: 'Super Admin', empId: 'EMP000', title: 'System Administrator', dept: 'IT' },
      { email: 'hr@company.com', role: 'HR', name: 'Sarah Jenkins', empId: 'EMP001', title: 'HR Director', dept: 'HR' },
      { email: 'manager@company.com', role: 'MANAGER', name: 'David Miller', empId: 'EMP002', title: 'Engineering Manager', dept: 'Engineering' },
      { email: 'employee@company.com', role: 'EMPLOYEE', name: 'Rahul Sharma', empId: 'EMP003', title: 'Software Engineer', dept: 'Engineering' },
      { email: 'finance@company.com', role: 'FINANCE', name: 'Alice Cooper', empId: 'EMP004', title: 'Finance Lead', dept: 'Finance' },
    ];

    for (const acc of accounts) {
      // Create User
      const user = await User.create({
        email: acc.email,
        password: defaultPassword,
        role: acc.role,
        name: acc.name,
        employeeId: acc.empId,
        locked: false,
        failedLoginAttempts: 0
      });

      // Create Matching Employee Profile
      if (acc.role !== 'SUPER_ADMIN') {
        await Employee.create({
          employeeId: acc.empId,
          firstName: acc.name.split(' ')[0],
          lastName: acc.name.split(' ')[1],
          email: acc.email,
          mobile: '9876543210',
          department: acc.dept,
          designation: acc.title,
          joiningDate: '2024-01-01',
          reportingManager: acc.role === 'EMPLOYEE' ? 'EMP002' : 'EMP000',
          status: 'Active',
          basicSalary: acc.role === 'MANAGER' ? 120000 : 80000,
          hra: 10000
        });
      }
      console.log(`Created: ${acc.email} [${acc.role}]`);
    }

    console.log("Database Seeding Complete! ✅");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seedDatabase();
