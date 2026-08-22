import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import StarsCanvas from "@/components/StarsCanvas";
import { motion } from "framer-motion";
import { useEscalation } from "@/contexts/EscalationContext";
import ConfirmAction from "@/components/ConfirmAction";

const capabilities = [
  { icon: "🛰", title: "Space Object Tracking", color: "#38BDF8", desc: "Monitor 50,000+ active satellites, rocket bodies, and debris objects in real-time across all orbital regimes — LEO, MEO, GEO, and beyond.", stats: "50,000+ objects" },
  { icon: "⚠️", title: "Collision Prediction", color: "#60A5FA", desc: "Detect future conjunction events up to 7 days in advance. Probability-weighted risk assessments updated every 6 hours from multi-source data.", stats: "7-day lookahead" },
  { icon: "🧠", title: "Risk Intelligence Engine", color: "#7DD3FC", desc: "Generate risk scores using AI models trained on historical conjunction data. Factor in velocity, distance, orbital density, and maneuver history.", stats: "99.7% accuracy" },
  { icon: "📊", title: "Orbital Analytics", color: "#38BDF8", desc: "Monitor traffic density and congestion levels across orbital shells. Visualize historical trends and predict future saturation.", stats: "Real-time" },
  { icon: "🔔", title: "Automated Alerts", color: "#60A5FA", desc: "Notify operators before high-risk conjunction events. Multi-channel delivery via dashboard, email, API webhooks, and mobile push.", stats: "< 30s latency" },
  { icon: "🗺", title: "Mission Planning Support", color: "#7DD3FC", desc: "Provide decision support for launch window selection, orbit insertion, and debris avoidance maneuvers.", stats: "24/7 available" },
];

const problems = [
  { label: "Collision Risks", desc: "Two objects converging at 15km/s with milliseconds to react.", icon: "💥" },
  { label: "Mission Failures", desc: "A single debris strike can end a $300M satellite mission.", icon: "📡" },
  { label: "Comm Disruptions", desc: "Debris clouds block critical communication corridors.", icon: "📶" },
  { label: "Growing Debris", desc: "27,000+ tracked objects. Millions of fragments too small to catalog.", icon: "🌐" },
];

const steps = ["Track", "Analyze", "Predict", "Prevent"];

function fadeUp(delay = 0) {
  return { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7, delay, ease: "easeOut" } };
}

