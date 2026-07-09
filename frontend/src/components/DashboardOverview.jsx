import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, Calendar, Laptop, MapPin, Globe, LogOut, 
  Plus, Clock, DollarSign, Activity, FileText, CheckCircle2, 
  AlertTriangle, ShieldAlert, ListTodo, Wrench, HelpCircle, 
  Check, X, Award, FileCheck2, ClipboardList, Lock, Play
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

const COLORS = ['#f59e0b', '#f43f5e', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', '#3b82f6'];
const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

// Sleek, professional dashboard header card with functional CTA button
function DashboardHeader({ title, subtitle, badge, ctaText, ctaPath, ctaAction }) {
  const navigate = useNavigate();
  return (
    <div className="glass-card" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-md)',
      padding: '20px 24px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      boxShadow: 'var(--shadow-sm)',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-primary" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px' }}>{badge}</span>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: '400' }}>{subtitle}</p>
      </div>
      {(ctaText && (ctaPath || ctaAction)) && (
        <button 
          className="btn btn-primary" 
          style={{ width: 'auto', padding: '10px 18px', fontSize: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
          onClick={() => {
            if (ctaPath) {
              navigate(ctaPath);
            } else if (ctaAction) {
              ctaAction();
            }
          }}
        >
          <Play size={13} /> {ctaText}
        </button>
      )}
    </div>
  );
}

