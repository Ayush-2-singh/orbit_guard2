import Navbar from "@/components/Navbar";
import StarsCanvas from "@/components/StarsCanvas";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEscalation, type EscalationLevel, type EscalationAction } from "@/contexts/EscalationContext";
import ConfirmAction from "@/components/ConfirmAction";
import EscalationBadge from "@/components/EscalationBadge";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface Satellite {
  id: string;
  operator: string;
  orbit: string;
  status: string;
  risk: number;
}

const defaultSatellites: Satellite[] = [
  { id: "SAT-2847", operator: "Starlink", orbit: "LEO 550km", status: "Nominal", risk: 12 },
  { id: "SAT-9123", operator: "OneWeb", orbit: "LEO 1200km", status: "Monitor", risk: 47 },
  { id: "SAT-0381", operator: "Iridium", orbit: "LEO 780km", status: "Nominal", risk: 8 },
  { id: "SAT-5502", operator: "Telesat", orbit: "GEO 35786km", status: "Alert", risk: 83 },
  { id: "DEB-4921", operator: "Debris", orbit: "LEO 620km", status: "Critical", risk: 92 },
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

// ── CSV Upload Panel ──
function CSVUploadPanel({ onUpload }: { onUpload: (sats: Satellite[]) => void }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [uploadMsg, setUploadMsg] = useState("");

  const parseCSV = (text: string) => {
    setUploadState("parsing");
    try {
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV must have a header row and at least one data row");
      }
      const header = lines[0].toLowerCase().split(",").map(h => h.trim());

      // Find column indices
      const idIdx = header.findIndex(h => h.includes("id") || h.includes("object"));
      const opIdx = header.findIndex(h => h.includes("operator") || h.includes("owner") || h.includes("company"));
      const orbitIdx = header.findIndex(h => h.includes("orbit") || h.includes("altitude"));
      const statusIdx = header.findIndex(h => h.includes("status") || h.includes("state"));
      const riskIdx = header.findIndex(h => h.includes("risk") || h.includes("score") || h.includes("threat"));

      const sats: Satellite[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim());
        if (cols.length < 2) continue;
        sats.push({
          id: idIdx >= 0 ? cols[idIdx] : `CSV-${String(i).padStart(4, "0")}`,
          operator: opIdx >= 0 ? cols[opIdx] : "Unknown",
          orbit: orbitIdx >= 0 ? cols[orbitIdx] : "Unknown orbit",
          status: statusIdx >= 0 ? cols[statusIdx] : "Nominal",
          risk: riskIdx >= 0 ? Math.min(100, Math.max(0, parseInt(cols[riskIdx]) || 10)) : 10,
        });
      }

      if (sats.length === 0) throw new Error("No valid satellite records found");

      setUploadState("success");
      setUploadMsg(`${sats.length} satellites imported successfully`);
      onUpload(sats);
      toast({
        title: "📡 CSV Import Complete",
        description: `${sats.length} satellite objects loaded into the dashboard from uploaded file.`,
        variant: "default" as any,
      });
    } catch (err: any) {
      setUploadState("error");
      setUploadMsg(err.message || "Failed to parse CSV");
      toast({
        title: "❌ Import Failed",
        description: err.message || "Could not parse the CSV file. Check the format and try again.",
        variant: "destructive" as any,
      });
    }
    setTimeout(() => setUploadState("idle"), 4000);
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.type.includes("csv") && !file.type.includes("text")) {
      toast({ title: "⚠️ Invalid File", description: "Please upload a .csv file", variant: "destructive" as any });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <Widget title="CSV Data Import">
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${dragOver ? "border-sky-400 bg-sky-400/5" : "border-white/10 hover:border-white/20"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <AnimatePresence mode="wait">
            {uploadState === "success" ? (
              <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
                <p className="text-green-400 text-sm font-semibold">{uploadMsg}</p>
              </motion.div>
            ) : uploadState === "error" ? (
              <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                <XCircle className="w-10 h-10 text-red-400" />
                <p className="text-red-400 text-sm font-semibold">{uploadMsg}</p>
              </motion.div>
            ) : uploadState === "parsing" ? (
              <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sky-400 text-sm">Parsing CSV data...</p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)" }}>
                  {dragOver ? <Upload className="w-6 h-6 text-sky-400" /> : <FileSpreadsheet className="w-6 h-6 text-sky-400" />}
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium">
                    {dragOver ? "Drop CSV here" : "Upload satellite data"}
                  </p>
                  <p className="text-white/30 text-xs mt-1">Drag & drop or click to browse</p>
                </div>
                <p className="text-white/20 text-[10px] font-mono">CSV columns: id, operator, orbit, status, risk</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Widget>
  );
}

