import React from 'react';
import { Globe, AlertTriangle, CheckCircle2, Shield, Zap, Lock } from 'lucide-react';
import { HeroSectionLight } from './HeroSectionLight';
import { TextReveal } from "@/components/ui/cascade-text";
import { HyperText } from "@/components/ui/hyper-text";

export default function Auth({
  handleLogin,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  authError,
  authSuccess
}) {
  const heroContent = (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 text-slate-900 text-4xl font-bold tracking-tight">
        <Globe size={42} className="text-amber-500" />
        <span>WORKFORCE<span className="text-amber-500">.EX</span></span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mt-4">
        The Enterprise <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">Operations Exchange</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-lg leading-relaxed mt-2">
        Trade slow processes for high-performance AI-driven management. Real-time metrics, bank-grade security, and instant execution.
      </p>

      {/* Market Pairs / Metrics Ticker (Light Mode) */}
      <div className="flex flex-wrap gap-4 mt-8">
        {[
          { pair: 'EMP/PROJ', price: '1.45', change: '+2.4%', up: true },
          { pair: 'HR/USD', price: '0.89', change: '-1.2%', up: false },
          { pair: 'LEAVE/BAL', price: '12.0', change: '+0.5%', up: true },
          { pair: 'PAY/CYCLE', price: '30D', change: '0.0%', up: true }
        ].map((item, idx) => (
          <div key={idx} className="bg-white/60 backdrop-blur-md border border-orange-200/50 rounded-xl p-4 flex flex-col gap-1 min-w-[140px] shadow-sm shadow-amber-900/5 hover:border-amber-400 transition-colors cursor-default">
            <TextReveal className="text-xs text-slate-500 font-bold tracking-wider" text={item.pair} />
            <div className="flex items-end justify-between mt-1">
              <span className="text-xl font-bold text-slate-900">{item.price}</span>
              <span className={`text-xs font-bold ${item.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const formContent = (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-orange-100 rounded-3xl p-8 shadow-xl shadow-amber-900/10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          <TextReveal text="Terminal Access" />
        </h2>
        <p className="text-sm text-slate-500">Securely authenticate to your dashboard.</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Corporate Email</label>
          <input 
            type="email" 
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm" 
            value={loginEmail} 
            onChange={(e) => setLoginEmail(e.target.value)} 
            required 
            placeholder="admin@company.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
          <input 
            type="password" 
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm" 
            value={loginPassword} 
            onChange={(e) => setLoginPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
        </div>

        {authError && (
          <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertTriangle size={14} />
            <span>{authError}</span>
          </div>
        )}
        
        {authSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <CheckCircle2 size={14} />
            <span>{authSuccess}</span>
          </div>
        )}

        <button type="submit" className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold py-4 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center tracking-wide overflow-hidden">
          <HyperText text="Initialize Session" className="text-white" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Demo Credentials</p>
        <div className="flex flex-col gap-2 text-xs font-mono text-slate-500 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <div><span className="text-amber-600 font-bold">Admin:</span> admin@company.com / Admin@123</div>
          <div><span className="text-amber-600 font-bold">HR:</span> hr@company.com / HrManager@123</div>
          <div><span className="text-amber-600 font-bold">Mgr:</span> manager@company.com / Manager@123</div>
          <div><span className="text-amber-600 font-bold">Emp:</span> employee@company.com / Employee@123</div>
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 px-4">
      <div className="flex items-center gap-3 cursor-pointer">
        <Shield size={24} className="text-amber-500" />
        <TextReveal className="text-lg text-slate-600 font-bold" text="Bank-Grade Security" />
      </div>
      <div className="flex items-center gap-3 cursor-pointer">
        <Zap size={24} className="text-orange-500" />
        <TextReveal className="text-lg text-slate-600 font-bold" text="Millisecond Execution" />
      </div>
      <div className="flex items-center gap-3 cursor-pointer">
        <Lock size={24} className="text-amber-500" />
        <TextReveal className="text-lg text-slate-600 font-bold" text="Encrypted Assets" />
      </div>
    </div>
  );

  return (
    <HeroSectionLight 
      heroContent={heroContent}
      formContent={formContent}
      footerContent={footerContent}
    />
  );
}
