"use client";

import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null);

// ─── Config ──────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { icon: any; classes: string; iconColor: string; bar: string }> = {
  success: {
    icon: CheckCircle2,
    classes: "bg-[#0f172a]/90 backdrop-blur-xl border border-emerald-500/20",
    iconColor: "text-emerald-400",
    bar: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]",
  },
  error: {
    icon: XCircle,
    classes: "bg-[#0f172a]/90 backdrop-blur-xl border border-red-500/20",
    iconColor: "text-red-400",
    bar: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
  },
  warning: {
    icon: AlertTriangle,
    classes: "bg-[#0f172a]/90 backdrop-blur-xl border border-amber-500/20",
    iconColor: "text-amber-400",
    bar: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
  },
  info: {
    icon: Info,
    classes: "bg-[#0f172a]/90 backdrop-blur-xl border border-blue-500/20",
    iconColor: "text-blue-400",
    bar: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]",
  },
};

// ─── Toast Item ───────────────────────────────────────────────────────────────

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }}
      className={`relative flex items-start gap-4 w-[340px] p-4 pr-10 rounded-2xl border shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden ${config.classes}`}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        style={{ transformOrigin: "left" }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.bar}`}
      />

      <div className={`flex-shrink-0 p-1.5 rounded-xl bg-current/10 bg-opacity-10 ${config.iconColor}`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>

      <p className="text-sm font-semibold text-white leading-snug pt-0.5 flex-1">
        {toast.message}
      </p>

      <button
        onClick={() => onClose(toast.id)}
        className="absolute top-3 right-3 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
  }, []);

  const toast = {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    warning: (msg: string) => addToast("warning", msg),
    info: (msg: string) => addToast("info", msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onClose={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx.toast;
}
