'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Briefcase, DollarSign, Clock, ArrowUpRight, Loader2, Filter } from 'lucide-react';
import { Job } from '../types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchJobs() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/jobs`);
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || job.level === filter;
    return matchesSearch && matchesFilter;
  });

  const getJobImage = (title: string) => {
    if (title.toLowerCase().includes('cloud')) return '/jobs/cloud.png';
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('ml')) return '/jobs/ai.png';
    if (title.toLowerCase().includes('frontend') || title.toLowerCase().includes('next')) return '/jobs/frontend.png';
    return '/jobs/cloud.png';
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header */}
      <section className="py-20 border-b border-white/5">
        <div className="apple-container animate-in">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-6xl font-black tracking-tighter text-white">Khám phá Cơ hội.</h1>
            <p className="text-white/40 text-xl font-medium">Tìm kiếm vị trí phù hợp với năng lực và đam mê của bạn trong hệ sinh thái TN.</p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-12 sticky top-20 bg-black/80 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="apple-container">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
              <input 
                type="text"
                placeholder="Tìm kiếm vị trí, công ty..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all text-white font-medium"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 w-full md:w-auto">
                <Filter className="text-apple-bright-blue w-5 h-5" />
                <select 
                  className="bg-transparent text-white font-bold outline-none cursor-pointer"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">Tất cả cấp bậc</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Architect">Architect</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-20">
        <div className="apple-container">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-apple-blue mb-4" />
              <div className="text-white/30 font-black uppercase tracking-widest text-[10px]">Đang tải danh sách...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map((job) => (
                <Link 
                  key={job.id} 
                  href={`/job-details?id=${job.id}`}
                  className="glass-card overflow-hidden group hover:border-white/20 transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image Thumbnail */}
                    <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                      <Image 
                        src={getJobImage(job.title)} 
                        alt={job.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent md:hidden"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow p-8 md:p-10 flex flex-col justify-between gap-8">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-bright-blue py-1 px-3 bg-apple-bright-blue/10 rounded-full">{job.type}</span>
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 py-1 px-3 bg-white/5 rounded-full">{job.level}</span>
                          </div>
                          <h2 className="text-4xl font-black tracking-tighter text-white group-hover:text-apple-blue transition-colors">{job.title}</h2>
                          <div className="flex items-center gap-6 text-white/50 font-bold">
                            <span className="flex items-center gap-2"><Briefcase size={18} className="text-white/20" /> {job.company}</span>
                            <span className="flex items-center gap-2"><MapPin size={18} className="text-white/20" /> {job.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2">
                           <div className="text-2xl font-black text-white">{job.salary}</div>
                           <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                             <Clock size={12} /> Hạn cuối: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-white/5">
                        <div className="flex -space-x-3">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-[10px] font-black">AI</div>
                           ))}
                           <div className="w-10 h-10 rounded-full border-2 border-black bg-apple-blue flex items-center justify-center text-[10px] font-black">+12</div>
                        </div>
                        <div className="flex items-center gap-2 text-white font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-apple-bright-blue transition-colors">
                          Xem chi tiết <ArrowUpRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {filteredJobs.length === 0 && (
                <div className="text-center py-40 glass-card">
                   <div className="text-white/20 font-black text-6xl mb-6">:(</div>
                   <h3 className="text-2xl font-black text-white">Không tìm thấy vị trí phù hợp.</h3>
                   <p className="text-white/40 font-medium">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
