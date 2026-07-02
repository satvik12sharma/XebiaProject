import React from 'react';
import { Calendar } from 'lucide-react';

export default function LeavePage({ 
  leaves, 
  leaveBalances, 
  pendingLeaves, 
  handleApplyLeave, 
  handleLeaveReview, 
  userRole 
}) {
  const [showApplyLeave, setShowApplyLeave] = React.useState(false);
  const [leaveForm, setLeaveForm] = React.useState({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });

  const defaultBalances = {
    allocated: { 'Casual Leave': 12, 'Sick Leave': 10, 'Earned Leave': 15 },
    used: { 'Casual Leave': 0, 'Sick Leave': 0, 'Earned Leave': 0 },
    remaining: { 'Casual Leave': 12, 'Sick Leave': 10, 'Earned Leave': 15 }
  };
  const { allocated, used, remaining } = leaveBalances || defaultBalances;

  return (
    <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Leave & Absence Management</h3>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowApplyLeave(!showApplyLeave)}>
          <Calendar size={16} /> Apply Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Object.keys(allocated).map(type => (
          <div key={type} className="glass-card" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{type}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--primary)' }}>{remaining[type]}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Days Remaining</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <div>Allocated: <strong style={{ color: 'white' }}>{allocated[type]}</strong></div>
                <div>Used: <strong style={{ color: 'var(--warning)' }}>{used[type]}</strong></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showApplyLeave && (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleApplyLeave(leaveForm);
          setShowApplyLeave(false);
        }} className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--border-glass-active)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select className="form-input" onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})}>
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Earned Leave</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '2' }}>
              <label className="form-label">Reason</label>
              <input type="text" className="form-input" required onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" required onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" required onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowApplyLeave(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Submit Application</button>
          </div>
        </form>
      )}

      {/* Pending Reviews Section for Reviewers */}
      {['SUPER_ADMIN', 'HR', 'MANAGER'].includes(userRole) && pendingLeaves && pendingLeaves.length > 0 && (
        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px' }}>Pending Team Leave Approvals</h4>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map(plv => (
                  <tr key={plv._id}>
                    <td><strong>{plv.employeeName}</strong> <code style={{fontSize:'10px'}}>({plv.employeeId})</code></td>
                    <td>{plv.leaveType}</td>
                    <td>{plv.startDate} to {plv.endDate}</td>
                    <td>{plv.reason}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="badge badge-success" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px' }} onClick={() => handleLeaveReview(plv._id, 'Approved')}>Approve</button>
                        <button className="badge badge-danger" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px' }} onClick={() => handleLeaveReview(plv._id, 'Rejected')}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h4 style={{ marginBottom: '12px' }}>My Leave History</h4>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(lv => (
                <tr key={lv._id}>
                  <td>{lv.leaveType}</td>
                  <td>{lv.startDate} to {lv.endDate}</td>
                  <td>{lv.reason}</td>
                  <td>
                    <span className={`badge badge-${lv.status === 'Approved' ? 'success' : (lv.status === 'Pending' ? 'warning' : 'danger')}`}>
                      {lv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
