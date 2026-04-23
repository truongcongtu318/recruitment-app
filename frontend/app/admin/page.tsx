'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Briefcase, FileText, Settings, 
  BarChart3, PieChart, Activity, Search,
  Bell, ChevronRight, LogOut, ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'apps'>('overview');
  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = rawApiUrl.startsWith('http') ? rawApiUrl : `/${rawApiUrl.replace(/^\//, '')}`;
    
    try {
      // Fetch Jobs
      const jobsRes = await fetch(`${apiUrl.replace(/\/$/, '')}/jobs`);
      const jobsData = await jobsRes.json();
      setJobs(jobsData);

      // Fetch Applications
      const appsRes = await fetch(`${apiUrl.replace(/\/$/, '')}/admin/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      setApplications(appsData);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin' && userData.role !== 'employer') {
      router.push('/');
      return;
    }
    setUser(userData);
    fetchData();
  }, [router]);

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa công việc này?')) return;
    const token = localStorage.getItem('token');
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = rawApiUrl.startsWith('http') ? rawApiUrl : `/${rawApiUrl.replace(/^\//, '')}`;
    
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = rawApiUrl.startsWith('http') ? rawApiUrl : `/${rawApiUrl.replace(/^\//, '')}`;
    
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setApplications(applications.map(a => a.id === id ? { ...a, status } : a));
      }
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

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = rawApiUrl.startsWith('http') ? rawApiUrl : `/${rawApiUrl.replace(/^\//, '')}`;

    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/jobs`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        const addedJob = await res.json();
        setJobs([addedJob, ...jobs]);
        setIsAddModalOpen(false);
        setNewJob({
          title: '', company: 'TN Recruitment', location: 'Remote', 
          type: 'Full-time', salary: '', level: 'Middle', description: '', is_hot: false
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

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
                 <button onClick={() => setIsAddModalOpen(false)} className="text-white/20 hover:text-white transition-colors">Đóng</button>
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
            { id: 'apps', label: 'Hồ sơ Ứng tuyển', icon: FileText },
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
            onClick={() => {
              localStorage.clear();
              router.push('/login');
            }}
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
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
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
                { label: 'Hồ sơ ứng tuyển', value: applications.length, change: '+18%', icon: FileText },
                { label: 'Duyệt phỏng vấn', value: applications.filter(a => a.status === 'Interviewing').length, change: '+5%', icon: ShieldCheck },
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
            <div className="grid grid-cols-1 gap-4">
               {jobs.map((job) => (
                 <div key={job.id} className="glass-card p-8 flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-apple-blue">TN</div>
                       <div>
                          <h4 className="text-xl font-black text-white">{job.title}</h4>
                          <p className="text-sm text-white/40 font-medium">{job.company} • {job.location}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-3 rounded-xl bg-white/5 text-white hover:bg-white hover:text-black transition-all"><Settings size={18} /></button>
                       <button 
                         onClick={() => handleDeleteJob(job.id)}
                         className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                       >
                         <LogOut size={18} className="rotate-90" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="animate-in space-y-8">
            <h2 className="text-3xl font-black tracking-tighter text-white">Hồ sơ Ứng tuyển</h2>
            <div className="glass-card overflow-visible">
               <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                     <tr>
                        <th className="px-8 py-6">Ứng viên</th>
                        <th className="px-8 py-6">Vị trí</th>
                        <th className="px-8 py-6">Thời gian</th>
                        <th className="px-8 py-6 text-right">Trạng thái & Thao tác</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {applications.map((app) => (
                       <tr key={app.id} className="hover:bg-white/5 transition-colors relative hover:z-10">
                          <td className="px-8 py-6">
                             <div className="font-bold text-white">{app.full_name}</div>
                             <div className="text-xs text-white/30">{app.email}</div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="font-bold text-white">{app.job_title}</div>
                             <div className="text-[10px] text-white/30 font-black uppercase tracking-wider">{app.job_company}</div>
                          </td>
                          <td className="px-8 py-6 text-xs text-white/40 font-medium">
                             {new Date(app.submitted_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-8 py-6 text-right relative group/select">
                             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                <div className={`w-2 h-2 rounded-full ${
                                  app.status === 'Accepted' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                                  app.status === 'Rejected' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                                  app.status === 'Interviewing' ? 'bg-apple-blue shadow-[0_0_8px_rgba(0,113,227,0.6)]' : 'bg-white/40'
                                }`}></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                  {app.status === 'Pending' ? 'CHỜ DUYỆT' : 
                                   app.status === 'Interviewing' ? 'PHỎNG VẤN' : 
                                   app.status === 'Accepted' ? 'TRÚNG TUYỂN' : 'TỪ CHỐI'}
                                </span>
                             </div>
                             
                             <div className="absolute right-0 top-[110%] w-48 bg-black/95 backdrop-blur-xl p-2 border border-white/20 rounded-2xl opacity-0 invisible group-hover/select:opacity-100 group-hover/select:visible transition-all z-30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                {[
                                  { id: 'Pending', label: 'Chờ duyệt', color: 'text-white/40' },
                                  { id: 'Interviewing', label: 'Phỏng vấn', color: 'text-apple-blue' },
                                  { id: 'Accepted', label: 'Trúng tuyển', color: 'text-green-500' },
                                  { id: 'Rejected', label: 'Từ chối', color: 'text-red-500' },
                                ].map((opt) => (
                                  <button 
                                    key={opt.id}
                                    onClick={() => handleUpdateStatus(app.id, opt.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                      opt.id === 'Accepted' ? 'bg-green-500' : 
                                      opt.id === 'Rejected' ? 'bg-red-500' :
                                      opt.id === 'Interviewing' ? 'bg-apple-blue' : 'bg-white/20'
                                    }`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${opt.color}`}>{opt.label}</span>
                                  </button>
                                ))}
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
