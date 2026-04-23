'use client';

import { Shield, Target, Users, Zap, Globe, Cpu, ArrowDown } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Cinematic Hero */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10"></div>
          <Image 
            src="/jobs/cloud.png" 
            alt="TN Vision" 
            fill 
            className="object-cover opacity-50 scale-110"
          />
        </div>
        
        <div className="apple-container relative z-20 animate-in">
          <div className="max-w-4xl space-y-8">
            <div className="text-apple-blue font-black text-xl tracking-[0.4em] uppercase mb-4">Tầm nhìn TN.</div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
              Kiến tạo <br />
              Tương lai <br />
              Công nghệ.
            </h1>
            <p className="text-white/50 text-2xl font-medium max-w-2xl leading-relaxed">
              Chúng tôi không chỉ kết nối con người với công việc. 
              Chúng tôi xây dựng một hệ sinh thái nơi những bộ óc vĩ đại nhất 
              có thể gặp gỡ và tạo ra những đột phá thay đổi thế giới.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/20">
          <ArrowDown size={32} />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 bg-black">
        <div className="apple-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-5 space-y-12">
               <h2 className="text-5xl font-black tracking-tighter text-white leading-tight">
                 Triết lý <br /> 
                 Thiết kế & <br />
                 Kỹ thuật.
               </h2>
               <p className="text-white/40 text-lg leading-relaxed font-medium">
                 Tại TN Recruitment, chúng tôi tin rằng sự tối giản là đỉnh cao của sự tinh tế. 
                 Mọi dòng code, mọi pixel đều được chăm chút để mang lại trải nghiệm mượt mà, 
                 giúp ứng viên tập trung hoàn toàn vào những gì quan trọng nhất: Sự nghiệp của họ.
               </p>
               
               <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="text-3xl font-black text-white">99.9%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Hài lòng từ ứng viên</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-black text-white">24h</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Thời gian phản hồi TB</div>
                  </div>
               </div>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                 { title: 'Tốc độ', icon: Zap, desc: 'Hệ thống được tối ưu hóa cho tốc độ phản hồi tức thì.' },
                 { title: 'Bảo mật', icon: Shield, desc: 'Dữ liệu của bạn được bảo vệ bởi các tiêu chuẩn an ninh hàng đầu.' },
                 { title: 'Toàn cầu', icon: Globe, desc: 'Kết nối với các tập đoàn công nghệ lớn nhất thế giới.' },
                 { title: 'AI-First', icon: Cpu, desc: 'Sử dụng trí tuệ nhân tạo để gợi ý công việc phù hợp nhất.' }
               ].map((item, i) => (
                 <div key={i} className="glass-card p-10 space-y-6 hover:border-apple-blue/30 transition-all group">
                    <item.icon size={40} className="text-apple-bright-blue group-hover:scale-110 transition-transform" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">{item.title}</h3>
                      <p className="text-white/40 font-medium text-sm leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section Mockup */}
      <section className="py-40 border-t border-white/5">
        <div className="apple-container text-center space-y-20">
           <div className="space-y-4">
              <h2 className="text-6xl font-black tracking-tighter text-white">Đội ngũ TN.</h2>
              <p className="text-white/40 text-xl font-medium max-w-2xl mx-auto">
                Những con người đứng sau hệ thống, đam mê công nghệ và mong muốn nâng tầm sự nghiệp của bạn.
              </p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-6 group">
                   <div className="aspect-square rounded-[40px] overflow-hidden bg-white/5 relative">
                      <Image 
                        src="/tech-pro.png" 
                        alt="Team member" 
                        fill 
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                   </div>
                   <div className="space-y-1 text-center">
                      <div className="text-xl font-black text-white">Thành viên {i}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Core Architect</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 bg-black text-center border-t border-white/5">
         <div className="apple-container">
            <h2 className="text-7xl font-black tracking-tighter text-white mb-12">Gia nhập cuộc cách mạng.</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
               <button className="btn-primary px-12 py-5 text-xl">Đăng ký ngay</button>
               <button className="px-12 py-5 text-xl font-black text-white hover:text-apple-bright-blue transition-colors">Xem các vị trí trống</button>
            </div>
         </div>
      </section>
    </div>
  );
}
