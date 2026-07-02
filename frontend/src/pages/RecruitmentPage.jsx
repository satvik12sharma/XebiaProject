import React from 'react';
import { Plus } from 'lucide-react';

const STAGES = ['Applied', 'Screening', 'Technical Interview', 'HR Interview', 'Offer Letter', 'Joined'];

export default function RecruitmentPage({
  candidates, showAddCand, setShowAddCand, 
  newCandData, setNewCandData, handleCreateCand, handleResumeAnalysis,
  handleUpdateCandidate
}) {
  return (
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
              <label className="form-label">Applicant Name</label>
              <input type="text" className="form-input" required onChange={e => setNewCandData({...newCandData, candidateName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" required onChange={e => setNewCandData({...newCandData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input type="number" className="form-input" required onChange={e => setNewCandData({...newCandData, experience: parseFloat(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Skills (comma separated)</label>
              <input type="text" className="form-input" required placeholder="e.g. React, Node.js, MongoDB" onChange={e => setNewCandData({...newCandData, skills: e.target.value.split(',').map(s=>s.trim())})} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Paste Resume Raw Text (For AI Analysis)</label>
              <textarea className="form-input" rows="4" onChange={e => setNewCandData({...newCandData, resumeText: e.target.value})} placeholder="Paste resume text here for automated shortlisting..."></textarea>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowAddCand(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Submit Application</button>
          </div>
        </form>
      )}

      {/* Kanban Stages Grid */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
        {STAGES.map(stage => {
          const stageCandidates = candidates.filter(c => c.status === stage);
          return (
            <div key={stage} className="glass-card" style={{ flex: '0 0 280px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '12px', minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>{stage}</h4>
                <span className="badge badge-primary">{stageCandidates.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                {stageCandidates.map(cand => (
                  <div key={cand._id} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderLeft: '3px solid var(--primary)', fontSize: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'white' }}>{cand.candidateName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{cand.email} • {cand.experience} YOE</div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                      {cand.skills.map((s, i) => (
                        <span key={i} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '8px', color: 'var(--text-secondary)' }}>{s}</span>
                      ))}
                    </div>

                    {cand.aiAnalysis && cand.aiAnalysis.score ? (
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', fontSize: '11px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong>AI Match:</strong>
                          <span style={{ color: 'var(--success)' }}>{cand.aiAnalysis.score}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.3' }}>{cand.aiAnalysis.summary}</p>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        style={{ width: '100%', fontSize: '10px', padding: '6px', marginBottom: '10px', borderRadius: '4px' }}
                        onClick={() => handleResumeAnalysis(cand._id)}
                      >
                        Run AI Analysis
                      </button>
                    )}

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: 'auto' }}>
                      <select 
                        value={cand.status} 
                        onChange={(e) => handleUpdateCandidate(cand._id, { status: e.target.value })}
                        style={{ 
                          flex: 1,
                          background: 'var(--bg-sidebar)', 
                          border: '1px solid var(--border-glass)', 
                          color: 'white', 
                          borderRadius: '4px',
                          padding: '4px 6px',
                          fontSize: '11px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {STAGES.map(stg => (
                          <option key={stg} value={stg} style={{background: 'var(--bg-sidebar)'}}>{stg}</option>
                        ))}
                      </select>
                      
                      {stage !== 'Joined' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '11px', width: 'auto', borderRadius: '4px' }}
                          onClick={() => {
                            const nextStageIndex = STAGES.indexOf(stage) + 1;
                            if (nextStageIndex < STAGES.length) {
                              handleUpdateCandidate(cand._id, { status: STAGES[nextStageIndex] });
                            }
                          }}
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {stageCandidates.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '11px', padding: '30px 0', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
