import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────
export type EscalationLevel = "Normal" | "Elevated" | "Critical" | "Emergency";

export type EscalationAction =
  | "change-status"
  | "escalate-alert"
  | "declare-emergency"
  | "send-notification"
  | "subscribe-alerts"
  | "acknowledge-risk";

interface EscalationContextValue {
  /** Current escalation level per satellite/object ID */
  levels: Record<string, EscalationLevel>;
  /** Get the current level for a satellite (defaults to Normal) */
  getLevel: (id: string) => EscalationLevel;
  /** Promote an object to a higher escalation level */
  escalate: (id: string, to: EscalationLevel) => void;
  /** Demote an object to a lower escalation level */
  deescalate: (id: string, to: EscalationLevel) => void;
  /** Check whether a given action requires confirmation at the current level */
  requiresConfirmation: (id: string, action: EscalationAction) => boolean;
  /** Get the severity metadata for a confirmation dialog */
  getConfirmationMeta: (id: string, action: EscalationAction) => ConfirmationMeta;
  /** Log of recent escalation events (newest first) */
  log: EscalationLogEntry[];
  /** Record a log entry */
  addLogEntry: (entry: Omit<EscalationLogEntry, "timestamp">) => void;
}

export interface ConfirmationMeta {
  level: EscalationLevel;
  requiresTypedConfirm: boolean;
  requireAcknowledgment: boolean;
  title: string;
  description: string;
  consequenceWarning: string;
  confirmLabel: string;
  cancelLabel: string;
  typedConfirmText?: string; // user must type this exact string
}

export interface EscalationLogEntry {
  id: string;
  satelliteId: string;
  action: string;
  level: EscalationLevel;
  timestamp: number;
}

// ─── Level priority (for comparisons) ────────────────────────────────
const LEVEL_PRIORITY: Record<EscalationLevel, number> = {
  Normal: 0,
  Elevated: 1,
  Critical: 2,
  Emergency: 3,
};

