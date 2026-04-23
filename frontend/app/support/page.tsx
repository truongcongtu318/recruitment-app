'use client';

import { Mail, MessageSquare, Phone, MapPin, Search, ChevronDown, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function SupportPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Làm thế nào để ứng tuyển vào một vị trí?", a: "Bạn chỉ cần chọn công việc phù hợp, nhấn 'Xem chi tiết' và hoàn thành form ứng tuyển đính kèm CV. Hệ thống sẽ tự động thông báo tới nhà tuyển dụng." },
    { q: "Tôi có thể theo dõi trạng thái hồ sơ không?", a: "Hiện tại chúng tôi sẽ gửi thông báo qua email khi có cập nhật mới về hồ sơ của bạn. Tính năng theo dõi trực tiếp đang được phát triển." },
    { q: "Làm sao để liên hệ với bộ phận hỗ trợ kỹ thuật?", a: "Bạn có thể gửi email trực tiếp tới support@tn-recruitment.com hoặc sử dụng form liên hệ bên dưới." },
    { q: "Hồ sơ của tôi có được bảo mật không?", a: "Chắc chắn rồi. Chúng tôi sử dụng các tiêu chuẩn mã hóa dữ liệu cao nhất và lưu trữ trên môi trường AWS VPC bảo mật tuyệt đối." }
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header */}
      <section className="py-20 border-b border-white/5">
        <div className="apple-container animate-in text-center space-y-8">
           <h1 className="text-7xl font-black tracking-tighter text-white">Chúng tôi ở đây <br /> để hỗ trợ bạn.</h1>
           <p className="text-white/40 text-xl font-medium max-w-2xl mx-auto">Tìm câu trả lời cho các thắc mắc của bạn hoặc liên hệ trực tiếp với đội ngũ TN.</p>
           
           <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all text-white font-medium"
              />
           </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-20">
        <div className="apple-container">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Email', value: 'support@tn.com', icon: Mail, label: 'Gửi thư cho chúng tôi' },
                { title: 'Hotline', value: '1900 8888', icon: Phone, label: 'Hỗ trợ 24/7' },
                { title: 'Văn phòng', value: 'Toà nhà TN, TP.HCM', icon: MapPin, label: 'Ghé thăm chúng tôi' }
              ].map((item, i) => (
                <div key={i} className="glass-card p-10 space-y-6 hover:border-apple-blue/30 transition-all group">
                   <item.icon size={32} className="text-apple-bright-blue" />
                   <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{item.label}</div>
                      <div className="text-2xl font-black text-white">{item.value}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* FAQ & Form */}
      <section className="py-20 bg-black">
        <div className="apple-container">
           <div className="grid lg:grid-cols-12 gap-20">
              {/* FAQ */}
              <div className="lg:col-span-7 space-y-10">
                 <h2 className="text-4xl font-black tracking-tighter text-white">Câu hỏi thường gặp.</h2>
                 <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i} className="glass-card overflow-hidden">
                         <button 
                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                            className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
                         >
                            <span className="text-lg font-bold text-white text-left">{faq.q}</span>
                            <ChevronDown className={`text-white/30 transition-transform duration-500 ${activeFaq === i ? 'rotate-180' : ''}`} />
                         </button>
                         <div className={`overflow-hidden transition-all duration-500 ${activeFaq === i ? 'max-h-40 p-8 pt-0' : 'max-h-0'}`}>
                            <p className="text-white/40 font-medium leading-relaxed">{faq.a}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-5">
                 <form className="glass-card p-10 space-y-8 border-apple-blue/20">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black tracking-tighter text-white">Gửi tin nhắn.</h3>
                       <p className="text-white/40 font-medium">Bạn có vấn đề khác? Hãy để lại lời nhắn.</p>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Vấn đề của bạn</label>
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all text-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Nội dung chi tiết</label>
                          <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all text-white resize-none"></textarea>
                       </div>
                    </div>

                    <button className="w-full bg-white text-black py-5 rounded-full text-lg font-black tracking-tight hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                       Gửi tin nhắn
                       <Send size={18} />
                    </button>
                 </form>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
