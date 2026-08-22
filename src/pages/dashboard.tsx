import Navbar from "@/components/Navbar";
import StarsCanvas from "@/components/StarsCanvas";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { useEscalation, type EscalationLevel, type EscalationAction } from "@/contexts/EscalationContext";
import ConfirmAction from "@/components/ConfirmAction";
import EscalationBadge from "@/components/EscalationBadge";

const satellites = [
  { id:"SAT-2847", operator:"Starlink", orbit:"LEO 550km", status:"Nominal", risk:12 },
  { id:"SAT-9123", operator:"OneWeb", orbit:"LEO 1200km", status:"Monitor", risk:47 },
  { id:"SAT-0381", operator:"Iridium", orbit:"LEO 780km", status:"Nominal", risk:8 },
  { id:"SAT-5502", operator:"Telesat", orbit:"GEO 35786km", status:"Alert", risk:83 },
  { id:"DEB-4921", operator:"Debris", orbit:"LEO 620km", status:"Critical", risk:92 },
];

const LEVEL_ORDER: EscalationLevel[] = ["Normal", "Elevated", "Critical", "Emergency"];

function RiskBar({ val }: { val: number }) {
  const color = val > 75 ? "#ef4444" : val > 40 ? "#f59e0b" : "#22c55e";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${val}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className="h-full rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color }}>{val}</span>
    </div>
  );
}

