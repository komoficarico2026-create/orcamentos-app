"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Zap, 
  Crown, 
  Leaf,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const themes = [
  { id: "light", name: "Claro", icon: Sun, color: "bg-slate-100", border: "border-slate-200" },
  { id: "dark", name: "Escuro", icon: Moon, color: "bg-[#020617]", border: "border-violet-500/50" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 shadow-lg border
          ${isOpen ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 backdrop-blur-md border-white/10 text-slate-400 hover:text-primary hover:border-primary/30"}
        `}
        title="Personalizar Tema"
      >
        <Sparkles className={`h-5 w-5 ${isOpen ? "animate-pulse" : ""}`} />
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="fixed inset-0 z-[9999]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-20 left-4 w-56 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-1"
            >
              <p className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">
                Personalizar Experiência
              </p>
              <div className="max-h-[300px] overflow-y-auto pr-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group
                      ${theme === t.id ? "bg-primary/20 text-white border border-primary/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${t.color} border ${t.border} flex items-center justify-center shadow-inner`}>
                        <t.icon size={14} className={theme === t.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
                      </div>
                      <span className="text-xs font-bold leading-none">{t.name}</span>
                    </div>
                    {theme === t.id && <Check size={14} className="text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