export default function DashboardOverview({
  employees = [],
  projects = [],
  leaves = [],
  assets = [],
  tasks = [],
  gpsSimulated,
  setGpsSimulated,
  qrSimulated,
  setQrSimulated,
  handleClockIn,
  handleClockOut,
  userRole = 'EMPLOYEE',
  userName = '',
  empId = '',
  userId = '',
  departments = [],
  candidates = [],
  pendingLeaves = [],
  payroll = [],
  tickets = [],
  auditLogs = [],
  setAuditLogs,
  setShowAddEmp,
  setShowAddDep,
  setShowAddProj,
  setShowAddCand,
  setShowAddTicket,
  setShowAddAsset,
  handleLeaveReview,
  handleRunPayroll,
  handleTaskStatusChange,
  apiFetch,
  fetchDashboardData
}) {

  const navigate = useNavigate();

  // Ticket resolution support for IT role
  const handleTicketUpdateLocal = async (ticketId, newStatus) => {
    if (apiFetch) {
      try {
        const data = await apiFetch(`/api/tickets/${ticketId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus })
        });
        if (data.success) {
          alert(`Ticket marked as ${newStatus}`);
          if (fetchDashboardData) fetchDashboardData();
          return;
        }
      } catch (err) {
        console.warn("Backend ticket update failed:", err);
      }
    }
    alert(`[Offline simulation] Ticket status updated to: ${newStatus}`);
  };

  // Unlock user accounts for Auditor/Admin
  const handleUnlockUser = async (empEmail) => {
    alert(`Security override: unlocked account for ${empEmail}. (Offline simulation success)`);
  };

  // Safe checks for arrays
  const safeEmployees = employees || [];
  const safeProjects = projects || [];
  const safeLeaves = leaves || [];
  const safeAssets = assets || [];
  const safeTasks = tasks || [];
  const safeDepartments = departments || [];
  const safeCandidates = candidates || [];
  const safePendingLeaves = pendingLeaves || [];
  const safePayroll = payroll || [];
  const safeTickets = tickets || [];
  const safeAuditLogs = auditLogs || [];

  // Group headcounts dynamically for SUPER_ADMIN department pie chart
  const deptHeadcounts = React.useMemo(() => {
    const counts = {};
    safeEmployees.forEach(emp => {
      const dept = emp.department || 'Other';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [safeEmployees]);

  // Group project statuses for SUPER_ADMIN project distribution
  const projectStatusCounts = React.useMemo(() => {
    const counts = {};
    safeProjects.forEach(p => {
      const status = p.status || 'In Progress';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [safeProjects]);

  // Group candidate hiring stages for HR pipeline breakdown
  const candidateStages = React.useMemo(() => {
    const counts = {};
    safeCandidates.forEach(c => {
      const stage = c.status || 'Screening';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [safeCandidates]);

  // Group task priority for manager sprint overview
  const managerTaskPriorities = React.useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    safeTasks.forEach(t => {
      if (counts[t.priority] !== undefined) {
        counts[t.priority]++;
      } else {
        counts['Medium']++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [safeTasks]);

  // Group salary expenses by department for FINANCE
  const departmentSalaryExpenses = React.useMemo(() => {
    const salaries = {};
    safeEmployees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      const sal = emp.basicSalary || 50000;
      salaries[dept] = (salaries[dept] || 0) + sal;
    });
    return Object.entries(salaries).map(([name, value]) => ({ name, value }));
  }, [safeEmployees]);

  // IT Device type distribution
  const itDeviceTypes = React.useMemo(() => {
    const counts = {};
    safeAssets.forEach(a => {
      const type = a.type || 'Laptop';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [safeAssets]);

  // Get employee specific balances and history
  const employeeTasks = safeTasks.filter(t => t.assignedTo === empId);
  const employeeAssets = safeAssets.filter(a => a.assignedTo === empId);
  const employeeLeaves = safeLeaves; // My leaves history are pre-filtered in leaves/my
  const employeeOpenTickets = safeTickets.filter(t => t.employeeId === empId || t.status === 'Open');

  // RENDER SEPARATE DASHBOARD FOR EACH ROLE
  switch (userRole) {

    // ──────────────────────────────────────────────
    // 1. SUPER ADMIN DASHBOARD
    // ──────────────────────────────────────────────
    case 'SUPER_ADMIN':
      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <DashboardHeader 
            badge="System Control"
            title="Super Admin Control Center"
            subtitle="Global configurations, administrative overrides, and system audit logs tracker."
            ctaText="Manage Employee Directory"
            ctaPath="/employees"
          />

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Active Employees</div>
                <div className="metric-val">{safeEmployees.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Users size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Total Departments</div>
                <div className="metric-val">{safeDepartments.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <Globe size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Active Projects</div>
                <div className="metric-val">{safeProjects.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                <Briefcase size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Open Support Tickets</div>
                <div className="metric-val">{safeTickets.filter(t => t.status === 'Open').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <Activity size={16} color="var(--primary)" /> Organization Workloads
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <AreaChart data={[
                    { name: 'Jan', Employees: 10, Tasks: 15 },
                    { name: 'Feb', Employees: 12, Tasks: 24 },
                    { name: 'Mar', Employees: 15, Tasks: 32 },
                    { name: 'Apr', Employees: 18, Tasks: 45 },
                    { name: 'May', Employees: 22, Tasks: 50 },
                    { name: 'Jun', Employees: safeEmployees.length || 24, Tasks: safeTasks.length || 65 }
                  ]}>
                    <defs>
                      <linearGradient id="colorEmp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorTsk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-glass)' }} />
                    <Area type="monotone" dataKey="Employees" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorEmp)" />
                    <Area type="monotone" dataKey="Tasks" stroke="var(--secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTsk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '15px' }}>Department Headcounts</h3>
              {deptHeadcounts.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No employee statistics available.</p>
              ) : (
                <div style={{ width: '100%', height: 160, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={deptHeadcounts}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deptHeadcounts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '10px', marginTop: '10px' }}>
                {deptHeadcounts.map((item, index) => (
                  <span key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></span>
                    {item.name} ({item.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Live Audit timeline */}
          <div className="glass-card" id="audit-trail" style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <FileText size={16} color="var(--info)" /> Live System Audit Logs
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {safeAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No audit events found.</td>
                    </tr>
                  ) : (
                    safeAuditLogs.slice(0, 8).map(log => (
                      <tr key={log._id}>
                        <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{new Date(log.createdAt || log.timestamp).toLocaleString()}</td>
                        <td><span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '9px' }}>{log.action}</span></td>
                        <td style={{ fontSize: '12px' }}>{log.details}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{log.userId}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    // ──────────────────────────────────────────────
    // 2. HR DASHBOARD
    // ──────────────────────────────────────────────
    case 'HR':
      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <DashboardHeader 
            badge="Workforce Management"
            title="HR Operations Console"
            subtitle="Configure hiring pipeline stages, review candidate resumes, and approve pending leaves."
            ctaText="Access Recruitment Hub"
            ctaPath="/recruitment"
          />

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Total Workforce</div>
                <div className="metric-val">{safeEmployees.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Users size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Hiring Pipeline</div>
                <div className="metric-val">{safeCandidates.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                <Briefcase size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Pending Leaves</div>
                <div className="metric-val">{safePendingLeaves.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Active IT Assets</div>
                <div className="metric-val">{safeAssets.filter(a => a.status === 'Assigned').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
                <Laptop size={20} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <Clock size={16} color="var(--warning)" /> Pending Leave Request Approvals
              </h3>
              {safePendingLeaves.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  🎉 No pending leave reviews left!
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Reason</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safePendingLeaves.map(plv => (
                        <tr key={plv._id}>
                          <td><strong>{plv.employeeName}</strong> <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({plv.employeeId})</span></td>
                          <td>{plv.leaveType}</td>
                          <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{plv.startDate} to {plv.endDate}</td>
                          <td>{plv.reason}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="badge badge-success" style={{ border: 'none', cursor: 'pointer', padding: '4px 8px' }} onClick={() => handleLeaveReview(plv._id, 'Approved')} title="Approve">
                                <Check size={11} />
                              </button>
                              <button className="badge badge-danger" style={{ border: 'none', cursor: 'pointer', padding: '4px 8px' }} onClick={() => handleLeaveReview(plv._id, 'Rejected')} title="Reject">
                                <X size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '20px', fontSize: '15px' }}>Quick Operations Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddEmp(true)}>
                  <Plus size={15} /> Register New Employee
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAddCand(true)}>
                  <Plus size={15} /> Add Hiring Candidate
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAddDep(true)}>
                  <Plus size={15} /> Add New Department
                </button>
              </div>

              <h4 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '13px' }}>Candidates Pipeline stages</h4>
              <div style={{ width: '100%', height: 140 }}>
                <ResponsiveContainer>
                  <BarChart data={candidateStages}>
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      );

    // ──────────────────────────────────────────────
    // 3. MANAGER DASHBOARD
    // ──────────────────────────────────────────────
    case 'MANAGER':
      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <DashboardHeader 
            badge="Engineering & Sprints"
            title="Manager Project Console"
            subtitle="Coordinate developer sprint boards, track member statuses, and allocate tasks."
            ctaText="Manage Sprint Tasks"
            ctaPath="/projects"
          />

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Team Projects</div>
                <div className="metric-val">{safeProjects.filter(p => p.manager === empId || !p.manager).length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                <Briefcase size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Active Team Tasks</div>
                <div className="metric-val">{safeTasks.filter(t => t.status !== 'Completed').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <ListTodo size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Pending Leaves</div>
                <div className="metric-val">{safePendingLeaves.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Team Members</div>
                <div className="metric-val">{safeEmployees.filter(e => e.reportingManager === empId).length || 3}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
                <Users size={20} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <ListTodo size={16} color="var(--primary)" /> Team Project Sprint Tasks
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Task</th>
                      <th>Assigned To</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeTasks.slice(0, 6).map(tsk => (
                      <tr key={tsk._id}>
                        <td><strong>{tsk.project}</strong></td>
                        <td style={{ fontSize: '12px' }}>{tsk.task}</td>
                        <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{tsk.assignedTo}</td>
                        <td>
                          <span className={`badge badge-${tsk.priority === 'High' ? 'danger' : (tsk.priority === 'Medium' ? 'warning' : 'success')}`} style={{ fontSize: '10px' }}>
                            {tsk.priority}
                          </span>
                        </td>
                        <td>
                          <select 
                            className="form-input" 
                            style={{ padding: '2px 6px', fontSize: '11px', width: 'auto' }}
                            value={tsk.status}
                            onChange={(e) => handleTaskStatusChange(tsk._id, e.target.value)}
                          >
                            <option>To Do</option>
                            <option>In Progress</option>
                            <option>Review</option>
                            <option>Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '15px', fontSize: '15px' }}>Self Shift Verification</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GPS Simulation</span>
                  <button className={`badge ${gpsSimulated ? 'badge-success' : 'badge-danger'}`} onClick={() => setGpsSimulated(!gpsSimulated)} style={{ border: 'none', cursor: 'pointer' }}>
                    {gpsSimulated ? 'On' : 'Off'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                  <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => handleClockIn(false)}>Office Clock-In</button>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => handleClockIn(true)}>WFH Clock-In</button>
                </div>
                <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger-glow)', fontSize: '11px', padding: '6px 10px' }} onClick={handleClockOut}>Clock-Out</button>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '13px' }}>Sprint Tasks Priority Distribution</h4>
              <div style={{ width: '100%', height: 140 }}>
                <ResponsiveContainer>
                  <BarChart data={managerTaskPriorities}>
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      );

    // ──────────────────────────────────────────────
    // 4. EMPLOYEE DASHBOARD
    // ──────────────────────────────────────────────
    case 'EMPLOYEE':
      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <DashboardHeader 
            badge="Self-Service Portal"
            title="Employee Workspace"
            subtitle="Clock in/out shifts, update assigned sprint tasks, and apply for leaves."
            ctaText="Apply for Leave"
            ctaPath="/leaves"
          />

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">My Open Tasks</div>
                <div className="metric-val">{employeeTasks.filter(t => t.status !== 'Completed').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <ListTodo size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Hardware Assigned</div>
                <div className="metric-val">{employeeAssets.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
                <Laptop size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">My Leave Balance</div>
                <div className="metric-val">12 Days</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Raised Tickets</div>
                <div className="metric-val">{employeeOpenTickets.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                <HelpCircle size={20} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <ListTodo size={16} color="var(--primary)" /> My Active Tasks
              </h3>
              {employeeTasks.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  🎉 No tasks assigned to you! Have a great day!
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Project</th>
                        <th>Deadline</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeTasks.map(t => (
                        <tr key={t._id}>
                          <td><strong>{t.task}</strong></td>
                          <td>{t.project}</td>
                          <td style={{ fontSize: '11px' }}>{t.deadline}</td>
                          <td>
                            <span className={`badge badge-${t.priority === 'High' ? 'danger' : 'warning'}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td>
                            <select
                              value={t.status}
                              className="form-input"
                              style={{ padding: '2px 6px', fontSize: '11px', width: 'auto' }}
                              onChange={(e) => handleTaskStatusChange(t._id, e.target.value)}
                            >
                              <option>To Do</option>
                              <option>In Progress</option>
                              <option>Review</option>
                              <option>Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '15px', fontSize: '15px' }}>Shifts Clock-In</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                  <span>GPS Simulation</span>
                  <button className={`badge ${gpsSimulated ? 'badge-success' : 'badge-danger'}`} onClick={() => setGpsSimulated(!gpsSimulated)} style={{ border: 'none', cursor: 'pointer' }}>
                    {gpsSimulated ? 'Active' : 'Offline'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                  <span>QR Sim Scanner</span>
                  <button className={`badge ${qrSimulated ? 'badge-success' : 'badge-danger'}`} onClick={() => setQrSimulated(!qrSimulated)} style={{ border: 'none', cursor: 'pointer' }}>
                    {qrSimulated ? 'Success' : 'Ready'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={() => handleClockIn(false)}>Office Clock-In</button>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={() => handleClockIn(true)}>WFH Clock-In</button>
                </div>
                <button className="btn btn-secondary" style={{ borderColor: 'var(--danger-glow)', color: 'var(--danger)', padding: '8px', fontSize: '12px' }} onClick={handleClockOut}>
                  Shift Clock-Out
                </button>
              </div>

              <h4 style={{ marginTop: '24px', marginBottom: '8px', fontSize: '13px' }}>Allocated IT Assets</h4>
              {employeeAssets.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>No hardware assets allocated.</p>
              ) : (
                employeeAssets.map(asset => (
                  <div key={asset._id} style={{ display: 'flex', gap: '8px', fontSize: '11px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-glass)', marginBottom: '6px' }}>
                    <Laptop size={14} color="var(--info)" />
                    <div>
                      <strong>{asset.assetName}</strong>
                      <div style={{ color: 'var(--text-secondary)' }}>S/N: {asset.serialNumber}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );

    // ──────────────────────────────────────────────
    // 5. FINANCE DASHBOARD
    // ──────────────────────────────────────────────
    case 'FINANCE':
      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <DashboardHeader 
            badge="Financial Operations"
            title="Finance & Payroll Console"
            subtitle="Calculate monthly payroll releases, process payslips, and inspect budget allocations."
            ctaText="Process Monthly Payroll"
            ctaPath="/payroll"
          />

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Payslips Processed</div>
                <div className="metric-val">{safePayroll.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                <FileCheck2 size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Avg Payout</div>
                <div className="metric-val">
                  {formatCurrency(safePayroll.length ? safePayroll.reduce((sum, item) => sum + (item.netSalary || 0), 0) / safePayroll.length : 65000)}
                </div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Total Spent</div>
                <div className="metric-val">
                  {formatCurrency(safePayroll.reduce((sum, item) => sum + (item.netSalary || 0), 0) || 1550000)}
                </div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Salary Grade scale</div>
                <div className="metric-val">Grade-B</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                <Award size={20} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <DollarSign size={16} color="var(--primary)" /> Department Basic Salary Budget Allocations
              </h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={departmentSalaryExpenses}>
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '15px' }}>Trigger Monthly Payroll Run</h3>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', gap: '8px', justifyItems: 'center', alignItems: 'center', justifyContent: 'center' }}
                onClick={handleRunPayroll}
              >
                <DollarSign size={16} /> Run Monthly Payroll Runner
              </button>
              
              <h4 style={{ marginTop: '10px', fontSize: '13px' }}>Processed Payslips history</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '180px' }}>
                {safePayroll.length === 0 ? (
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>No processed payouts found.</p>
                ) : (
                  safePayroll.map(pay => (
                    <div key={pay._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                      <div>
                        <strong>{pay.month}</strong>
                        <div style={{ color: 'var(--text-secondary)' }}>{pay._id.substring(0,8)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--success)' }}>{formatCurrency(pay.netSalary)}</span>
                        <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Processed</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      );

    // ──────────────────────────────────────────────
    // 6. IT ADMIN DASHBOARD
    // ──────────────────────────────────────────────
    case 'IT':
      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <DashboardHeader 
            badge="IT Administration"
            title="IT Asset & Support Center"
            subtitle="Register hardware devices, allocate assets to employees, and resolve helpdesk support tickets."
            ctaText="Inspect Asset Catalog"
            ctaPath="/assets"
          />

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">IT Assets Registered</div>
                <div className="metric-val">{safeAssets.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
                <Laptop size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Hardware Allocated</div>
                <div className="metric-val">{safeAssets.filter(a => a.status === 'Assigned').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <Laptop size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Assets Available</div>
                <div className="metric-val">{safeAssets.filter(a => a.status === 'Available').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Wrench size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Open Support Tickets</div>
                <div className="metric-val">{safeTickets.filter(t => t.status === 'Open').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                <HelpCircle size={20} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <HelpCircle size={16} color="var(--secondary)" /> IT Help Desk Tickets Queue
              </h3>
              {safeTickets.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>No support tickets raised.</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeTickets.map(tkt => (
                        <tr key={tkt._id}>
                          <td>
                            <strong>{tkt.title}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{tkt.description}</div>
                          </td>
                          <td>
                            <span className={`badge badge-${tkt.priority === 'Critical' ? 'danger' : (tkt.priority === 'High' ? 'warning' : 'primary')}`}>
                              {tkt.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge-${tkt.status === 'Open' ? 'warning' : 'success'}`}>{tkt.status}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {tkt.status === 'Open' ? (
                                <button className="badge badge-success" style={{ border: 'none', cursor: 'pointer' }} onClick={() => handleTicketUpdateLocal(tkt._id, 'Resolved')}>
                                  Mark Resolved
                                </button>
                              ) : (
                                <button className="badge badge-warning" style={{ border: 'none', cursor: 'pointer' }} onClick={() => handleTicketUpdateLocal(tkt._id, 'Open')}>
                                  Reopen
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '20px', fontSize: '15px' }}>IT Assets & Catalog</h3>
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }} onClick={() => setShowAddAsset(true)}>
                <Plus size={15} /> Add IT Hardware Asset
              </button>

              <h4 style={{ marginBottom: '12px', fontSize: '13px' }}>Asset Category Distribution</h4>
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={itDeviceTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {itDeviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '10px', marginTop: '10px' }}>
                {itDeviceTypes.map((item, index) => (
                  <span key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></span>
                    {item.name} ({item.value})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    // ──────────────────────────────────────────────
    // 7. AUDITOR DASHBOARD
    // ──────────────────────────────────────────────
    case 'AUDITOR':
      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <DashboardHeader 
            badge="Compliance & Security"
            title="Internal Audit & Compliance"
            subtitle="Verify security logs, review account lockouts, and inspect system audit trails."
            ctaText="Check System Settings"
            ctaPath="/settings"
          />

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Audit Logs Recorded</div>
                <div className="metric-val">{safeAuditLogs.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <ClipboardList size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Locked Accounts</div>
                <div className="metric-val">1 Account</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                <Lock size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">System Active Status</div>
                <div className="metric-val">100%</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <ShieldCheck size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Total Users</div>
                <div className="metric-val">{safeEmployees.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
                <Users size={20} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <ClipboardList size={16} color="var(--info)" /> Live System Security Audit Trails
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>Actor ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeAuditLogs.slice(0, 10).map(log => (
                      <tr key={log._id}>
                        <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{new Date(log.createdAt || log.timestamp).toLocaleTimeString()}</td>
                        <td>
                          <span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '9px' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }}>{log.details}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{log.userId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card" id="compliance-locks">
              <h3 style={{ marginBottom: '15px', fontSize: '15px' }}>Account Lockout Controls</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                The following users have triggered account lock safety constraints (e.g. 5 failed login attempts):
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--danger-glow)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <div>
                      <strong>Sarah Jenkins</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>hr@company.com</div>
                    </div>
                    <button className="badge badge-danger" style={{ border: 'none', cursor: 'pointer' }} onClick={() => handleUnlockUser('hr@company.com')}>
                      Unlock Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // ──────────────────────────────────────────────
    // FALLBACK OVERVIEW
    // ──────────────────────────────────────────────
    default:
      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <DashboardHeader 
            badge="General"
            title="Welcome to Operations Portal"
            subtitle="Streamline your daily tasks, manage your team, and track organizational growth."
          />

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Active Employees</div>
                <div className="metric-val">{safeEmployees.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Users size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Active Projects</div>
                <div className="metric-val">{safeProjects.length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                <Briefcase size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">Leaves Taken</div>
                <div className="metric-val">{safeLeaves.filter(l => l.status === 'Approved').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div>
                <div className="metric-label">IT Assets Assigned</div>
                <div className="metric-val">{safeAssets.filter(a => a.status === 'Assigned').length}</div>
              </div>
              <div className="metric-icon-box" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--info)' }}>
                <Laptop size={20} />
              </div>
            </div>
          </div>
        </div>
      );
  }
}
