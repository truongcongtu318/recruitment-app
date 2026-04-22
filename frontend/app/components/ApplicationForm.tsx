'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, FileUp, ShieldCheck } from 'lucide-react';

interface ApplicationFormProps {
  jobId: number;
}

export default function ApplicationForm({ jobId }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experienceSummary: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload your CV first.");
      return;
    }

    setStatus('loading');
    const data = new FormData();
    data.append('jobId', jobId.toString());
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('experienceSummary', formData.experienceSummary);
    data.append('cv', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/apply`, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Submission failed');
      
      setStatus('success');
      setMessage('Your dossier has been transmitted to our secure registry. Prepare for contact.');
    } catch (error) {
      console.error("Submit error:", error);
      setStatus('error');
      setMessage('Encryption handshake failed. Please retry transmission.');
    }
  };

  if (status === 'success') {
    return (
      <div className="glass p-12 text-center space-y-6 rounded-[2rem] border-green-500/20">
        <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-4xl font-black text-white">Transmission Complete</h2>
        <p className="text-slate-500 font-medium">{message}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-600/10"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-10 lg:p-14 space-y-10 rounded-[2.5rem]">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck className="w-4 h-4" />
            Secure Entry Point
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-white">Apply Now</h2>
        <p className="text-slate-500 font-medium">Transmit your credentials to the G12 Cloud Network.</p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Legal Identity</label>
            <input 
                required 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-700"
                onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
            </div>
            <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Digital Mail</label>
            <input 
                required 
                type="email" 
                placeholder="email@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-700"
                onChange={e => setFormData({...formData, email: e.target.value})}
            />
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Comm Channel</label>
            <input 
                type="tel" 
                placeholder="+XX XXX XXX XXX"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-700"
                onChange={e => setFormData({...formData, phone: e.target.value})}
            />
            </div>

            <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Digital CV (PDF)</label>
            <div className="relative group">
                <input 
                required
                type="file" 
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl px-6 py-4 flex items-center gap-3 group-hover:border-blue-500/50 transition-all">
                <FileUp className="w-5 h-5 text-blue-500 opacity-60" />
                <span className="text-slate-500 text-sm font-bold truncate">
                    {file ? file.name : "Select File..."}
                </span>
                </div>
            </div>
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mission Experience</label>
            <textarea 
            rows={4} 
            placeholder="Briefly state your core technical impact..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold resize-none placeholder:text-slate-700"
            onChange={e => setFormData({...formData, experienceSummary: e.target.value})}
            ></textarea>
        </div>
      </div>

      {status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest">
           <AlertCircle className="w-5 h-5" />
           {message}
        </div>
      )}

      <button 
        disabled={status === 'loading'}
        type="submit" 
        className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98]"
      >
        {status === 'loading' ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            Initiate Submission
            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}
