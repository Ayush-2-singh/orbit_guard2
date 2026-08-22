import { motion } from "framer-motion";
import type { EscalationLevel } from "@/contexts/EscalationContext";

const LEVEL_CONFIG: Record<EscalationLevel, { label: string; color: string; bg: string; border: string; pulse: boolean }> = {
  Normal:   { label: "NORMAL",   color: "#22c55e", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.30)",  pulse: false },
  Elevated: { label: "ELEVATED", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", pulse: true },
  Critical: { label: "CRITICAL", color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.40)",  pulse: true },
  Emergency:{ label: "EMERGENCY",color: "#ef4444", bg: "rgba(239,68,68,0.20)",  border: "rgba(239,68,68,0.60)",  pulse: true },
};

interface EscalationBadgeProps {
  level: EscalationLevel;
  size?: "sm" | "md";
}

export default function EscalationBadge({ level, size = "sm" }: EscalationBadgeProps) {
  const config = LEVEL_CONFIG[level];
  const isSmall = size === "sm";

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 rounded-full"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        padding: isSmall ? "2px 8px" : "4px 12px",
      }}
    >
      {/* Pulse dot for elevated+ */}
      {config.pulse && (
        <motion.span
          className="rounded-full flex-shrink-0"
          style={{
            width: isSmall ? 5 : 7,
            height: isSmall ? 5 : 7,
            background: config.color,
            boxShadow: `0 0 6px ${config.color}`,
          }}
          animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!config.pulse && (
        <span
          className="rounded-full flex-shrink-0"
          style={{
            width: isSmall ? 5 : 7,
            height: isSmall ? 5 : 7,
            background: config.color,
          }}
        />
      )}
      <span
        className="font-mono font-bold tracking-[0.15em] uppercase"
        style={{
          color: config.color,
          fontSize: isSmall ? "9px" : "11px",
        }}
      >
        {config.label}
      </span>
    </motion.span>
  );
}

export { LEVEL_CONFIG };
