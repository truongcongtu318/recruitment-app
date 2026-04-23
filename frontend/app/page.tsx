'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles, Zap, Calendar, MapPin, Globe, Headphones, Play, ArrowUpRight } from "lucide-react";
import { api } from "./lib/api";
import { Job } from "./types";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await api.get('/jobs');
        setJobs(data);
      } catch (err: any) {
        setError(err.message || 'Không thể kết nối danh sách công việc.');
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="apple-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-12 animate-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-apple-blue/10 border border-apple-blue/20 text-apple-bright-blue text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles size={14} /> Hệ sinh thái tuyển dụng tương lai
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-[-0.04em] leading-[1.05] text-white">
              Kiến tạo <br />
              Tương lai <br />
              Công nghệ tại 
              <span className="inline-flex items-baseline relative ml-4">
                <span className="text-white">T</span>
                <span className="text-apple-blue -ml-[0.28em]">N</span>
              </span>
            </h1>

            <p className="text-white/40 text-xl max-w-lg leading-relaxed font-medium">
              Khám phá những cơ hội đột phá trong lĩnh vực AI và Cloud. 
              Xây dựng tương lai của bạn cùng những chuyên gia hàng đầu 
              trên toàn thế giới.
            </p>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-white/30"><Calendar size={20} /></div>
              <div className="flex items-center gap-2 text-white/30"><MapPin size={20} /></div>
              <div className="flex items-center gap-2 text-white/30"><Globe size={20} /></div>
              <div className="flex items-center gap-2 text-white/30"><Zap size={20} /></div>
            </div>

          </div>

          {/* Right Image */}
          <div className="lg:col-span-5 relative animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/tech-pro.png"
                alt="Chuyên gia công nghệ"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partners Slider - Text Typography Style */}
      <section className="py-24 bg-black overflow-hidden relative">
        {/* Side Masks for Fade Effect */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black to-transparent z-10"></div>

        <div className="logo-carousel !bg-black !py-0">
          <div className="logo-track bg-black">
            {[
              'AMAZON AWS', 'GOOGLE', 'MICROSOFT', 'META', 'APPLE', 'OPENAI', 'NVIDIA'
            ].map((name) => (
              <div key={name} className="partner-logo px-32 group bg-black">
                <span className="text-5xl md:text-7xl font-black text-white/20 group-hover:text-white transition-all duration-700 cursor-default whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
            {/* Duplicate for infinite loop */}
            {[
              'AMAZON AWS', 'GOOGLE', 'MICROSOFT', 'META', 'APPLE', 'OPENAI', 'NVIDIA'
            ].map((name) => (
              <div key={`${name}-dup`} className="partner-logo px-32 group bg-black">
                <span className="text-5xl md:text-7xl font-black text-white/20 group-hover:text-white transition-all duration-700 cursor-default whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-32 bg-black">
        <div className="apple-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
            <h2 className="section-heading">
              Đa dạng các <br />
              Vị trí Phổ biến <br />
              Trên Thế giới
            </h2>
            <div className="space-y-6">
              <p className="text-white/40 text-lg leading-relaxed">
                Tìm kiếm và ứng tuyển vào các vị trí độc quyền từ các công ty
                phổ biến trên toàn thế giới chỉ có tại hệ thống TN.
              </p>
              <div className="flex gap-12">
                <div>
                  <div className="text-4xl font-black mb-1">130K</div>
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Ứng viên đã đăng ký</div>
                </div>
                <div>
                  <div className="text-4xl font-black mb-1">70K+</div>
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Vị trí đã được lấp đầy</div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-video bg-white/5 rounded-[32px] animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-card p-12 text-center border-red-500/20 bg-red-500/5">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <ArrowUpRight className="rotate-45" />
                </div>
                <div className="text-white/60 font-medium">{error}</div>
                <button onClick={() => window.location.reload()} className="text-apple-blue font-bold hover:underline">Thử lại</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {jobs.slice(0, 4).map((job, idx) => {
                const getJobImage = (title: string) => {
                  if (title.toLowerCase().includes('cloud')) return '/jobs/cloud.png';
                  if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('ml')) return '/jobs/ai.png';
                  if (title.toLowerCase().includes('frontend') || title.toLowerCase().includes('next')) return '/jobs/frontend.png';
                  return '/jobs/cloud.png';
                };

                return (
                  <Link
                    key={job.id}
                    href={`/job-details?id=${job.id}`}
                    className="bento-item group relative aspect-video"
                  >
                    {/* Background Image with Zoom Effect */}
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={getJobImage(job.title)}
                        alt={job.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>

                    <div className="absolute inset-0 p-10 flex flex-col justify-end z-20">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black text-apple-bright-blue uppercase tracking-[0.2em] mb-2">{job.type}</div>
                          <h3 className="text-3xl font-black tracking-tighter group-hover:translate-x-2 transition-transform duration-500 text-white">{job.title}</h3>
                          <p className="text-white/60 font-bold text-sm">{job.company} • {job.salary}</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl">
                          <ArrowUpRight size={28} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-32 bg-black border-t border-white/5 text-center">
        <div className="apple-container max-w-3xl">
          <h2 className="section-heading mb-8">Sẵn sàng để bắt đầu <br /> hành trình tiếp theo?</h2>
          <Link href="/register" className="btn-primary px-12 py-5 text-xl text-black">Bắt đầu ngay</Link>
        </div>
      </section>
    </div>
  );
}
