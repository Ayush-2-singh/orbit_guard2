import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import type { ConfirmationMeta } from "@/contexts/EscalationContext";

interface ConfirmActionProps {
  open: boolean;
  meta: ConfirmationMeta | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const levelColors: Record<string, { border: string; glow: string; text: string; bg: string; icon: string }> = {
  Normal:   { border: "rgba(34,197,94,0.4)",  glow: "rgba(34,197,94,0.08)",  text: "#22c55e", bg: "rgba(34,197,94,0.12)",  icon: "text-green-400" },
  Elevated: { border: "rgba(245,158,11,0.5)", glow: "rgba(245,158,11,0.10)", text: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "text-amber-400" },
  Critical: { border: "rgba(239,68,68,0.5)",  glow: "rgba(239,68,68,0.10)",  text: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: "text-red-400" },
  Emergency:{ border: "rgba(239,68,68,0.7)",  glow: "rgba(239,68,68,0.18)",  text: "#ef4444", bg: "rgba(239,68,68,0.18)",  icon: "text-red-400" },
};

export default function ConfirmAction({ open, meta, onConfirm, onCancel }: ConfirmActionProps) {
  const [typedValue, setTypedValue] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setTypedValue("");
      setAcknowledged(false);
      setError(false);
    }
  }, [open]);

  const colors = meta ? levelColors[meta.level] ?? levelColors.Normal : levelColors.Normal;

  const canConfirm = useCallback(() => {
    if (!meta) return false;
    if (meta.requiresTypedConfirm && typedValue !== meta.typedConfirmText) return false;
    if (meta.requireAcknowledgment && !acknowledged) return false;
    return true;
  }, [meta, typedValue, acknowledged]);

  const handleConfirm = () => {
    if (!canConfirm()) {
      setError(true);
      setTimeout(() => setError(false), 600);
      return;
    }
    onConfirm();
  };

  if (!meta) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-[201] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10,15,30,0.97)",
                border: `1px solid ${colors.border}`,
                boxShadow: `0 0 60px ${colors.glow}, 0 25px 50px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Top accent */}
              <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${colors.text}, transparent)` }} />

              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                  >
                    {meta.level === "Emergency" || meta.level === "Critical" ? (
                      <ShieldAlert className={`w-5 h-5 ${colors.icon}`} />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 ${colors.icon}`} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{meta.title}</h3>
                    <span
                      className="text-[10px] font-mono tracking-[0.2em] uppercase mt-0.5 inline-block"
                      style={{ color: colors.text }}
                    >
                      {meta.level} Level
                    </span>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pb-4 space-y-4">
                {/* Description */}
                <p className="text-white/60 text-sm leading-relaxed">{meta.description}</p>

                {/* Consequence warning */}
                <div
                  className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: `${colors.bg}`,
                    border: `1px solid ${colors.border}`,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: colors.text }}>
                    ⚡ Consequences
                  </span>
                  {meta.consequenceWarning}
                </div>

                {/* Typed confirmation */}
                {meta.requiresTypedConfirm && meta.typedConfirmText && (
                  <div>
                    <label className="text-white/40 text-xs tracking-wider uppercase mb-1.5 block">
                      Type <span className="font-mono text-white/80">"{meta.typedConfirmText}"</span> to confirm
                    </label>
                    <motion.input
                      animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
                      transition={{ duration: 0.3 }}
                      type="text"
                      value={typedValue}
                      onChange={(e) => { setTypedValue(e.target.value); setError(false); }}
                      placeholder={meta.typedConfirmText}
                      className="w-full bg-white/5 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-wider placeholder:text-white/15 focus:outline-none transition-colors"
                      style={{
                        border: typedValue === meta.typedConfirmText
                          ? `1px solid ${colors.border}`
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
                    />
                  </div>
                )}

                {/* Acknowledgment checkbox */}
                {meta.requireAcknowledgment && (
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={acknowledged}
                        onChange={() => setAcknowledged(!acknowledged)}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                        style={{
                          background: acknowledged ? colors.bg : "rgba(255,255,255,0.05)",
                          border: acknowledged ? `1px solid ${colors.border}` : "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {acknowledged && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </div>
                    </div>
                    <span className="text-white/50 text-xs leading-relaxed group-hover:text-white/70 transition-colors">
                      I understand the consequences and confirm this action with full awareness of the{" "}
                      <span style={{ color: colors.text }}>{meta.level.toLowerCase()}</span> escalation level.
                    </span>
                  </label>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex items-center gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide text-white/60 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {meta.cancelLabel}
                </button>
                <motion.button
                  whileHover={canConfirm() ? { y: -1, boxShadow: `0 0 20px ${colors.glow}` } : {}}
                  whileTap={canConfirm() ? { scale: 0.97 } : {}}
                  onClick={handleConfirm}
                  disabled={!canConfirm()}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: canConfirm() ? colors.bg : "rgba(255,255,255,0.03)",
                    border: canConfirm() ? `1px solid ${colors.border}` : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {meta.confirmLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