// ─── Action requirements by level ────────────────────────────────────
function buildConfirmationMeta(
  level: EscalationLevel,
  action: EscalationAction,
  satelliteId: string
): ConfirmationMeta {
  const base: ConfirmationMeta = {
    level,
    requiresTypedConfirm: false,
    requireAcknowledgment: false,
    title: "",
    description: "",
    consequenceWarning: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
  };

  // ── Normal level: lightweight confirmation on sensitive actions ──
  if (level === "Normal") {
    switch (action) {
      case "change-status":
        return {
          ...base,
          title: "Change Satellite Status",
          description: `Update the operational status of ${satelliteId}. This will be logged in the mission timeline.`,
          consequenceWarning: "Status changes affect monitoring thresholds and alert routing.",
          confirmLabel: "Update Status",
          cancelLabel: "Keep Current",
        };
      case "escalate-alert":
        return {
          ...base,
          title: "Escalate Alert Level",
          description: `Promote ${satelliteId} to a higher alert tier. Operators will be notified.`,
          consequenceWarning: "Escalated alerts trigger additional monitoring and notification channels.",
          confirmLabel: "Escalate",
          cancelLabel: "Keep Normal",
        };
      case "declare-emergency":
        return {
          ...base,
          requiresTypedConfirm: true,
          typedConfirmText: "EMERGENCY",
          title: "Declare Orbital Emergency",
          description: `You are about to declare an EMERGENCY for ${satelliteId}. This activates all alert channels and pauses automated routines.`,
          consequenceWarning: "Emergency declarations are irreversible for 24 hours and trigger a full mission response.",
          confirmLabel: "Declare Emergency",
          cancelLabel: "Abort",
        };
      case "send-notification":
        return {
          ...base,
          title: "Send Operator Notification",
          description: `Send an alert notification to all operators monitoring ${satelliteId}.`,
          consequenceWarning: "Notifications are delivered via dashboard, email, and mobile push simultaneously.",
          confirmLabel: "Send Notification",
          cancelLabel: "Discard",
        };
      case "subscribe-alerts":
        return {
          ...base,
          title: "Subscribe to Real-Time Alerts",
          description: "Enable real-time conjunction and collision alerts for this capability module.",
          consequenceWarning: "You will receive alerts for all objects matching your filter criteria.",
          confirmLabel: "Subscribe",
          cancelLabel: "Not Now",
        };
      case "acknowledge-risk":
        return {
          ...base,
          title: "Acknowledge Risk Assessment",
          description: `Confirm that you have reviewed the risk assessment for ${satelliteId}.`,
          consequenceWarning: "Acknowledged risks are removed from your active review queue.",
          confirmLabel: "Acknowledge",
          cancelLabel: "Review Later",
        };
      default:
        return { ...base, title: "Confirm Action", description: `Perform ${action} on ${satelliteId}?` };
    }
  }

  // ── Elevated level: added typed confirmation for destructive actions ──
  if (level === "Elevated") {
    switch (action) {
      case "change-status":
        return {
          ...base,
          requiresTypedConfirm: true,
          typedConfirmText: "UPDATE",
          title: "⚠️ Elevated — Change Status",
          description: `${satelliteId} is under elevated monitoring. Status changes require explicit confirmation.`,
          consequenceWarning: "Status changes at this level are logged to the incident audit trail.",
          confirmLabel: "Confirm Change",
          cancelLabel: "Abort",
        };
      case "declare-emergency":
        return {
          ...base,
          requiresTypedConfirm: true,
          typedConfirmText: "EMERGENCY",
          title: "⚠️ Elevated — Declare Emergency",
          description: `Escalating from Elevated to Emergency for ${satelliteId}. This is a significant escalation.`,
          consequenceWarning: "Emergency activation at elevated status triggers a priority response cascade.",
          confirmLabel: "Declare Emergency",
          cancelLabel: "Abort",
        };
      case "escalate-alert":
        return {
          ...base,
          title: "⚠️ Elevated — Escalate Further",
          description: `${satelliteId} is already elevated. Further escalation increases response priority.`,
          consequenceWarning: "Multiple escalations may trigger automated safety protocols.",
          confirmLabel: "Escalate",
          cancelLabel: "Keep Elevated",
        };
      default:
        return {
          ...base,
          requiresTypedConfirm: true,
          typedConfirmText: "CONFIRM",
          title: `⚠️ Elevated — ${action.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
          description: `${satelliteId} is under elevated monitoring. This action requires confirmation.`,
          consequenceWarning: "Actions during elevated status are part of the active incident record.",
          confirmLabel: "Confirm",
          cancelLabel: "Abort",
        };
    }
  }

  // ── Critical level: typed confirmation + acknowledgment required ──
  if (level === "Critical") {
    switch (action) {
      case "declare-emergency":
        return {
          ...base,
          requiresTypedConfirm: true,
          typedConfirmText: "EMERGENCY",
          requireAcknowledgment: true,
          title: "🔴 Critical — Declare Emergency",
          description: `${satelliteId} is in CRITICAL status. Declaring emergency will activate all response teams.`,
          consequenceWarning: "This action cannot be undone. All automated systems will switch to emergency mode. Full crew alert will be triggered.",
          confirmLabel: "DECLARE EMERGENCY",
          cancelLabel: "ABORT",
        };
      case "change-status":
        return {
          ...base,
          requiresTypedConfirm: true,
          typedConfirmText: "PROCEED",
          requireAcknowledgment: true,
          title: "🔴 Critical — Modify Status",
          description: `${satelliteId} is in CRITICAL status. Any status change must be explicitly authorized.`,
          consequenceWarning: "Modifying a critical-status object may affect active collision avoidance protocols.",
          confirmLabel: "Authorize Change",
          cancelLabel: "ABORT",
        };
      default:
        return {
          ...base,
          requiresTypedConfirm: true,
          typedConfirmText: "PROCEED",
          requireAcknowledgment: true,
          title: `🔴 Critical — ${action.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
          description: `${satelliteId} is under critical monitoring. This action requires dual confirmation.`,
          consequenceWarning: "Actions during critical status are permanently recorded in the incident log.",
          confirmLabel: "Authorize",
          cancelLabel: "ABORT",
        };
    }
  }

  // ── Emergency level: maximum confirmation requirements ──
  return {
    ...base,
    requiresTypedConfirm: true,
    typedConfirmText: "CONFIRMED",
    requireAcknowledgment: true,
    title: "🚨 EMERGENCY — Action Required",
    description: `${satelliteId} is in EMERGENCY status. All actions require explicit operator authorization with full acknowledgment.`,
    consequenceWarning: "EMERGENCY-LEVEL ACTIONS ARE IRREVERSIBLE. This action will be recorded in the permanent incident archive and trigger mandatory post-event review.",
    confirmLabel: "AUTHORIZE ACTION",
    cancelLabel: "ABORT",
  };
}

// ─── Provider ────────────────────────────────────────────────────────
const EscalationContext = createContext<EscalationContextValue | null>(null);

export function EscalationProvider({ children }: { children: ReactNode }) {
  const [levels, setLevels] = useState<Record<string, EscalationLevel>>({});
  const [log, setLog] = useState<EscalationLogEntry[]>([]);

  const getLevel = useCallback(
    (id: string): EscalationLevel => levels[id] ?? "Normal",
    [levels]
  );

  const escalate = useCallback((id: string, to: EscalationLevel) => {
    setLevels((prev) => ({ ...prev, [id]: to }));
    setLog((prev) => [
      { id: crypto.randomUUID(), satelliteId: id, action: `escalated → ${to}`, level: to, timestamp: Date.now() },
      ...prev,
    ]);
  }, []);

  const deescalate = useCallback((id: string, to: EscalationLevel) => {
    setLevels((prev) => ({ ...prev, [id]: to }));
    setLog((prev) => [
      { id: crypto.randomUUID(), satelliteId: id, action: `deescalated → ${to}`, level: to, timestamp: Date.now() },
      ...prev,
    ]);
  }, []);

  const requiresConfirmation = useCallback(
    (id: string, action: EscalationAction): boolean => {
      const level = getLevel(id);
      // Normal level: only sensitive actions require confirmation
      if (level === "Normal") {
        return ["change-status", "escalate-alert", "declare-emergency", "send-notification", "subscribe-alerts"].includes(action);
      }
      // Elevated+: everything requires confirmation
      return true;
    },
    [getLevel]
  );

  const getConfirmationMeta = useCallback(
    (id: string, action: EscalationAction): ConfirmationMeta => {
      return buildConfirmationMeta(getLevel(id), action, id);
    },
    [getLevel]
  );

  const addLogEntry = useCallback((entry: Omit<EscalationLogEntry, "timestamp">) => {
    setLog((prev) => [{ ...entry, timestamp: Date.now() }, ...prev]);
  }, []);

  return (
    <EscalationContext.Provider
      value={{ levels, getLevel, escalate, deescalate, requiresConfirmation, getConfirmationMeta, log, addLogEntry }}
    >
      {children}
    </EscalationContext.Provider>
  );
}

export function useEscalation() {
  const ctx = useContext(EscalationContext);
  if (!ctx) throw new Error("useEscalation must be used within <EscalationProvider>");
  return ctx;
}

export { LEVEL_PRIORITY };