export default function CapabilitiesPage() {
  const { getConfirmationMeta } = useEscalation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState<ReturnType<typeof getConfirmationMeta> | null>(null);

  const handleSubscribeAlerts = useCallback(() => {
    const meta = getConfirmationMeta("SYSTEM", "subscribe-alerts");
    setConfirmMeta(meta);
    setConfirmOpen(true);
  }, [getConfirmationMeta]);

  return (
    <main className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden text-white">
      <div className="absolute inset-0 z-0 pointer-events-none"><StarsCanvas /></div>
      <Navbar />

      {/* Problem Section */}
      <section className="relative z-10 pt-36 pb-24 px-6 max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] text-sky-400/70 uppercase mb-4">The Challenge</p>
          <h2 className="font-black text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight mb-6">The Orbit Is Getting<br /><span className="text-sky-400">Crowded</span></h2>
          <p className="text-white/50 max-w-2xl mx-auto text-base leading-relaxed">The number of active satellites and debris objects is growing exponentially. Low-Earth orbit is becoming a contested, congested, and competitive environment.</p>
          <motion.button
            whileHover={{ y: -2, boxShadow: "0 0 30px rgba(56,189,248,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubscribeAlerts}
            className="mt-6 mx-auto px-8 py-3 rounded-full font-sans font-semibold text-sm tracking-wider text-white cursor-pointer block"
            style={{ backdropFilter: "blur(20px)", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.35)" }}
          >
            🔔 Subscribe to Real-Time Alerts →
          </motion.button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p, i) => (
            <motion.div key={p.label} {...fadeUp(0.1 * i + 0.2)} className="relative rounded-2xl p-6 group" style={{ background:"rgba(56,189,248,0.04)", border:"1px solid rgba(56,189,248,0.12)", backdropFilter:"blur(12px)" }}>
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{p.label}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solution workflow */}
      <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14">
          <p className="text-xs tracking-[0.4em] text-sky-400/70 uppercase mb-4">Our Solution</p>
          <h2 className="font-black text-5xl sm:text-6xl leading-none tracking-tight mb-4">One Platform.<br /><span className="text-sky-400">Complete Orbital Awareness.</span></h2>
        </motion.div>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {steps.map((s, i) => (
            <motion.div key={s} {...fadeUp(0.15 * i + 0.2)} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-sky-300 text-xs tracking-widest" style={{ background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)" }}>
                  0{i + 1}
                </div>
                <span className="font-bold text-white text-sm tracking-wider">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="text-sky-400/40 text-2xl font-thin pb-5">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Capabilities grid */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] text-sky-400/70 uppercase mb-4">Core Capabilities</p>
          <h2 className="font-black text-5xl sm:text-6xl leading-none tracking-tight">Built for Orbital-Grade<br /><span className="text-sky-400">Operations</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div key={cap.title} {...fadeUp(0.08 * i + 0.1)} whileHover={{ y: -5, transition: { duration: 0.2 } }}
              data-testid={`card-capability-${i + 1}`}
              className="group relative rounded-2xl overflow-hidden cursor-default"
              style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", backdropFilter:"blur(12px)" }}>
              <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg, ${cap.color}, transparent)` }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ boxShadow:`inset 0 0 60px ${cap.color}15`, border:`1px solid ${cap.color}25` }} />
              <div className="p-7">
                <div className="text-3xl mb-5">{cap.icon}</div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-white text-xl leading-tight">{cap.title}</h3>
                  <span className="text-xs font-mono text-sky-400 ml-2 mt-1 whitespace-nowrap">{cap.stats}</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl p-10 sm:p-16" style={{ background:"rgba(56,189,248,0.04)", border:"1px solid rgba(56,189,248,0.12)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {[{ val:"50,000+", label:"Tracked Objects" },{ val:"12,000+", label:"Active Satellites" },{ val:"24/7", label:"Monitoring" },{ val:"99.7%", label:"Reliability" }].map((s, i) => (
              <motion.div key={s.label} {...fadeUp(0.1 * i + 0.2)}>
                <div className="font-black text-4xl sm:text-5xl text-sky-400 mb-2 font-mono">{s.val}</div>
                <div className="text-white/50 text-sm tracking-widest uppercase">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Confirm Dialog */}
      <ConfirmAction open={confirmOpen} meta={confirmMeta} onConfirm={() => setConfirmOpen(false)} onCancel={() => setConfirmOpen(false)} />

      {/* Roadmap */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto pb-32">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] text-sky-400/70 uppercase mb-4">Roadmap</p>
          <h2 className="font-black text-5xl sm:text-6xl leading-none tracking-tight">The Path<br /><span className="text-sky-400">Forward</span></h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-sky-400/60 via-sky-400/20 to-transparent" />
          <div className="flex flex-col gap-10 pl-20">
            {[{ year:"2025", title:"Orbital Monitoring Platform", active:true },{ year:"2026", title:"AI Risk Prediction Engine" },{ year:"2027", title:"Global Traffic Intelligence" },{ year:"2028", title:"Autonomous Collision Prevention" }].map((item, i) => (
              <motion.div key={item.year} {...fadeUp(0.12 * i + 0.2)} className="relative">
                <div className={`absolute -left-[3.2rem] top-1 w-4 h-4 rounded-full border-2 ${item.active ? "bg-sky-400 border-sky-400" : "bg-transparent border-sky-400/40"}`} style={{ boxShadow: item.active ? "0 0 12px rgba(56,189,248,0.8)" : "none" }} />
                <span className="font-mono text-sky-400/70 text-xs tracking-widest">{item.year}</span>
                <h3 className={`font-bold text-xl mt-1 ${item.active ? "text-white" : "text-white/50"}`}>{item.title}</h3>
                {item.active && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-400/15 text-sky-300 border border-sky-400/30 mt-1 inline-block">Active</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
