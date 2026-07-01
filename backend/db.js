import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'database.json');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initial structure if file doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [],
    employees: [],
    departments: [],
    candidates: [],
    attendance: [],
    leaves: [],
    payroll: [],
    projects: [],
    tasks: [],
    assets: [],
    tickets: [],
    notifications: [],
    auditLogs: []
  }, null, 2));
}

class Collection {
  constructor(name) {
    this.name = name;
  }

  read() {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data)[this.name] || [];
    } catch (e) {
      console.error(`Error reading collection ${this.name}`, e);
      return [];
    }
  }

  write(data) {
    try {
      const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      dbData[this.name] = data;
      fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
    } catch (e) {
      console.error(`Error writing collection ${this.name}`, e);
    }
  }

  find(query = {}) {
    let items = this.read();
    return items.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(query = {}) {
    const items = this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  findById(id) {
    const items = this.read();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  create(doc) {
    const items = this.read();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    this.write(items);
    return newDoc;
  }

  findByIdAndUpdate(id, updateData) {
    const items = this.read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.write(items);
    return items[index];
  }

  updateOne(query, updateData) {
    const items = this.read();
    const index = items.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return false;

    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.write(items);
    return items[index];
  }

  deleteMany(query = {}) {
    const items = this.read();
    const filtered = items.filter(item => {
      for (let key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    this.write(filtered);
    return { deletedCount: items.length - filtered.length };
  }

  deleteOne(query = {}) {
    const items = this.read();
    const index = items.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return { deletedCount: 0 };
    items.splice(index, 1);
    this.write(items);
    return { deletedCount: 1 };
  }
}

export const db = {
  users: new Collection('users'),
  employees: new Collection('employees'),
  departments: new Collection('departments'),
  candidates: new Collection('candidates'),
  attendance: new Collection('attendance'),
  leaves: new Collection('leaves'),
  payroll: new Collection('payroll'),
  projects: new Collection('projects'),
  tasks: new Collection('tasks'),
  assets: new Collection('assets'),
  tickets: new Collection('tickets'),
  notifications: new Collection('notifications'),
  auditLogs: new Collection('auditLogs')
};
