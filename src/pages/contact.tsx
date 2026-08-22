import Navbar from "@/components/Navbar";
import StarsCanvas from "@/components/StarsCanvas";
import { motion } from "framer-motion";
import { useState } from "react";

const contacts = [
  { label: "Sales & Demos", handle: "sales@orbitguard.io", icon: "💼", color: "#38BDF8" },
  { label: "Engineering", handle: "tech@orbitguard.io", icon: "⚙️", color: "#60A5FA" },
  { label: "Press & Media", handle: "press@orbitguard.io", icon: "📡", color: "#7DD3FC" },
  { label: "Headquarters", handle: "Houston, TX — USA", icon: "🌐", color: "#38BDF8" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ org: "", email: "", type: "Demo Request", message: "" });

  return (
    <main className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden text-white">
      <div className="absolute inset-0 z-0 pointer-events-none"><StarsCanvas /></div>
      <div className="absolute z-0 pointer-events-none" style={{ top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:"70vw", height:"70vw", maxWidth:"800px", background:"radial-gradient(ellipse at center, rgba(56,189,248,0.10) 0%, transparent 70%)", filter:"blur(70px)", borderRadius:"50%" }} />
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8 }} className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] text-sky-400/70 uppercase mb-4">Get In Touch</p>
          <h1 className="font-black text-5xl sm:text-7xl leading-none tracking-tight mb-6">Contact<br /><span className="text-sky-400">OrbitGuard</span></h1>
          <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">Whether you're a satellite operator, defense agency, or commercial space company — we'd like to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3, duration:0.8 }} className="lg:col-span-2 flex flex-col gap-4">
            <p className="text-xs text-white/30 tracking-widest uppercase mb-2">Reach us at</p>
            {contacts.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1*i+0.4 }}
                className="flex items-center gap-4 p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background:`${c.color}18`, border:`1px solid ${c.color}30` }}>{c.icon}</div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">{c.label}</p>
                  <p className="text-white text-sm font-medium">{c.handle}</p>
                </div>
              </motion.div>
            ))}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }} className="mt-4 p-5 rounded-xl" style={{ background:"rgba(56,189,248,0.05)", border:"1px solid rgba(56,189,248,0.12)" }}>
              <p className="text-white/30 text-xs tracking-widest uppercase mb-3">Certifications</p>
              {["ISO 27001 Certified","ITAR Compliant","SOC 2 Type II","FedRAMP Authorized"].map(cert=>(
                <div key={cert} className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span className="text-white/60 text-xs">{cert}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4, duration:0.8 }} className="lg:col-span-3">
            <div className="rounded-2xl p-8" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(20px)" }}>
              {submitted ? (
                <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="text-center py-12">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background:"rgba(56,189,248,0.15)", border:"1px solid rgba(56,189,248,0.4)" }}>
                    <span className="text-2xl">🛰</span>
                  </div>
                  <h3 className="font-black text-white text-2xl mb-3">Message Received</h3>
                  <p className="text-white/50 text-sm leading-relaxed">Our team will respond within 24 hours.<br />For urgent orbital safety matters, call our hotline.</p>
                </motion.div>
              ) : (
                <form onSubmit={e=>{e.preventDefault();setSubmitted(true);}} className="flex flex-col gap-5">
                  <p className="text-white/30 text-xs tracking-widest uppercase mb-2">Send a secure message</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                      <label className="text-white/40 text-xs tracking-wider uppercase">Organization</label>
                      <input data-testid="input-org" type="text" required value={form.org} onChange={e=>setForm({...form,org:e.target.value})} placeholder="SpaceX / ESA / DoD" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                      <label className="text-white/40 text-xs tracking-wider uppercase">Inquiry Type</label>
                      <select data-testid="select-type" value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors">
                        <option>Demo Request</option>
                        <option>Partnership</option>
                        <option>Enterprise License</option>
                        <option>Government Contract</option>
                        <option>Press / Media</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-white/40 text-xs tracking-wider uppercase">Work Email</label>
                    <input data-testid="input-email" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@agency.gov" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-white/40 text-xs tracking-wider uppercase">Message</label>
                    <textarea data-testid="input-message" required rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Describe your orbital safety needs..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 transition-colors resize-none" />
                  </div>
                  <motion.button data-testid="button-submit" type="submit" whileHover={{ y:-2, boxShadow:"0 0 30px rgba(56,189,248,0.5)" }} whileTap={{ scale:0.97 }} className="w-full py-4 rounded-xl font-bold text-sm tracking-[0.2em] text-white cursor-pointer mt-2" style={{ background:"rgba(56,189,248,0.12)", border:"1px solid rgba(56,189,248,0.4)" }}>
                    SEND SECURE MESSAGE →
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {[{ heading:"Mission", links:["About OrbitGuard","Our Science","Team","Careers"] },{ heading:"Technology", links:["AI Engine","Data Sources","API","Security"] },{ heading:"Platform", links:["Dashboard","Tracking","Alerts","Analytics"] },{ heading:"Company", links:["Contact","Privacy Policy","Terms of Use","Status"] }].map(col=>(
            <div key={col.heading}>
              <p className="text-xs text-sky-400/70 tracking-widest uppercase mb-4">{col.heading}</p>
              {col.links.map(l=><p key={l} className="text-white/40 text-sm mb-2.5 hover:text-white/70 cursor-pointer transition-colors">{l}</p>)}
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-sky-400/60 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-sky-400" /></div>
            <span className="font-mono text-sm text-white/50 tracking-wider">ORBITGUARD</span>
          </div>
          <p className="text-white/30 text-xs">© 2025 OrbitGuard Inc. All rights reserved.</p>
          <p className="text-white/20 text-xs font-mono">ITAR · ISO 27001 · FedRAMP</p>
        </div>
      </footer>
    </main>
  );
}
