import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================");
console.log("🚀 Starting Enterprise Workforce Platform Dev Servers...");
console.log("==================================================");

// Spawn Backend Server (npm run dev inside backend folder)
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Spawn Frontend Server (npm run dev inside frontend folder)
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Clean up processes on exit
process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
