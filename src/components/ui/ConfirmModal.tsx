"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: "text-red-400 bg-red-500/10 border-red-500/20",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  const buttonStyles = {
    danger: "bg-red-600 hover:bg-red-500 shadow-[0_0_15px_-3px_rgba(220,38,38,0.4)]",
    warning: "bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_-3px_rgba(217,119,6,0.4)]",
    info: "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-3xl mb-6 border ${variantStyles[variant]}`}>
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white mb-3 tracking-tight">
              {title}
            </h3>
            
            <p className="text-sm font-medium text-white/60 mb-8 leading-relaxed px-2">
              {description}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-white/[0.03] text-white/50 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/[0.08] hover:text-white transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${buttonStyles[variant]}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
