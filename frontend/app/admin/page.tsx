'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Briefcase, FileText, Settings, 
  BarChart3, PieChart, Activity, Search,
  Bell, ChevronRight, LogOut, ShieldCheck, Loader2,
  Calendar, MapPin, Globe, Zap, Clock, X, Sparkles
} from 'lucide-react';

import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Job, Application } from '../types';

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobApplications, setJobApplications] = useState<{[key: number]: Application[]}>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs'>('overview');
  const [expandingId, setExpandingId] = useState<number | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const jobsData = await api.get('/jobs?mine=true');
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId: number) => {
    if (jobApplications[jobId]) return;
    
    setExpandingId(jobId);
    try {
      const appsData = await api.get(`/admin/applications/job/${jobId}`);
      setJobApplications(prev => ({ ...prev, [jobId]: appsData }));
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setExpandingId(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchData();
  }, [user, authLoading, router]);

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa công việc này?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (jobId: number, id: string, status: string) => {
    try {
      await api.put(`/admin/applications/${id}/status`, { status });
      setJobApplications(prev => ({
        ...prev,
        [jobId]: prev[jobId].map(a => a.id === id ? { ...a, status } : a)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '', company: 'TN Recruitment', location: 'Remote', 
    type: 'Full-time', salary: '', level: 'Middle', description: '', is_hot: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const levelOptions = ['Junior', 'Middle', 'Senior', 'Lead', 'Architect'];
  const typeOptions = ['Full-time', 'Part-time', 'Contract', 'Remote'];

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const addedJob = await api.post('/jobs', newJob);
      setJobs([addedJob, ...jobs]);
      setIsAddModalOpen(false);
      setNewJob({
        title: '', company: 'TN Recruitment', location: 'Remote', 
        type: 'Full-time', salary: '', level: 'Middle', description: '', is_hot: false
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-apple-blue animate-spin" />
        <p className="text-white/40 font-bold text-xs uppercase tracking-widest animate-pulse">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Add Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
           <div className="glass-card w-full max-w-2xl p-10 relative z-10 animate-in space-y-8 border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black tracking-tighter">Đăng tin tuyển dụng.</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-white/20 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleAddJob} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Tiêu đề công việc</label>
                       <input 
                         required
                         type="text" 
                         placeholder="e.g. Senior Frontend Engineer"
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 focus:ring-apple-blue outline-none"
                         value={newJob.title}
                         onChange={e => setNewJob({...newJob, title: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Công ty</label>
                       <input 
                         required
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 focus:ring-apple-blue outline-none"
                         value={newJob.company}
                         onChange={e => setNewJob({...newJob, company: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Địa điểm</label>
                       <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 focus:ring-apple-blue outline-none"
                         value={newJob.location}
                         onChange={e => setNewJob({...newJob, location: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Mức lương</label>
                       <input 
                         type="text" 
                         placeholder="e.g. $2,000 - $3,500"
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 focus:ring-apple-blue outline-none"
                         value={newJob.salary}
                         onChange={e => setNewJob({...newJob, salary: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cấp bậc (Level)</label>
                        <button 
                          type="button"
                          onClick={() => { setIsLevelOpen(!isLevelOpen); setIsTypeOpen(false); }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex justify-between items-center group hover:bg-white/10 transition-all"
                        >
                          <span className="text-sm font-bold text-white/80">{newJob.level}</span>
                          <ChevronRight size={14} className={`text-white/20 transition-transform ${isLevelOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {isLevelOpen && (
                          <div className="absolute top-full mt-2 left-0 w-full bg-[#121212] border border-white/10 rounded-xl z-[60] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                            {levelOptions.map(l => (
                              <button 
                                key={l} type="button"
                                onClick={() => { setNewJob({...newJob, level: l}); setIsLevelOpen(false); }}
                                className="w-full text-left px-5 py-3 text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        )}
                     </div>

                     <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Hình thức (Type)</label>
                        <button 
                          type="button"
                          onClick={() => { setIsTypeOpen(!isTypeOpen); setIsLevelOpen(false); }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex justify-between items-center group hover:bg-white/10 transition-all"
                        >
                          <span className="text-sm font-bold text-white/80">{newJob.type}</span>
                          <ChevronRight size={14} className={`text-white/20 transition-transform ${isTypeOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {isTypeOpen && (
                          <div className="absolute top-full mt-2 left-0 w-full bg-[#121212] border border-white/10 rounded-xl z-[60] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                            {typeOptions.map(t => (
                              <button 
                                key={t} type="button"
                                onClick={() => { setNewJob({...newJob, type: t}); setIsTypeOpen(false); }}
                                className="w-full text-left px-5 py-3 text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
                              >
                                {t === 'Full-time' ? 'Toàn thời gian' : t === 'Part-time' ? 'Bán thời gian' : t === 'Contract' ? 'Hợp đồng' : 'Từ xa'}
                              </button>
                            ))}
                          </div>
                        )}
                     </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Mô tả chi tiết</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-1 focus:ring-apple-blue outline-none resize-none"
                      value={newJob.description}
                      onChange={e => setNewJob({...newJob, description: e.target.value})}
                    ></textarea>
                 </div>

                 <div className="flex items-center gap-4 pt-4">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-grow bg-white text-black py-4 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                       {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐĂNG TIN'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 flex flex-col p-8 space-y-12 shrink-0">
        <div className="flex items-baseline relative scale-110 origin-left">
          <span className="text-4xl font-black text-white tracking-tighter">T</span>
          <span className="text-4xl font-black text-apple-blue tracking-tighter -ml-2.5">N</span>
          <span className="ml-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border border-white/10 px-2 py-0.5 rounded-md">Admin</span>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
            { id: 'jobs', label: 'Quản lý Công việc', icon: Briefcase },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-apple-blue text-white shadow-[0_0_20px_rgba(0,113,227,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-4 text-white/40 hover:text-red-500 transition-colors font-bold text-sm px-6"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">Bảng điều khiển quản trị.</h1>
            <p className="text-white/40 font-medium">Chào mừng trở lại, {user.fullName}</p>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="animate-in space-y-12">
            <div className="grid grid-cols-4 gap-8">
              {[
                { label: 'Tổng số việc làm', value: jobs.length, change: '+12%', icon: Briefcase },
                { label: 'Hồ sơ ứng tuyển', value: Object.values(jobApplications).flat().length, change: '+18%', icon: FileText },
                { label: 'Duyệt phỏng vấn', value: Object.values(jobApplications).flat().filter(a => a.status === 'Interviewing').length, change: '+5%', icon: ShieldCheck },
                { label: 'Lượt truy cập', value: '45K', change: '+24%', icon: Activity },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-apple-blue/10 flex items-center justify-center">
                      <stat.icon className="text-apple-bright-blue" size={24} />
                    </div>
                    <span className="text-apple-bright-blue font-black text-xs">{stat.change}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-black tracking-tighter">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
               <div className="col-span-12 glass-card p-10 min-h-[400px]">
                  <h3 className="text-xl font-black tracking-tight mb-8">Tăng trưởng ứng tuyển</h3>
                  <div className="flex items-end gap-2 h-64 opacity-20">
                    {[40, 70, 45, 90, 65, 30, 80, 55, 95, 40, 60, 85, 50, 75, 45, 90, 60, 35, 80, 55, 40, 70, 45, 90, 65].map((h, i) => (
                      <div key={i} className="flex-grow bg-white rounded-t-lg" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="animate-in space-y-8">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black tracking-tighter text-white">Quản lý Công việc</h2>
               <button 
                 onClick={() => setIsAddModalOpen(true)}
                 className="bg-white text-black px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all"
               >
                 + Thêm công việc
               </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
               {jobs.map((job) => {
                 const jobApps = jobApplications[job.id] || [];
                 const isExpanded = expandedJobId === job.id;
                 const isExpanding = expandingId === job.id;

                 return (
                   <div key={job.id} className="glass-card overflow-hidden transition-all duration-500 border-white/5 hover:border-white/10">
                      <div className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-apple-blue text-xl">TN</div>
                           <div>
                              <h4 className="text-xl font-black text-white">{job.title}</h4>
                              <p className="text-sm text-white/40 font-medium">{job.company} • {job.location}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <button 
                             onClick={async () => {
                               if (isExpanded) {
                                 setExpandedJobId(null);
                               } else {
                                 await fetchJobApplications(job.id);
                                 setExpandedJobId(job.id);
                               }
                             }}
                             disabled={isExpanding}
                             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-white text-black' : 'bg-apple-blue/20 text-apple-bright-blue hover:bg-apple-blue hover:text-white'}`}
                           >
                             {isExpanding ? 'ĐANG TẢI...' : (isExpanded ? 'ẨN ỨNG VIÊN' : 'XEM ỨNG VIÊN')}
                             <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                           </button>

                           <button 
                             onClick={() => handleDeleteJob(job.id)}
                             className="p-2 text-white/20 hover:text-red-500 transition-colors"
                           >
                             <LogOut size={18} className="rotate-180" />
                           </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-white/5 bg-white/[0.01] animate-in slide-in-from-top-2 duration-300">
                           <div className="p-8 space-y-6">
                              <div className="flex items-center justify-between">
                                 <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Danh sách hồ sơ ứng tuyển</h5>
                                 <div className="text-[10px] font-bold text-apple-bright-blue bg-apple-blue/10 px-3 py-1 rounded-full">{jobApps.length} ứng viên</div>
                              </div>
                              
                              {jobApps.length === 0 ? (
                                <div className="py-12 text-center space-y-3">
                                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                                    <Users size={20} />
                                  </div>
                                  <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Chưa có ứng viên nào nộp hồ sơ</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-3">
                                  {jobApps.map((app) => (
                                    <div key={app.id} className="flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group gap-4">
                                       <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-bright-blue font-black text-xs relative">
                                               {app.full_name.charAt(0)}
                                            </div>
                                            <div>
                                               <div className="font-bold text-white text-sm flex items-center gap-2">
                                                 {app.full_name}
                                               </div>
                                               <div className="text-[10px] text-white/30 font-medium">{app.email} • {new Date(app.submitted_at).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                         </div>

                                         <div className="flex items-center gap-6">
                                            {/* Status Selector */}
                                            <div className="relative group/status">
                                               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                                    app.status === 'Accepted' ? 'bg-green-500' : 
                                                    app.status === 'Rejected' ? 'bg-red-500' :
                                                    app.status === 'Interviewing' ? 'bg-apple-blue' : 'bg-white/40'
                                                  }`}></div>
                                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{app.status}</span>
                                               </div>
                                               
                                               <div className="absolute right-0 bottom-full mb-2 w-40 bg-[#121212] border border-white/10 rounded-2xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                                                  {['Pending', 'Interviewing', 'Accepted', 'Rejected'].map((s) => (
                                                    <button 
                                                      key={s}
                                                      onClick={() => handleUpdateStatus(job.id, app.id, s)}
                                                      className="w-full text-[10px] font-black uppercase tracking-widest px-5 py-4 hover:bg-apple-blue/20 text-white/50 hover:text-white text-left transition-all border-b border-white/5 last:border-0 flex items-center gap-3"
                                                    >
                                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                                        s === 'Accepted' ? 'bg-green-500' : 
                                                        s === 'Rejected' ? 'bg-red-500' :
                                                        s === 'Interviewing' ? 'bg-apple-blue' : 'bg-white/40'
                                                      }`}></div>
                                                      {s}
                                                    </button>
                                                  ))}
                                               </div>
                                            </div>

                                            {/* CV Link */}
                                            <div className="flex items-center w-24 justify-end">
                                              {app.cv_url ? (
                                                <a 
                                                  href={app.cv_url} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-apple-blue text-white hover:bg-apple-bright-blue transition-all text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                                                >
                                                  <FileText size={14} />
                                                  XEM CV
                                                </a>
                                              ) : (
                                                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic text-right">
                                                  Lỗi file
                                                </span>
                                              )}
                                            </div>
                                         </div>
                                       </div>

                                       {/* AI Analysis Panel */}
                                       {app.ai_analysis ? (
                                         <div className="mt-2 p-5 rounded-xl bg-purple-500/[0.05] border border-purple-500/20 space-y-4 animate-in fade-in slide-in-from-top-1 duration-500">
                                            <div className="flex items-center justify-between">
                                               <div className="flex items-center gap-2 text-purple-400">
                                                  <Sparkles size={16} />
                                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                                    AI-Powered Analysis
                                                  </span>
                                               </div>
                                               <div className="flex items-center gap-2">
                                                  <div className="text-[9px] font-bold text-white/40 uppercase">Match Score:</div>
                                                  <div className="text-sm font-black text-purple-400">
                                                    {app.ai_analysis.match_score}%
                                                  </div>
                                               </div>
                                            </div>

                                            <div className="space-y-4">
                                               <div className="text-[11px] text-white/80 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5 italic">
                                                  &quot;{app.ai_analysis.summary}&quot;
                                               </div>
                                               
                                               <div className="space-y-2">
                                                  <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Kỹ năng bóc tách (AI Extracted)</div>
                                                  <div className="flex flex-wrap gap-2">
                                                     {app.ai_analysis.skills?.map((skill: string) => (
                                                       <span key={skill} className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-300 uppercase tracking-tight">
                                                          {skill}
                                                       </span>
                                                     ))}
                                                  </div>
                                               </div>
                                            </div>
                                         </div>
                                       ) : (
                                         <div className="mt-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                                            <Loader2 size={14} className="text-white/20 animate-spin" />
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Đang phân tích CV bởi Amazon AI...</span>
                                         </div>
                                       )}
                                    </div>
                                  ))}
                                </div>
                              )}
                           </div>
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
