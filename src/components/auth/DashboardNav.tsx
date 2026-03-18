"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  CircleDollarSign,
  Minus,
  Users,
  Wrench,
  Package,
  BarChart3,
  Settings,
  LifeBuoy,
  ChevronRight,
  User,
  Zap,
  ChevronLeft,
  Home,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "../ThemeToggle";
import { PLANS } from "@/config/plans";
import { motion, AnimatePresence } from "framer-motion";

const navigationGroups = [
  {
    title: "Navegação",
    items: [
      { name: "Tela Inicial", href: "/dashboard", icon: Home },
    ]
  },
  {
    title: "Comece por aqui",
    items: [
      { name: "Orçamentos", href: "/dashboard/orcamentos", icon: FileText },
      { name: "Recebimentos", href: "/dashboard/recebimentos", icon: CircleDollarSign },
      { name: "Despesas", href: "/dashboard/despesas", icon: Minus },
    ]
  },
  {
    title: "Catálogo e Cadastros",
    items: [
      { name: "Clientes", href: "/dashboard/clientes", icon: Users },
      { name: "Serviços", href: "/dashboard/servicos", icon: Wrench },
      { name: "Produtos, peças e materiais", href: "/dashboard/produtos", icon: Package },
    ]
  },
  {
    title: "Geral",
    items: [
      { name: "Relatórios e resultados", href: "/dashboard/relatorios", icon: BarChart3 },
      { name: "Faturamento", href: "/dashboard/billing", icon: CreditCard },
      { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
    ]
  }
];

export default function DashboardNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ name: string; company_name: string; plan_name: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || "");
      const { data } = await supabase
        .from("profiles")
        .select("name, company_name, plan_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setProfile(data as any);
    }
    loadProfile();
  }, []);

  const companyName = profile?.company_name || profile?.name || "Minha Empresa";
  const userName = profile?.name || "";
  const companyInitial = companyName.charAt(0).toUpperCase();

  async function handleUpgrade() {
    if (loadingCheckout) return;
    setLoadingCheckout(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: PLANS.PROFISSIONAL.priceId,
          userId: user.id,
          email: user.email,
          planName: PLANS.PROFISSIONAL.id
        })
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err: any) {
      console.error("Erro ao iniciar checkout:", err.message);
      alert("Erro ao iniciar o checkout. Tente novamente.");
    } finally {
      setLoadingCheckout(false);
    }
  }

  return (
    <>
      {/* 🟢 DESKTOP SIDEBAR */}
      <div className={`
        hidden md:flex relative h-screen bg-background/40 backdrop-blur-2xl border-r border-border/10 transition-all duration-300 flex-col z-[40]
        ${isCollapsed ? "w-24" : "w-72"}
      `}>
        {/* Brand & Profile Section */}
        <div className="p-4 space-y-4">
          {/* Logo */}
          <div className="flex items-center justify-between px-2 h-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-black text-2xl tracking-tighter">S</span>
              </div>
              {!isCollapsed && <span className="font-black text-xl tracking-tighter text-foreground">SERVIX</span>}
            </div>
            {!isCollapsed && <ThemeToggle />}
          </div>

          {isCollapsed && (
            <div className="flex justify-center pb-2">
              <ThemeToggle />
            </div>
          )}

          {!isCollapsed && (
            <>
              {/* User Profile Card */}
              <div className="bg-foreground/5 rounded-2xl p-3 border border-border/10 shadow-sm transition-all hover:bg-foreground/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-base uppercase">
                    {companyInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">Dashboard</p>
                    <p className="text-sm font-bold text-foreground truncate">{companyName}</p>
                  </div>
                </div>
              </div>

              {/* Status Online Card */}
              <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background/50 border border-border/10 flex items-center justify-center text-foreground/50 overflow-hidden relative">
                    <User size={18} />
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Online</span>
                    </div>
                    <p className="text-xs font-medium text-foreground/60 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Pro Banner */}
              {profile?.plan_name === "free" && (
                <button 
                  onClick={handleUpgrade}
                  disabled={loadingCheckout}
                  className="w-full bg-primary rounded-2xl p-4 text-primary-foreground relative overflow-hidden group text-left transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 shadow-lg shadow-primary/20"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform">
                    <Zap size={40} className="fill-current" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-black/20 rounded-lg flex items-center justify-center">
                      <Zap size={16} className={`text-current fill-current ${loadingCheckout ? "animate-pulse" : ""}`} />
                    </div>
                    <span className="font-black text-sm tracking-tight">Upgrade PRO</span>
                  </div>
                  <p className="text-[10px] font-bold opacity-80 leading-tight">Desbloqueie todos os recursos agora.</p>
                </button>
              )}

              {profile?.plan_name !== "free" && (
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-4 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                    <ShieldCheck size={40} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="font-bold text-sm tracking-tight uppercase">Plano {profile?.plan_name}</span>
                  </div>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Acesso Ilimitado Ativo</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="px-4 mb-4">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              flex items-center gap-3 w-full px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
              ${isCollapsed ? "justify-center" : "justify-center"}
            `}
          >
            <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
            {!isCollapsed && <span>Recolher menu</span>}
          </button>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 scrollbar-hide">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-3">{group.title}</p>}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        group relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] transition-all duration-200
                        ${isActive 
                          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                          : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
                        }
                      `}
                    >
                      <item.icon 
                        size={20}
                        className={`flex-shrink-0 transition-colors ${isActive ? "text-primary-foreground" : "text-foreground/40 group-hover:text-primary"}`} 
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Support Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            {!isCollapsed && <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-3">Outras opções</p>}
            <Link
              href="/dashboard/suporte"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 font-bold text-[13px] transition-all group"
            >
              <div className="flex items-center gap-3">
                <LifeBuoy size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500" />
                {!isCollapsed && <span>Suporte</span>}
              </div>
              {!isCollapsed && <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />}
            </Link>
          </div>
        </div>

        {/* Bottom Profile Area (Optional Logout) */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
            <LogoutButton />
          </div>
        )}
      </div>

      {/* 🟢 MOBILE TOPBAR */}
      <div className="flex md:hidden items-center justify-between px-6 py-4 border-b border-border/10 bg-background/80 backdrop-blur-xl sticky top-0 z-[40]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-xl tracking-tighter">S</span>
          </div>
          <span className="font-black text-lg tracking-tighter text-foreground">SERVIX</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setMobileOpen(true)}
            className="w-11 h-11 rounded-xl bg-card border border-border/10 flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* 🟢 MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[100] flex md:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            {/* Sliding Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-[300px] max-w-[85vw] h-full bg-card border-r border-border/10 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border/10 flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-primary-foreground font-black text-xl tracking-tighter">S</span>
                  </div>
                  <span className="font-black text-lg tracking-tighter text-foreground">SERVIX</span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-xl bg-background border border-border/10 flex items-center justify-center text-foreground/50 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Profile Card */}
              <div className="p-6 pb-2">
                 <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20">
                      {companyInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{companyName}</p>
                      <p className="text-xs font-medium text-foreground/50 truncate">{userEmail}</p>
                    </div>
                 </div>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide">
                {navigationGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="px-3 text-[10px] font-black text-foreground/40 uppercase tracking-[0.1em] mb-4">{group.title}</p>
                    <div className="space-y-2.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)} // Close drawer on click!
                            className={`
                              group relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200
                              ${isActive 
                                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                              }
                            `}
                          >
                            <item.icon 
                              size={20}
                              className={`flex-shrink-0 transition-colors ${isActive ? "text-primary-foreground" : "text-foreground/40 group-hover:text-primary"}`} 
                            />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Pro Banner in Mobile Drawer */}
                {profile?.plan_name === "free" && (
                  <button 
                    onClick={handleUpgrade}
                    className="w-full bg-primary rounded-2xl p-4 text-primary-foreground relative overflow-hidden text-left shadow-lg mt-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="fill-current" />
                      <span className="font-black text-sm">Upgrade PRO</span>
                    </div>
                    <p className="text-[10px] font-bold opacity-80">Desbloqueie todos os recursos.</p>
                  </button>
                )}
              </div>
              
              <div className="p-6 border-t border-border/10 bg-background/30">
                 <LogoutButton />
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