function Widget({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-mono text-sky-400/70 tracking-widest uppercase">{title}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [selected, setSelected] = useState(satellites[4]);
  const { getLevel, escalate, deescalate, getConfirmationMeta, addLogEntry } = useEscalation();

  // ── Confirmation dialog state ──
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState<ReturnType<typeof getConfirmationMeta> | null>(null);
  const [pendingAction, setPendingAction] = useState<{ satelliteId: string; action: EscalationAction; handler: () => void } | null>(null);

  const openConfirmation = useCallback(
    (satelliteId: string, action: EscalationAction, handler: () => void) => {
      const meta = getConfirmationMeta(satelliteId, action);
      setConfirmMeta(meta);
      setPendingAction({ satelliteId, action, handler });
      setConfirmOpen(true);
    },
    [getConfirmationMeta]
  );

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction.handler();
      addLogEntry({
        id: crypto.randomUUID(),
        satelliteId: pendingAction.satelliteId,
        action: pendingAction.action,
        level: getLevel(pendingAction.satelliteId),
      });
    }
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  // ── Escalation cycle: cycle through levels ──
  const cycleLevel = (satId: string) => {
    const current = getLevel(satId);
    const idx = LEVEL_ORDER.indexOf(current);
    const next = LEVEL_ORDER[(idx + 1) % LEVEL_ORDER.length];
    openConfirmation(satId, "escalate-alert", () => {
      escalate(satId, next);
    });
  };

  // ── Quick de-escalate ──
  const handleDeescalate = (satId: string) => {
    const current = getLevel(satId);
    const idx = LEVEL_ORDER.indexOf(current);
    if (idx > 0) {
      openConfirmation(satId, "change-status", () => {
        deescalate(satId, LEVEL_ORDER[idx - 1]);
      });
    }
  };

  // ── Declare emergency for selected satellite ──
  const handleDeclareEmergency = () => {
    openConfirmation(selected.id, "declare-emergency", () => {
      escalate(selected.id, "Emergency");
    });
  };

  return (
    <main className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden text-white">
      <div className="absolute inset-0 z-0 pointer-events-none"><StarsCanvas /></div>
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10">
          <p className="text-xs tracking-[0.4em] text-sky-400/70 uppercase mb-3">OrbitGuard Control Suite</p>
          <h1 className="font-black text-4xl sm:text-5xl tracking-tight">Mission Dashboard</h1>
          <p className="text-white/40 text-sm mt-2">Live orbital data · Updated 6s ago</p>
        </motion.div>

        {/* Top stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[{ label:"Tracked Objects", val:"50,247", delta:"+12 today", color:"#38BDF8" },{ label:"Active Satellites", val:"12,381", delta:"+3 today", color:"#60A5FA" },{ label:"High-Risk Events", val:"7", delta:"↑2 from yesterday", color:"#f59e0b" },{ label:"Critical Alerts", val:"1", delta:"Immediate action", color:"#ef4444" }].map((s,i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1*i+0.2 }}
              className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-2">{s.label}</p>
              <p className="font-black text-3xl font-mono mb-1" style={{ color:s.color }}>{s.val}</p>
              <p className="text-white/30 text-xs">{s.delta}</p>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Satellite table */}
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4, duration:0.8 }} className="lg:col-span-2">
            <Widget title="Satellite Status Table">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/30 text-xs border-b border-white/5">
                    {["Object ID","Operator","Orbit","Status","Escalation","Risk","Actions"].map(h=><th key={h} className="text-left pb-3 font-mono tracking-wider">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {satellites.map((sat, i) => {
                    const statusColor = sat.status==="Critical"?"#ef4444":sat.status==="Alert"?"#f59e0b":sat.status==="Monitor"?"#60A5FA":"#22c55e";
                    const escLevel = getLevel(sat.id);
                    const nextLevel = LEVEL_ORDER[(LEVEL_ORDER.indexOf(escLevel) + 1) % LEVEL_ORDER.length];
                    return (
                      <tr key={sat.id} onClick={()=>setSelected(sat)} className={`border-b border-white/5 cursor-pointer transition-colors ${selected.id===sat.id?"bg-sky-400/5":""} hover:bg-white/5`}>
                        <td className="py-3 font-mono text-sky-300 text-xs">{sat.id}</td>
                        <td className="py-3 text-white/70">{sat.operator}</td>
                        <td className="py-3 text-white/40 text-xs">{sat.orbit}</td>
                        <td className="py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background:`${statusColor}20`, color:statusColor, border:`1px solid ${statusColor}40` }}>{sat.status}</span></td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <EscalationBadge level={escLevel} />
                          </div>
                        </td>
                        <td className="py-3 w-24"><RiskBar val={sat.risk} /></td>
                        <td className="py-3">
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* Escalate button */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => cycleLevel(sat.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-all"
                              style={{
                                background: "rgba(56,189,248,0.10)",
                                border: "1px solid rgba(56,189,248,0.25)",
                                color: "#38BDF8",
                              }}
                              title={`Escalate to ${nextLevel}`}
                            >
                              ↑ {nextLevel.slice(0,4)}
                            </motion.button>
                            {/* De-escalate button (only if not Normal) */}
                            {LEVEL_ORDER.indexOf(escLevel) > 0 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeescalate(sat.id)}
                                className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-all"
                                style={{
                                  background: "rgba(34,197,94,0.10)",
                                  border: "1px solid rgba(34,197,94,0.25)",
                                  color: "#22c55e",
                                }}
                                title="De-escalate"
                              >
                                ↓ Down
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Widget>
          </motion.div>

          {/* Risk detail panel */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5, duration:0.8 }}>
            <Widget title="Risk Intelligence" className="h-full">
              <div className="flex flex-col gap-4">
                <div className="text-center py-4">
                  <p className="text-xs text-white/30 font-mono mb-2">{selected.id}</p>
                  <div className="relative inline-flex items-center justify-center w-28 h-28">
                    <svg className="absolute" width="112" height="112" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <motion.circle key={selected.risk} cx="56" cy="56" r="48" fill="none"
                        stroke={selected.risk>75?"#ef4444":selected.risk>40?"#f59e0b":"#22c55e"}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(selected.risk/100)*301.6} 301.6`}
                        strokeDashoffset="75.4"
                        initial={{ strokeDasharray:"0 301.6" }}
                        animate={{ strokeDasharray:`${(selected.risk/100)*301.6} 301.6` }}
                        transition={{ duration:1, ease:"easeOut" }}
                        style={{ filter:`drop-shadow(0 0 6px ${selected.risk>75?"#ef4444":selected.risk>40?"#f59e0b":"#22c55e"})` }}
                      />
                    </svg>
                    <div className="text-center">
                      <div className="font-black text-3xl font-mono" style={{ color:selected.risk>75?"#ef4444":selected.risk>40?"#f59e0b":"#22c55e" }}>{selected.risk}</div>
                      <div className="text-white/30 text-xs">/ 100</div>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm font-semibold mt-2">Risk Score</p>
                </div>

                {/* Current escalation level */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/40 text-xs">Escalation Level</span>
                  <EscalationBadge level={getLevel(selected.id)} size="md" />
                </div>

                {[{ f:"Relative Velocity", v:"14.2 km/s" },{ f:"Miss Distance", v:"182m" },{ f:"Orbital Congestion", v:"High" },{ f:"Historical Risk", v:"Elevated" }].map(item=>(
                  <div key={item.f} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/40 text-xs">{item.f}</span>
                    <span className="text-white text-xs font-mono">{item.v}</span>
                  </div>
                ))}

                {/* Action buttons with escalation confirmation */}
                <div className="flex flex-col gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openConfirmation(selected.id, "escalate-alert", () => {
                      const current = getLevel(selected.id);
                      const idx = LEVEL_ORDER.indexOf(current);
                      if (idx < LEVEL_ORDER.length - 1) escalate(selected.id, LEVEL_ORDER[idx + 1]);
                    })}
                    className="w-full py-3 rounded-xl text-xs font-bold tracking-[0.15em] text-white cursor-pointer"
                    style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)" }}
                  >
                    ⚠ ESCALATE ALERT →
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openConfirmation(selected.id, "send-notification", () => {
                      // Simulated notification send
                    })}
                    className="w-full py-3 rounded-xl text-xs font-bold tracking-[0.15em] text-white cursor-pointer"
                    style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.35)" }}
                  >
                    📡 SEND NOTIFICATION →
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openConfirmation(selected.id, "acknowledge-risk", () => {
                      // Simulated risk acknowledgment
                    })}
                    className="w-full py-3 rounded-xl text-xs font-bold tracking-[0.15em] text-white/60 cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    ✓ ACKNOWLEDGE RISK
                  </motion.button>
                </div>
              </div>
            </Widget>
          </motion.div>
        </div>

        {/* Bottom row: widgets + emergency declaration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          <Widget title="Conjunction Forecast">
            <div className="flex flex-col gap-3">
              {[{ time:"T+02:14", risk:"Critical", color:"#ef4444" },{ time:"T+06:51", risk:"High", color:"#f59e0b" },{ time:"T+18:33", risk:"Moderate", color:"#60A5FA" },{ time:"T+24:00", risk:"Low", color:"#22c55e" }].map(e=>(
                <div key={e.time} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="font-mono text-xs text-white/50">{e.time}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:`${e.color}20`, color:e.color }}>{e.risk}</span>
                </div>
              ))}
            </div>
          </Widget>

          <Widget title="Orbital Density Heatmap">
            <div className="grid grid-cols-8 gap-1">
              {Array.from({length:64},(_,i)=>{
                const intensity = Math.random();
                const alpha = 0.15 + intensity * 0.6;
                const bg = intensity>0.8 ? `rgba(239,68,68,${alpha})` : intensity>0.6 ? `rgba(245,158,11,${alpha})` : `rgba(56,189,248,${alpha})`;
                return <div key={i} className="aspect-square rounded-sm" style={{ background: bg }} />;
              })}
            </div>
            <div className="flex justify-between mt-3 text-xs text-white/30">
              <span>Low</span><span>High density</span>
            </div>
          </Widget>

          {/* Emergency Declaration Panel */}
          <Widget title="Emergency Controls">
            <div className="flex flex-col gap-3">
              <p className="text-white/40 text-xs leading-relaxed">
                Declare an orbital emergency for <span className="text-sky-300 font-mono">{selected.id}</span>. This activates all alert channels.
              </p>
              <motion.button
                whileHover={{ y: -2, boxShadow: "0 0 30px rgba(239,68,68,0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDeclareEmergency}
                className="w-full py-3.5 rounded-xl text-xs font-bold tracking-[0.2em] text-white cursor-pointer"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.45)" }}
              >
                🚨 DECLARE EMERGENCY →
              </motion.button>
              {getLevel(selected.id) !== "Normal" && (
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openConfirmation(selected.id, "change-status", () => {
                    deescalate(selected.id, "Normal");
                  })}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold tracking-wider text-white/50 cursor-pointer"
                  style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  ↩ De-escalate to Normal
                </motion.button>
              )}
            </div>
          </Widget>
        </div>

        {/* Escalation Log */}
        <Widget title="Escalation Audit Log">
          <EscalationLog />
        </Widget>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmAction
        open={confirmOpen}
        meta={confirmMeta}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </main>
  );
}

// ── Escalation Log sub-component ──
function EscalationLog() {
  const { log } = useEscalation();

  if (log.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/25 text-sm">No escalation events recorded yet.</p>
        <p className="text-white/15 text-xs mt-1 font-mono">Actions will appear here after confirmation.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
      {log.slice(0, 20).map((entry) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between py-2 px-3 rounded-lg border border-white/5"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-3">
            <EscalationBadge level={entry.level} />
            <span className="text-white/60 text-xs font-mono">{entry.satelliteId}</span>
            <span className="text-white/40 text-xs">{entry.action}</span>
          </div>
          <span className="text-white/20 text-[10px] font-mono">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
