import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

async function seed() {
  try {
    // We must wait for db.js to connect using its own logic, but wait, db.js exports `db` which holds collections but we need the connection.
    // Instead of importing db, let's just connect and use the raw schemas.
    const URI = "mongodb+srv://XebiaProject:hashpassword@cluster0.8sabszt.mongodb.net/workforce?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(URI, { family: 4 });
    
    // Import the actual schema
    const { UserSchema } = await import('./models/schemas.js');
    const User = mongoose.model('User', UserSchema, 'users');

    await User.deleteMany({ email: 'admin@company.com' });
    await User.deleteMany({ email: 'test_admin@company.com' });

    const hash = await bcrypt.hash('Admin@123', 10);
    const newAdmin = await User.create({
      email: 'admin@company.com',
      password: hash,
      role: 'SUPER_ADMIN',
      name: 'Super Admin',
      employeeId: 'EMP000',
      locked: false,
      failedLoginAttempts: 0
    });

    console.log("Successfully created real admin user with String ID:", newAdmin._id);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
