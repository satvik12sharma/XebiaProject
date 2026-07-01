import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Users, Settings, LogOut, Clock, Calendar, DollarSign, Award, 
  Briefcase, Laptop, HelpCircle, Send, Bot, Bell, Plus, Search, 
  Check, X, ChevronRight, BarChart3, AlertTriangle, FileText, 
  CheckCircle2, MapPin, QrCode, MessageSquare, Menu, Globe
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';

const API_BASE = ''; // Uses Vite proxy (direct calls to /api)

// Helper to format currency
const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function App() {
  // Navigation & User State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [empId, setEmpId] = useState(localStorage.getItem('employeeId') || '');
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  
  const [currentTab, setCurrentTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Authentication Forms
  const [loginEmail, setLoginEmail] = useState('admin@company.com');
  const [loginPassword, setLoginPassword] = useState('Admin@123');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  // Global Data States (Shared across dashboards)
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);

  // AI Assistant Chat Panel State
  const [showAi, setShowAi] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState([
    { role: 'assistant', content: "### 👋 Hello! \nI am your **AI Operations Assistant**. I can look up your leave balances, explain your payslip, detail your performance ratings, or answer company policy questions. Try asking me:\n- *\"How many leaves do I have left?\"*\n- *\"Explain my salary breakdown\"*\n- *\"What is my performance rating?\"*\n- *\"What is the laptop return policy?\"*" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const chatEndRef = useRef(null);

  // Modals & New Entry States
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [newEmpData, setNewEmpData] = useState({
    firstName: '', lastName: '', email: '', mobile: '', address: '', gender: 'Male',
    bloodGroup: 'O+', dob: '', department: '', designation: '', joiningDate: '',
    reportingManager: '', employmentType: 'Permanent', salaryGrade: 'Grade-B',
    basicSalary: 60000, hra: 12000
  });

  const [showAddDep, setShowAddDep] = useState(false);
  const [newDepData, setNewDepData] = useState({ departmentName: '', departmentCode: '', manager: '' });

  const [showAddProj, setShowAddProj] = useState(false);
  const [newProjData, setNewProjData] = useState({ projectName: '', description: '', manager: '', deadline: '' });

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ projectId: '', task: '', assignedTo: '', priority: 'Medium', deadline: '' });

  const [showAddTicket, setShowAddTicket] = useState(false);
  const [newTicketData, setNewTicketData] = useState({ title: '', description: '', priority: 'Medium' });

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAssetData, setNewAssetData] = useState({ assetName: '', serialNumber: '', type: 'Laptop', assignedTo: '' });

  const [showAddCand, setShowAddCand] = useState(false);
  const [newCandData, setNewCandData] = useState({ candidateName: '', email: '', experience: 0, skills: '' });

  const [gpsSimulated, setGpsSimulated] = useState(false);
  const [qrSimulated, setQrSimulated] = useState(false);

  // Profile management modals
  const [showChangePw, setShowChangePw] = useState(false);
  const [changePwData, setChangePwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Load App Data on Login
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Scroll AI Chat to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory]);

  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    try {
      const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (err) {
      console.error(`API Fetch Error [${url}]:`, err);
      throw err;
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Departments
      const depRes = await apiFetch('/api/organization/departments');
      if (depRes.success) setDepartments(depRes.departments);

      // Employees
      const empRes = await apiFetch('/api/employees');
      if (empRes.success) setEmployees(empRes.employees);

      // Candidates
      const candRes = await apiFetch('/api/recruitment/candidates');
      if (candRes.success) setCandidates(candRes.candidates);

      // Attendance
      const attRes = await apiFetch('/api/attendance/my');
      if (attRes.success) setAttendance(attRes.attendance);

      // Leaves
      const lvRes = await apiFetch('/api/leaves/my');
      if (lvRes.success) setLeaves(lvRes.history || []);

      // Payroll
      const payRes = await apiFetch('/api/payroll/history');
      if (payRes.success) setPayroll(payRes.payrolls);

      // Projects
      const projRes = await apiFetch('/api/projects');
      if (projRes.success) setProjects(projRes.projects);

      // Tasks
      const tskRes = await apiFetch('/api/projects/tasks');
      if (tskRes.success) setTasks(tskRes.tasks);

      // Assets
      const assetRes = await apiFetch('/api/assets');
      if (assetRes.success) setAssets(assetRes.assets);

      // Tickets
      const tktRes = await apiFetch('/api/tickets');
      if (tktRes.success) setTickets(tktRes.tickets);
    } catch (err) {
      console.warn("Failed to contact backend API. App running with mock simulation data.");
      loadFallbackMockData();
    }
  };

  const loadFallbackMockData = () => {
    // Basic Offline Sandbox fallbacks
    setDepartments([
      { _id: '1', departmentName: 'Engineering', departmentCode: 'ENG', manager: 'EMP002', employees: 82, status: 'Active' },
      { _id: '2', departmentName: 'HR', departmentCode: 'HR', manager: 'EMP001', employees: 5, status: 'Active' },
      { _id: '3', departmentName: 'Finance', departmentCode: 'FIN', manager: 'EMP004', employees: 3, status: 'Active' }
    ]);
    setEmployees([
      { _id: 'e1', employeeId: 'EMP001', firstName: 'Sarah', lastName: 'Jenkins', email: 'hr@company.com', mobile: '9876543210', department: 'HR', designation: 'HR Director', joiningDate: '2024-01-10', reportingManager: 'EMP002', status: 'Active', basicSalary: 80000 },
      { _id: 'e2', employeeId: 'EMP002', firstName: 'David', lastName: 'Miller', email: 'manager@company.com', mobile: '9876543211', department: 'Engineering', designation: 'Engineering Manager', joiningDate: '2023-06-01', status: 'Active', basicSalary: 120000 },
      { _id: 'e3', employeeId: 'EMP003', firstName: 'Rahul', lastName: 'Sharma', email: 'employee@company.com', mobile: '9876543212', department: 'Engineering', designation: 'Software Engineer', joiningDate: '2026-01-15', reportingManager: 'EMP002', status: 'Active', basicSalary: 60000, performanceReviews: [{ quarter: 'Q2', kpiScore: 88, managerRating: 4, overall: 'Excellent', feedback: 'Great team player. Delivers sprints on schedule.' }] }
    ]);
    setCandidates([
      { _id: 'c1', candidateName: 'Priya Singh', email: 'priya@gmail.com', experience: 2, skills: ['React', 'NodeJS', 'MongoDB'], status: 'Technical Interview', aiAnalysis: { score: '88%', matchedSkills: ['React', 'Node.js', 'MongoDB'], missingSkills: ['Docker', 'AWS'], summary: 'Solid frontend skillset matching our core product line.' } }
    ]);
    setAttendance([
      { _id: 'a1', date: '2026-07-01', clockIn: '08:58', clockOut: '18:02', workingHours: 9.07, status: 'Present', overtime: 1.07 }
    ]);
    setLeaves([
      { _id: 'l1', leaveType: 'Casual Leave', startDate: '2026-07-15', endDate: '2026-07-16', reason: 'Family trip', status: 'Approved' }
    ]);
    setPayroll([
      { _id: 'p1', month: 'June 2026', basicSalary: 60000, hra: 12000, bonus: 5000, overtime: 3000, deductions: 2500, netSalary: 77500, status: 'Paid', processedDate: '2026-06-30' }
    ]);
    setProjects([
      { _id: 'pr1', projectName: 'Employee Portal', description: 'Enterprise Workforce Management Tool', manager: 'EMP002', status: 'In Progress', deadline: '2026-09-30' }
    ]);
    setTasks([
      { _id: 't1', projectId: 'pr1', project: 'Employee Portal', task: 'Build Attendance Module', assignedTo: 'EMP003', priority: 'High', status: 'In Progress', deadline: '2026-08-15' }
    ]);
    setAssets([
      { _id: 'as1', assetName: 'MacBook Pro 16"', serialNumber: 'MBP-2026-X99', type: 'Laptop', assignedTo: 'EMP003', status: 'Assigned' }
    ]);
    setTickets([
      { _id: 'tk1', employeeId: 'EMP003', title: 'VPN Access Request', description: 'Need credentials for remote staging server.', priority: 'Medium', status: 'Open' }
    ]);
  };

  // Auth Operations
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('employeeId', data.employeeId || '');
        localStorage.setItem('name', data.name);

        setToken(data.token);
        setUserRole(data.role);
        setUserId(data.userId);
        setEmpId(data.employeeId || '');
        setUserName(data.name);
        
        setAuthSuccess('Welcome back!');
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed. Verify credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUserRole('');
    setUserId('');
    setEmpId('');
    setUserName('');
    setCurrentTab('overview');
  };

  // Clock operations (FR-A01 / GPS simulation)
  const handleClockIn = async (isWfh) => {
    try {
      let lat = null, lon = null;
      if (gpsSimulated) {
        lat = '12.9716';
        lon = '77.5946'; // Bangalore coordinates
      }
      const data = await apiFetch('/api/attendance/clock-in', {
        method: 'POST',
        body: JSON.stringify({ latitude: lat, longitude: lon, isWfh, qrScanned: qrSimulated })
      });
      if (data.success) {
        alert(data.message);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClockOut = async () => {
    try {
      const data = await apiFetch('/api/attendance/clock-out', { method: 'POST' });
      if (data.success) {
        alert(data.message);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // AI assistant chat logic
  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userMsg = aiMessage;
    setAiMessage('');
    setAiHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiLoading(true);

    try {
      const data = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg, customApiKey })
      });
      if (data.success) {
        setAiHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      setAiHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I couldn't reach the AI services server. Please ensure the backend is running. Fallback: Your profile code is linked to role **${userRole}**.` 
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Action submit handlers (Forms CRUD)
  const handleCreateEmp = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/employees', {
        method: 'POST',
        body: JSON.stringify(newEmpData)
      });
      if (data.success) {
        alert(`Employee registered! ID: ${data.employee.employeeId}. Password is ${data.generatedCredentials.password}`);
        setShowAddEmp(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateDep = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/organization/departments', {
        method: 'POST',
        body: JSON.stringify(newDepData)
      });
      if (data.success) {
        setShowAddDep(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCand = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/recruitment/candidates', {
        method: 'POST',
        body: JSON.stringify(newCandData)
      });
      if (data.success) {
        setShowAddCand(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResumeAnalysis = async (candidateId) => {
    try {
      const data = await apiFetch(`/api/recruitment/candidates/${candidateId}/analyze-resume`, { method: 'POST' });
      if (data.success) {
        alert(`Resume analysis complete! Candidate score: ${data.analysis.score}`);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateProj = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(newProjData)
      });
      if (data.success) {
        setShowAddProj(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/projects/tasks', {
        method: 'POST',
        body: JSON.stringify(newTaskData)
      });
      if (data.success) {
        setShowAddTask(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(newTicketData)
      });
      if (data.success) {
        setShowAddTicket(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/assets', {
        method: 'POST',
        body: JSON.stringify(newAssetData)
      });
      if (data.success) {
        setShowAddAsset(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Run monthly payroll runner
  const handleRunPayroll = async () => {
    const month = prompt("Enter Month (e.g., 'July 2026')");
    if (!month) return;
    try {
      const data = await apiFetch('/api/payroll/run', {
        method: 'POST',
        body: JSON.stringify({ month })
      });
      if (data.success) {
        alert(data.message);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Task Kanban column transitions
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const data = await apiFetch(`/api/projects/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Leave approval triggers
  const handleLeaveReview = async (leaveId, action) => {
    try {
      const data = await apiFetch(`/api/leaves/review/${leaveId}`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      if (data.success) {
        alert(`Leave application ${action} successfully.`);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Auth UI Rendering if not logged in
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-box glass-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Globe className="text-primary" size={32} />
              <span>WORKFORCE</span>
            </div>
            <p className="page-subtitle">Enterprise Lifecycle Platform with Operations AI</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                required 
              />
            </div>

            {authError && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '15px' }}><AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />{authError}</div>}
            {authSuccess && <div style={{ color: 'var(--secondary)', fontSize: '13px', marginBottom: '15px' }}><CheckCircle2 size={14} style={{ display: 'inline', marginRight: '6px' }} />{authSuccess}</div>}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Sign In</button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <p>Demo Logins (Password criteria: Uppercase, Lowercase, Special Char, Number):</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
              <code>SuperAdmin: admin@company.com / Admin@123</code>
              <code>HR Manager: hr@company.com / HrManager@123</code>
              <code>Team Lead/Manager: manager@company.com / Manager@123</code>
              <code>Employee: employee@company.com / Employee@123</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Main Portal Interface
  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Globe className="text-primary" size={24} />
          <span>WORKFORCE</span>
        </div>
        
        <nav className="sidebar-menu">
          <div className="sidebar-item" onClick={() => setCurrentTab('overview')}>
            <BarChart3 size={18} /> Overview
          </div>
          
          {/* RBAC Sidebar display limits */}
          {['SUPER_ADMIN', 'HR'].includes(userRole) && (
            <div className="sidebar-item" onClick={() => setCurrentTab('employees')}>
              <Users size={18} /> Employee Directory
            </div>
          )}

          {['SUPER_ADMIN', 'HR', 'MANAGER'].includes(userRole) && (
            <div className="sidebar-item" onClick={() => setCurrentTab('recruitment')}>
              <Briefcase size={18} /> Recruitment Hub
            </div>
          )}

          <div className="sidebar-item" onClick={() => setCurrentTab('attendance')}>
            <Clock size={18} /> Attendance Logs
          </div>

          <div className="sidebar-item" onClick={() => setCurrentTab('leaves')}>
            <Calendar size={18} /> Leave Center
          </div>

          <div className="sidebar-item" onClick={() => setCurrentTab('payroll')}>
            <DollarSign size={18} /> Payroll Slips
          </div>

          <div className="sidebar-item" onClick={() => setCurrentTab('projects')}>
            <Award size={18} /> Projects & Tasks
          </div>

          <div className="sidebar-item" onClick={() => setCurrentTab('assets')}>
            <Laptop size={18} /> IT Assets
          </div>

          <div className="sidebar-item" onClick={() => setCurrentTab('tickets')}>
            <HelpCircle size={18} /> Help Desk
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">{userName[0]}</div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">{userRole.replace('_', ' ')}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main panel content */}
      <main className="main-wrapper">
        <header className="top-bar">
          <div>
            <h1 className="page-title">{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Dashboard</h1>
            <p className="page-subtitle">Welcome back, {userName}. Managing operations smoothly.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Custom Dev API setting bar */}
            <div style={{ display: 'flex', gap: '6px', fontSize: '11px', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
              <Bot size={13} style={{ color: 'var(--primary)' }} />
              <input 
                type="password" 
                placeholder="Optional Gemini Key" 
                style={{ background: 'transparent', border: 'none', color: 'white', width: '120px', fontSize: '11px', outline: 'none' }}
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', width: 'auto', borderRadius: '50%' }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={16} />
              </button>
              {showNotifications && (
                <div className="glass-card" style={{ position: 'absolute', right: 0, top: '48px', width: '320px', zIndex: 1000, padding: '16px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-glass-active)' }}>
                  <h4 style={{ marginBottom: '12px' }}>Notifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No new alerts.</p>
                    ) : (
                      notifications.map((not, idx) => (
                        <div key={idx} style={{ padding: '8px', borderBottom: '1px solid var(--border-glass)', fontSize: '12px' }}>
                          {not.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab contents router */}
        {currentTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="metrics-grid">
              <div className="glass-card metric-card">
                <div>
                  <div className="metric-label">Active Employees</div>
                  <div className="metric-val">{employees.length}</div>
                </div>
                <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="glass-card metric-card">
                <div>
                  <div className="metric-label">Active Projects</div>
                  <div className="metric-val">{projects.length}</div>
                </div>
                <div className="metric-icon-box" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                  <Briefcase size={20} />
                </div>
              </div>
              <div className="glass-card metric-card">
                <div>
                  <div className="metric-label">Leaves Taken</div>
                  <div className="metric-val">{leaves.filter(l => l.status === 'Approved').length}</div>
                </div>
                <div className="metric-icon-box" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>
                  <Calendar size={20} />
                </div>
              </div>
              <div className="glass-card metric-card">
                <div>
                  <div className="metric-label">IT Assets Assigned</div>
                  <div className="metric-val">{assets.filter(a => a.status === 'Assigned').length}</div>
                </div>
                <div className="metric-icon-box" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--info)' }}>
                  <Laptop size={20} />
                </div>
              </div>
            </div>

            {/* Dashboard Graphs Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>Organization Growth & Workloads</h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <AreaChart data={[
                      { name: 'Jan', Employees: 10, Tasks: 15 },
                      { name: 'Feb', Employees: 12, Tasks: 24 },
                      { name: 'Mar', Employees: 15, Tasks: 32 },
                      { name: 'Apr', Employees: 18, Tasks: 45 },
                      { name: 'May', Employees: 22, Tasks: 50 },
                      { name: 'Jun', Employees: employees.length || 24, Tasks: tasks.length || 65 }
                    ]}>
                      <defs>
                        <linearGradient id="colorEmp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTsk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" />
                      <Tooltip contentStyle={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-glass)' }} />
                      <Area type="monotone" dataKey="Employees" stroke="var(--primary)" fillOpacity={1} fill="url(#colorEmp)" />
                      <Area type="monotone" dataKey="Tasks" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorTsk)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>Quick Self Clock-In</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
                    <span>Simulate GPS Mode</span>
                    <button 
                      className={`badge ${gpsSimulated ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => setGpsSimulated(!gpsSimulated)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {gpsSimulated ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
                    <span>Simulate Office QR Scan</span>
                    <button 
                      className={`badge ${qrSimulated ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => setQrSimulated(!qrSimulated)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {qrSimulated ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn btn-primary" onClick={() => handleClockIn(false)}>
                      <MapPin size={16} /> Office Clock-In
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleClockIn(true)}>
                      <Globe size={16} /> WFH Clock-In
                    </button>
                  </div>
                  <button className="btn btn-secondary" style={{ borderColor: 'var(--danger-glow)', color: 'var(--danger)' }} onClick={handleClockOut}>
                    <LogOut size={16} /> Clock-Out Daily Shift
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'employees' && (
          <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Active Workforce Profile Catalog</h3>
              {['SUPER_ADMIN', 'HR'].includes(userRole) && (
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddEmp(true)}>
                  <Plus size={16} /> Register Employee
                </button>
              )}
            </div>

            {showAddEmp && (
              <form onSubmit={handleCreateEmp} className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--border-glass-active)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-input" required onChange={e => setNewEmpData({...newEmpData, firstName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-input" required onChange={e => setNewEmpData({...newEmpData, lastName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" required onChange={e => setNewEmpData({...newEmpData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-input" onChange={e => setNewEmpData({...newEmpData, department: e.target.value})}>
                      <option value="">Select Dept</option>
                      {departments.map(d => <option key={d._id} value={d.departmentName}>{d.departmentName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input type="text" className="form-input" required onChange={e => setNewEmpData({...newEmpData, designation: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input type="date" className="form-input" required onChange={e => setNewEmpData({...newEmpData, joiningDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Basic Monthly Salary (Rs.)</label>
                    <input type="number" className="form-input" required onChange={e => setNewEmpData({...newEmpData, basicSalary: parseFloat(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">HRA Allowance (Rs.)</label>
                    <input type="number" className="form-input" required onChange={e => setNewEmpData({...newEmpData, hra: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowAddEmp(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Submit Registration</button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Salary Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id}>
                      <td><code>{emp.employeeId}</code></td>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.salaryGrade}</td>
                      <td><span className="badge badge-success">{emp.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'recruitment' && (
          <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Hiring Pipeline & AI Resume Analyzer</h3>
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddCand(true)}>
                <Plus size={16} /> New Application
              </button>
            </div>

            {showAddCand && (
              <form onSubmit={handleCreateCand} className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--border-glass-active)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Candidate Name</label>
                    <input type="text" className="form-input" required onChange={e => setNewCandData({...newCandData, candidateName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" required onChange={e => setNewCandData({...newCandData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input type="number" className="form-input" required onChange={e => setNewCandData({...newCandData, experience: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Key Skills (Comma separated)</label>
                    <input type="text" className="form-input" placeholder="React, Node, MongoDB" required onChange={e => setNewCandData({...newCandData, skills: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowAddCand(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Add Candidate</button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Experience</th>
                    <th>Skills Match</th>
                    <th>Pipeline Status</th>
                    <th>AI Parse Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(cand => (
                    <tr key={cand._id}>
                      <td><strong>{cand.candidateName}</strong></td>
                      <td>{cand.email}</td>
                      <td>{cand.experience} Years</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {cand.skills.map((s, i) => <span key={i} className="badge badge-info" style={{ fontSize: '9px', padding: '2px 6px' }}>{s}</span>)}
                        </div>
                      </td>
                      <td><span className="badge badge-warning">{cand.status}</span></td>
                      <td>
                        {cand.aiAnalysis ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{cand.aiAnalysis.score}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Matching</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Not Analyzed</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '11px', width: 'auto' }}
                            onClick={() => handleResumeAnalysis(cand._id)}
                          >
                            <Bot size={13} style={{ marginRight: '4px' }} /> Run AI Parser
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'attendance' && (
          <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ marginBottom: '20px' }}>Your Shift Attendance Log</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Working Hours</th>
                    <th>Overtime (Hrs)</th>
                    <th>Verification Mode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(att => (
                    <tr key={att._id}>
                      <td>{att.date}</td>
                      <td><code>{att.clockIn}</code></td>
                      <td><code>{att.clockOut || '--:--'}</code></td>
                      <td>{att.workingHours} Hours</td>
                      <td>{att.overtime} Hours</td>
                      <td><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{att.location || 'Browser Verified'}</span></td>
                      <td>
                        <span className={`badge ${att.status === 'Present' || att.status === 'Work From Home' ? 'badge-success' : 'badge-warning'}`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'leaves' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="metrics-grid">
              <div className="glass-card">
                <div className="metric-label">Casual Leaves</div>
                <div className="metric-val">12 Days</div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Standard Annual balance</p>
              </div>
              <div className="glass-card">
                <div className="metric-label">Sick Leaves</div>
                <div className="metric-val">10 Days</div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Standard medical balance</p>
              </div>
              <div className="glass-card">
                <div className="metric-label">Earned Leaves</div>
                <div className="metric-val">15 Days</div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Privilege carry forward balance</p>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '20px' }}>Submit Leave Request</h3>
              <div style={{ display: 'flex', gap: '20px' }}>
                <form style={{ flex: 1 }} onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  try {
                    const data = await apiFetch('/api/leaves/apply', {
                      method: 'POST',
                      body: JSON.stringify({
                        leaveType: fd.get('leaveType'),
                        startDate: fd.get('startDate'),
                        endDate: fd.get('endDate'),
                        reason: fd.get('reason')
                      })
                    });
                    if (data.success) {
                      alert('Leave application submitted!');
                      fetchDashboardData();
                      e.target.reset();
                    }
                  } catch (err) {
                    alert(err.message);
                  }
                }}>
                  <div className="form-group">
                    <label className="form-label">Leave Type</label>
                    <select name="leaveType" className="form-input" required>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Earned Leave">Earned Leave</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input type="date" name="startDate" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input type="date" name="endDate" className="form-input" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason for Leave</label>
                    <textarea name="reason" className="form-input" style={{ minHeight: '80px' }} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Apply Leave</button>
                </form>

                <div style={{ flex: 1.2 }}>
                  <h4 style={{ marginBottom: '14px' }}>My Applied History</h4>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Leave Type</th>
                          <th>Dates</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.map((l, i) => (
                          <tr key={i}>
                            <td>{l.leaveType}</td>
                            <td>{l.startDate} to {l.endDate}</td>
                            <td><span className={`badge ${l.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>{l.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'payroll' && (
          <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Payslip History & Allowances</h3>
              {['SUPER_ADMIN', 'HR', 'FINANCE'].includes(userRole) && (
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleRunPayroll}>
                  <DollarSign size={16} /> Run Monthly Payroll
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Basic (Rs.)</th>
                    <th>HRA (Rs.)</th>
                    <th>Bonus (Rs.)</th>
                    <th>Overtime (Rs.)</th>
                    <th>Deductions</th>
                    <th>Net Payout (Rs.)</th>
                    <th>Status</th>
                    <th>Payslip Doc</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map(pay => (
                    <tr key={pay._id}>
                      <td>{pay.month}</td>
                      <td>{formatCurrency(pay.basicSalary)}</td>
                      <td>{formatCurrency(pay.hra)}</td>
                      <td>{formatCurrency(pay.bonus)}</td>
                      <td>{formatCurrency(pay.overtime)}</td>
                      <td>-{formatCurrency(pay.deductions)}</td>
                      <td><strong>{formatCurrency(pay.netSalary)}</strong></td>
                      <td><span className="badge badge-success">{pay.status}</span></td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', width: 'auto' }} onClick={() => {
                          alert(`Downloading Payslip for ${pay.month}\nEmployee: ${userName}\nNet take-home: ${formatCurrency(pay.netSalary)}`);
                        }}>
                          <FileText size={13} style={{ marginRight: '4px' }} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'projects' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Task Boards & Sprint Management</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowAddProj(true)}>
                  <Plus size={16} /> Register Project
                </button>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddTask(true)}>
                  <Plus size={16} /> New Task
                </button>
              </div>
            </div>

            {showAddProj && (
              <form onSubmit={handleCreateProj} className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--border-glass-active)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Project Name</label>
                    <input type="text" className="form-input" required onChange={e => setNewProjData({...newProjData, projectName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input type="date" className="form-input" required onChange={e => setNewProjData({...newProjData, deadline: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Manager (Employee ID)</label>
                    <input type="text" className="form-input" required onChange={e => setNewProjData({...newProjData, manager: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-input" required onChange={e => setNewProjData({...newProjData, description: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowAddProj(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Create Project</button>
                </div>
              </form>
            )}

            {showAddTask && (
              <form onSubmit={handleCreateTask} className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--border-glass-active)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Project</label>
                    <select className="form-input" required onChange={e => setNewTaskData({...newTaskData, projectId: e.target.value})}>
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Task Name</label>
                    <input type="text" className="form-input" required onChange={e => setNewTaskData({...newTaskData, task: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign To (Employee ID)</label>
                    <input type="text" className="form-input" required onChange={e => setNewTaskData({...newTaskData, assignedTo: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input type="date" className="form-input" required onChange={e => setNewTaskData({...newTaskData, deadline: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowAddTask(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Assign Task</button>
                </div>
              </form>
            )}

            {/* Kanban Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
              {['To Do', 'In Progress', 'Review', 'Completed'].map(col => {
                const colTasks = tasks.filter(t => t.status === col);
                return (
                  <div key={col} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: '14px', borderBottom: '2px solid rgba(255,255,255,0.05)', paddingBottom: '6px', textTransform: 'uppercase', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {col} ({colTasks.length})
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {colTasks.map(t => (
                        <div key={t._id} className="glass-card" style={{ padding: '12px', background: 'var(--bg-card)' }}>
                          <span className={`badge ${t.priority === 'High' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '9px', padding: '2px 6px', marginBottom: '6px' }}>{t.priority}</span>
                          <p style={{ fontSize: '13.5px', fontWeight: '600', marginBottom: '8px' }}>{t.task}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            <span>Dead: {t.deadline}</span>
                            <code>{t.assignedTo}</code>
                          </div>
                          
                          {/* Kanban transitions */}
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                            {col === 'To Do' && (
                              <button className="btn btn-secondary" style={{ padding: '4px', fontSize: '10px' }} onClick={() => handleTaskStatusChange(t._id, 'In Progress')}>Start</button>
                            )}
                            {col === 'In Progress' && (
                              <button className="btn btn-secondary" style={{ padding: '4px', fontSize: '10px' }} onClick={() => handleTaskStatusChange(t._id, 'Review')}>Submit Review</button>
                            )}
                            {col === 'Review' && ['SUPER_ADMIN', 'HR', 'MANAGER'].includes(userRole) && (
                              <button className="btn btn-primary" style={{ padding: '4px', fontSize: '10px' }} onClick={() => handleTaskStatusChange(t._id, 'Completed')}>Approve</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentTab === 'assets' && (
          <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Company IT Assets & Devices</h3>
              {['SUPER_ADMIN', 'IT'].includes(userRole) && (
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddAsset(true)}>
                  <Plus size={16} /> Add Asset
                </button>
              )}
            </div>

            {showAddAsset && (
              <form onSubmit={handleCreateAsset} className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--border-glass-active)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Asset Name</label>
                    <input type="text" className="form-input" placeholder="e.g. MacBook Pro M3" required onChange={e => setNewAssetData({...newAssetData, assetName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serial Number</label>
                    <input type="text" className="form-input" required onChange={e => setNewAssetData({...newAssetData, serialNumber: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" onChange={e => setNewAssetData({...newAssetData, type: e.target.value})}>
                      <option value="Laptop">Laptop</option>
                      <option value="Mobile Phone">Mobile Phone</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign To (Employee ID)</label>
                    <input type="text" className="form-input" placeholder="EMP003" onChange={e => setNewAssetData({...newAssetData, assignedTo: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowAddAsset(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Add Asset</button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Serial Number</th>
                    <th>Type</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => (
                    <tr key={asset._id}>
                      <td><strong>{asset.assetName}</strong></td>
                      <td><code>{asset.serialNumber}</code></td>
                      <td>{asset.type}</td>
                      <td>{asset.assignedTo || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                      <td><span className={`badge ${asset.status === 'Assigned' ? 'badge-success' : 'badge-warning'}`}>{asset.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'tickets' && (
          <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>IT Support Ticketing Dashboard</h3>
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddTicket(true)}>
                <Plus size={16} /> Raise Support Ticket
              </button>
            </div>

            {showAddTicket && (
              <form onSubmit={handleCreateTicket} className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--border-glass-active)' }}>
                <div className="form-group">
                  <label className="form-label">Ticket Title</label>
                  <input type="text" className="form-input" placeholder="VPN configuration or software error" required onChange={e => setNewTicketData({...newTicketData, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" onChange={e => setNewTicketData({...newTicketData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description of Issue</label>
                  <textarea className="form-input" style={{ minHeight: '80px' }} required onChange={e => setNewTicketData({...newTicketData, description: e.target.value})}></textarea>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowAddTicket(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Submit Ticket</button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket Title</th>
                    <th>Details</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions (IT Admin)</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(tkt => (
                    <tr key={tkt._id}>
                      <td><strong>{tkt.title}</strong></td>
                      <td>{tkt.description}</td>
                      <td><span className={`badge ${tkt.priority === 'High' ? 'badge-danger' : 'badge-info'}`}>{tkt.priority}</span></td>
                      <td><span className="badge badge-warning">{tkt.status}</span></td>
                      <td>
                        {tkt.status === 'Open' && ['SUPER_ADMIN', 'IT'].includes(userRole) && (
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', width: 'auto' }} onClick={async () => {
                            try {
                              const res = await apiFetch(`/api/tickets/${tkt._id}`, {
                                method: 'PUT',
                                body: JSON.stringify({ status: 'Resolved' })
                              });
                              if (res.success) {
                                alert('Ticket marked as Resolved.');
                                fetchDashboardData();
                              }
                            } catch (e) { alert(e.message); }
                          }}>
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Floating chatbot bubble trigger */}
      <div className="ai-trigger" onClick={() => setShowAi(!showAi)}>
        <Bot size={24} />
      </div>

      {/* Slideout Chat Panel */}
      {showAi && (
        <div className="ai-panel glass-card">
          <div className="ai-panel-header">
            <div className="ai-title">
              <Bot size={18} style={{ color: 'var(--primary)' }} />
              <span>Operations Assistant</span>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowAi(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="ai-messages">
            {aiHistory.map((h, i) => (
              <div key={i} className={`ai-msg ${h.role === 'user' ? 'ai-msg-user' : 'ai-msg-assistant'}`}>
                {h.content.split('\n').map((para, index) => {
                  if (para.startsWith('###')) return <h4 key={index} style={{ marginTop: '8px', marginBottom: '6px' }}>{para.replace('###', '')}</h4>;
                  if (para.startsWith('-')) return <li key={index} style={{ marginLeft: '12px', fontSize: '13px' }}>{para.replace('-', '')}</li>;
                  return <p key={index} style={{ marginBottom: '6px', fontSize: '13px' }}>{para}</p>;
                })}
              </div>
            ))}
            {aiLoading && (
              <div className="ai-msg ai-msg-assistant" style={{ fontStyle: 'italic' }}>
                Analyzing workforce records...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="ai-input-box" onSubmit={handleSendAiMessage}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask about leaves, salary, policies..." 
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '12px' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