export default function DashboardPage() {
  const [satellites, setSatellites] = useState<Satellite[]>(defaultSatellites);
  const [selected, setSelected] = useState<Satellite>(defaultSatellites[4]);
  const { getLevel, escalate, deescalate, getConfirmationMeta, addLogEntry } = useEscalation();
  const { toast } = useToast();

  // ── Tracked states for notifications and acknowledgments ──
  const [notificationsSent, setNotificationsSent] = useState<Set<string>>(new Set());
  const [risksAcknowledged, setRisksAcknowledged] = useState<Set<string>>(new Set());
  const [emergencyDeclared, setEmergencyDeclared] = useState<Set<string>>(new Set());

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

      // ── Action-specific feedback ──
      const satId = pendingAction.satelliteId;
      const action = pendingAction.action;

      if (action === "declare-emergency") {
        setEmergencyDeclared(prev => new Set(prev).add(satId));
        toast({
          title: "🚨 EMERGENCY DECLARED",
          description: `Orbital emergency activated for ${satId}. All alert channels are now active. Full crew alert initiated. Response teams have been notified.`,
          variant: "destructive" as any,
        });
      } else if (action === "send-notification") {
        setNotificationsSent(prev => new Set(prev).add(satId));
        toast({
          title: "📡 Notification Sent",
          description: `Alert notification dispatched to all operators monitoring ${satId} via dashboard, email, and mobile push.`,
          variant: "default" as any,
        });
      } else if (action === "acknowledge-risk") {
        setRisksAcknowledged(prev => new Set(prev).add(satId));
        toast({
          title: "✓ Risk Acknowledged",
          description: `Risk assessment for ${satId} has been reviewed and acknowledged. Removed from active review queue.`,
          variant: "default" as any,
        });
      } else if (action === "escalate-alert") {
        toast({
          title: "⚠️ Alert Escalated",
          description: `${satId} has been promoted to a higher alert tier. Operators have been notified.`,
          variant: "default" as any,
        });
      } else {
        toast({
          title: "✅ Action Confirmed",
          description: `${action.replace(/-/g, " ")} completed for ${satId}.`,
          variant: "default" as any,
        });
      }
    }
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  // ── Escalation cycle ──
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

  // ── Declare emergency ──
  const handleDeclareEmergency = () => {
    openConfirmation(selected.id, "declare-emergency", () => {
      escalate(selected.id, "Emergency");
    });
  };

  // ── Send notification ──
  const handleSendNotification = () => {
    openConfirmation(selected.id, "send-notification", () => {
      setNotificationsSent(prev => new Set(prev).add(selected.id));
    });
  };

  // ── Acknowledge risk ──
  const handleAcknowledgeRisk = () => {
    openConfirmation(selected.id, "acknowledge-risk", () => {
      setRisksAcknowledged(prev => new Set(prev).add(selected.id));
    });
  };

  // ── CSV upload handler ──
  const handleCSVUpload = (newSats: Satellite[]) => {
    setSatellites(prev => [...prev, ...newSats]);
  };

  // ── Get visual state for satellite row ──
  const getRowStyle = (sat: Satellite) => {
    const level = getLevel(sat.id);
    if (level === "Emergency" || emergencyDeclared.has(sat.id)) {
      return {
        background: "rgba(239,68,68,0.08)",
        borderLeft: "3px solid rgba(239,68,68,0.6)",
        boxShadow: "inset 0 0 30px rgba(239,68,68,0.05)",
      };
    }
    if (level === "Critical") {
      return {
        background: "rgba(239,68,68,0.04)",
        borderLeft: "3px solid rgba(239,68,68,0.3)",
      };
    }
    if (level === "Elevated") {
      return {
        borderLeft: "3px solid rgba(245,158,11,0.3)",
      };
    }
    return {};
  };

  return (
    <main className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden text-white">
      <div className="absolute inset-0 z-0 pointer-events-none"><StarsCanvas /></div>
      <Navbar />

      {/* ── Emergency Banner (visible when any satellite is in Emergency) ── */}
      <AnimatePresence>
        {emergencyDeclared.size > 0 && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-16 left-0 right-0 z-40"
          >
            <div
              className="mx-4 sm:mx-8 mt-2 rounded-xl px-6 py-3 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.12))",
                border: "1px solid rgba(239,68,68,0.4)",
                boxShadow: "0 0 30px rgba(239,68,68,0.15)",
              }}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                <span className="text-red-300 text-sm font-bold tracking-wider">
                  ORBITAL EMERGENCY ACTIVE
                </span>
                <span className="text-red-400/60 text-xs font-mono">
                  {Array.from(emergencyDeclared).join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400/60 text-xs font-mono">ALL CHANNELS ACTIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10">
          <p className="text-xs tracking-[0.4em] text-sky-400/70 uppercase mb-3">OrbitGuard Control Suite</p>
          <h1 className="font-black text-4xl sm:text-5xl tracking-tight">Mission Dashboard</h1>
          <p className="text-white/40 text-sm mt-2">Live orbital data · Updated 6s ago · {satellites.length} objects tracked</p>
        </motion.div>

        {/* Top stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tracked Objects", val: String(50247 + (satellites.length - 5) * 3), delta: `+${satellites.length - 5 > 0 ? (satellites.length - 5) * 3 : 0} from CSV`, color: "#38BDF8" },
            { label: "Active Satellites", val: String(12381 + satellites.filter(s => s.status !== "Critical").length), delta: `${satellites.filter(s => s.status === "Critical").length} critical`, color: "#60A5FA" },
            { label: "High-Risk Events", val: String(7 + emergencyDeclared.size), delta: `${emergencyDeclared.size > 0 ? "↑" : ""}${emergencyDeclared.size} emergency`, color: "#f59e0b" },
            { label: "Notifications Sent", val: String(notificationsSent.size), delta: `${risksAcknowledged.size} acknowledged`, color: "#22c55e" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.2 }}
              className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-2">{s.label}</p>
              <p className="font-black text-3xl font-mono mb-1" style={{ color: s.color }}>{s.val}</p>
              <p className="text-white/30 text-xs">{s.delta}</p>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Satellite table */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="lg:col-span-2">
            <Widget title="Satellite Status Table">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/30 text-xs border-b border-white/5">
                      {["Object ID", "Operator", "Orbit", "Status", "Escalation", "Risk", "Actions"].map(h => <th key={h} className="text-left pb-3 font-mono tracking-wider">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {satellites.map((sat) => {
                      const statusColor = sat.status === "Critical" ? "#ef4444" : sat.status === "Alert" ? "#f59e0b" : sat.status === "Monitor" ? "#60A5FA" : "#22c55e";
                      const escLevel = getLevel(sat.id);
                      const nextLevel = LEVEL_ORDER[(LEVEL_ORDER.indexOf(escLevel) + 1) % LEVEL_ORDER.length];
                      const isEmergency = escLevel === "Emergency" || emergencyDeclared.has(sat.id);
                      const isAcknowledged = risksAcknowledged.has(sat.id);

                      return (
                        <motion.tr
                          key={sat.id}
                          layout
                          onClick={() => setSelected(sat)}
                          className={`border-b border-white/5 cursor-pointer transition-all ${selected.id === sat.id ? "bg-sky-400/5" : ""} hover:bg-white/5`}
                          style={selected.id === sat.id ? { ...getRowStyle(sat), background: isEmergency ? "rgba(239,68,68,0.08)" : "rgba(56,189,248,0.05)" } : getRowStyle(sat)}
                        >
                          <td className="py-3 font-mono text-sky-300 text-xs">{sat.id}</td>
                          <td className="py-3 text-white/70">{sat.operator}</td>
                          <td className="py-3 text-white/40 text-xs">{sat.orbit}</td>
                          <td className="py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>{sat.status}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <EscalationBadge level={escLevel} />
                            </div>
                          </td>
                          <td className="py-3 w-24">
                            <RiskBar val={sat.risk} />
                            {isAcknowledged && (
                              <span className="text-[10px] text-green-400/60 font-mono mt-0.5 block">✓ Acknowledged</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => cycleLevel(sat.id)}
                                className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-all"
                                style={{ background: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.25)", color: "#38BDF8" }}
                                title={`Escalate to ${nextLevel}`}
                              >
                                ↑ {nextLevel.slice(0, 4)}
                              </motion.button>
                              {LEVEL_ORDER.indexOf(escLevel) > 0 && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeescalate(sat.id)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-all"
                                  style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}
                                  title="De-escalate"
                                >
                                  ↓ Down
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Widget>
          </motion.div>

          {/* Risk detail panel */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
            <Widget title="Risk Intelligence" className="h-full">
              <div className="flex flex-col gap-4">
                <div className="text-center py-4">
                  <p className="text-xs text-white/30 font-mono mb-2">{selected.id}</p>
                  <div className="relative inline-flex items-center justify-center w-28 h-28">
                    <svg className="absolute" width="112" height="112" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <motion.circle key={selected.risk} cx="56" cy="56" r="48" fill="none"
                        stroke={selected.risk > 75 ? "#ef4444" : selected.risk > 40 ? "#f59e0b" : "#22c55e"}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(selected.risk / 100) * 301.6} 301.6`}
                        strokeDashoffset="75.4"
                        initial={{ strokeDasharray: "0 301.6" }}
                        animate={{ strokeDasharray: `${(selected.risk / 100) * 301.6} 301.6` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ filter: `drop-shadow(0 0 6px ${selected.risk > 75 ? "#ef4444" : selected.risk > 40 ? "#f59e0b" : "#22c55e"})` }}
                      />
                    </svg>
                    <div className="text-center">
                      <div className="font-black text-3xl font-mono" style={{ color: selected.risk > 75 ? "#ef4444" : selected.risk > 40 ? "#f59e0b" : "#22c55e" }}>{selected.risk}</div>
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

                {/* Notification sent status */}
                {notificationsSent.has(selected.id) && (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span className="text-sky-300 text-xs font-mono">Notifications dispatched</span>
                  </div>
                )}

                {/* Acknowledged status */}
                {risksAcknowledged.has(selected.id) && (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-xs font-mono">Risk acknowledged</span>
                  </div>
                )}

                {[{ f: "Relative Velocity", v: "14.2 km/s" }, { f: "Miss Distance", v: "182m" }, { f: "Orbital Congestion", v: "High" }, { f: "Historical Risk", v: "Elevated" }].map(item => (
                  <div key={item.f} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/40 text-xs">{item.f}</span>
                    <span className="text-white text-xs font-mono">{item.v}</span>
                  </div>
                ))}

                {/* Action buttons with real handlers */}
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
                    onClick={handleSendNotification}
                    className={`w-full py-3 rounded-xl text-xs font-bold tracking-[0.15em] text-white cursor-pointer ${notificationsSent.has(selected.id) ? "opacity-60" : ""}`}
                    style={{
                      background: notificationsSent.has(selected.id) ? "rgba(34,197,94,0.12)" : "rgba(56,189,248,0.12)",
                      border: `1px solid ${notificationsSent.has(selected.id) ? "rgba(34,197,94,0.35)" : "rgba(56,189,248,0.35)"}`,
                    }}
                  >
                    {notificationsSent.has(selected.id) ? "✓ NOTIFICATION SENT" : "📡 SEND NOTIFICATION →"}
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAcknowledgeRisk}
                    className={`w-full py-3 rounded-xl text-xs font-bold tracking-[0.15em] cursor-pointer ${risksAcknowledged.has(selected.id) ? "text-green-400/80" : "text-white/60"}`}
                    style={{
                      background: risksAcknowledged.has(selected.id) ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${risksAcknowledged.has(selected.id) ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.10)"}`,
                    }}
                  >
                    {risksAcknowledged.has(selected.id) ? "✓ RISK ACKNOWLEDGED" : "✓ ACKNOWLEDGE RISK"}
                  </motion.button>
                </div>
              </div>
            </Widget>
          </motion.div>
        </div>

        {/* Bottom row: CSV upload + widgets + emergency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {/* CSV Upload */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
            <CSVUploadPanel onUpload={handleCSVUpload} />
          </motion.div>

          <Widget title="Conjunction Forecast">
            <div className="flex flex-col gap-3">
              {[{ time: "T+02:14", risk: "Critical", color: "#ef4444" }, { time: "T+06:51", risk: "High", color: "#f59e0b" }, { time: "T+18:33", risk: "Moderate", color: "#60A5FA" }, { time: "T+24:00", risk: "Low", color: "#22c55e" }].map(e => (
                <div key={e.time} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="font-mono text-xs text-white/50">{e.time}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${e.color}20`, color: e.color }}>{e.risk}</span>
                </div>
              ))}
            </div>
          </Widget>

          <Widget title="Orbital Density Heatmap">
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 64 }, (_, i) => {
                const intensity = Math.random();
                const alpha = 0.15 + intensity * 0.6;
                const bg = intensity > 0.8 ? `rgba(239,68,68,${alpha})` : intensity > 0.6 ? `rgba(245,158,11,${alpha})` : `rgba(56,189,248,${alpha})`;
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
                style={{
                  background: emergencyDeclared.has(selected.id) ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.12)",
                  border: emergencyDeclared.has(selected.id) ? "2px solid rgba(239,68,68,0.6)" : "1px solid rgba(239,68,68,0.45)",
                  boxShadow: emergencyDeclared.has(selected.id) ? "0 0 20px rgba(239,68,68,0.2)" : "none",
                }}
              >
                {emergencyDeclared.has(selected.id) ? "🚨 EMERGENCY ACTIVE" : "🚨 DECLARE EMERGENCY →"}
              </motion.button>
              {getLevel(selected.id) !== "Normal" && (
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openConfirmation(selected.id, "change-status", () => {
                    deescalate(selected.id, "Normal");
                    // Also clear emergency state if applicable
                    setEmergencyDeclared(prev => {
                      const next = new Set(prev);
                      next.delete(selected.id);
                      return next;
                    });
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
