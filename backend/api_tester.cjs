const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const URI = "mongodb+srv://XebiaProject:hashpassword@cluster0.8sabszt.mongodb.net/workforce?retryWrites=true&w=majority&appName=Cluster0";
const BASE_URL = 'http://localhost:5005/api';

async function request(endpoint, method = 'GET', body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      method,
      headers: {}
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
    }
    if (cookie) {
      opts.headers['Cookie'] = cookie;
    }
    const req = http.request(BASE_URL + endpoint, opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch(e){}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log("== Testing API from A to Z ==");
  
  try {
    // 1. Health Check
    let res = await request('/health');
    console.log("[Health] GET /health ->", res.status, res.data);

    // Seed User
    await mongoose.connect(URI, { family: 4 });
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema, 'users');
    const existing = await User.findOne({ email: 'test_admin@company.com' });
    if (existing) await User.deleteOne({ email: 'test_admin@company.com' });
    
    const hash = await bcrypt.hash('Admin@123', 10);
    await User.create({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'test_admin@company.com',
      password: hash,
      role: 'SUPER_ADMIN',
      locked: false,
      failedLoginAttempts: 0
    });
    console.log("[DB] Test Super Admin Created.");

    // 2. Login
    res = await request('/auth/login', 'POST', { email: 'test_admin@company.com', password: 'Admin@123' });
    console.log("[Login] POST /auth/login ->", res.status);
    let cookieStr = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : null;

    if (cookieStr) {
      console.log("[Login] Success, got cookie.");
      
      // 3. Departments
      res = await request('/organization/departments', 'GET', null, cookieStr);
      console.log("[Depts] GET /organization/departments ->", res.status, res.data?.message || res.data);

      // 4. Tickets
      res = await request('/tickets', 'GET', null, cookieStr);
      console.log("[Tickets] GET /tickets ->", res.status, res.data?.message || res.data);
    } else {
      console.log("[Login] Failed to get cookie.");
    }

    // Cleanup
    await User.deleteOne({ email: 'test_admin@company.com' });
    console.log("[DB] Test User Cleaned Up.");
    process.exit(0);
  } catch (err) {
    console.error("Test Failed:", err);
    process.exit(1);
  }
}

runTests();
