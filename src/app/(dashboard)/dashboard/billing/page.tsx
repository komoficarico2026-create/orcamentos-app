"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Clock,
  ExternalLink,
  ChevronRight,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@/config/plans";
import Button from "@/components/ui/Button";

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      setProfile(data);
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleUpgrade(planId: string) {
    if (loadingCheckout) return;
    setLoadingCheckout(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const plan = planId === 'pro' ? PLANS.PRO : PLANS.PROFISSIONAL;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          email: user.email,
          planName: plan.id
        })
      });

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCheckout(false);
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest animate-pulse">Sincronizando faturamento...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-background text-foreground/80 p-8 font-sans transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-12">
        <header>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <CreditCard size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Billing</h1>
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1">Gestão de assinatura e ecossistema financeiro</p>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Current Plan Card */}
          <div className="md:col-span-2 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/40 border border-border/10 rounded-[3rem] p-10 shadow-2xl shadow-primary/5 backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:scale-110 transition-transform duration-1000">
                <Shield size={200} />
              </div>
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Escopo de Acesso</span>
                  <h2 className="text-5xl font-black text-foreground mt-2 uppercase tracking-tighter leading-none">
                    {profile?.plan_name || "Free"}
                  </h2>
                </div>
                <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md ${
                  profile?.subscription_status === 'active' 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}>
                  {profile?.subscription_status === 'active' ? 'Assinatura Ativa' : 'Período Gratuito'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 relative z-10">
                <div className="p-6 bg-background/40 border border-border/5 rounded-2xl shadow-inner group/item">
                  <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock size={12} className="text-primary" /> Próxima Cobrança
                  </p>
                  <p className="text-lg font-black text-foreground">
                    --/--/----
                  </p>
                </div>
                <div className="p-6 bg-background/40 border border-border/5 rounded-2xl shadow-inner group/item">
                  <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CreditCard size={12} className="text-primary" /> Método de Pagamento
                  </p>
                  <p className="text-lg font-black text-foreground">
                    Stripe / Card
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 relative z-10">
                <button className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20">
                  Gerenciar Faturas
                  <ExternalLink size={14} />
                </button>
                <button className="px-8 py-4 bg-foreground/5 border border-border/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60 hover:bg-foreground/10 transition-all">
                  Portal do Cliente
                </button>
              </div>
            </motion.div>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Orçamentos Premium",
                "PDF Engine v2.0",
                "Gestão de Clientes",
                "Fluxo de Caixa",
                "Produtos Master",
                "Serviços PRO"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-card/20 border border-border/10 rounded-2xl group transition-all hover:bg-card/40">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[10px] font-black text-foreground/60 uppercase tracking-wider">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="space-y-8">
            {profile?.plan_name === 'free' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary rounded-[3rem] p-10 text-primary-foreground shadow-3xl shadow-primary/30 relative overflow-hidden group border border-white/10"
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl backdrop-blur-md group-hover:rotate-12 transition-transform duration-500">
                    <Zap size={32} className="fill-white" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tighter leading-none">Upgrade Master</h3>
                  <p className="text-primary-foreground/70 text-sm font-medium mb-10 leading-relaxed">
                    Desbloqueie o potencial máximo da plataforma OrcaFácil hoje.
                  </p>
                  
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                      <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                      <span>Orçamentos Ilimitados</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                      <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-white/40" />
                      </div>
                      <span>White-Label PDF</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleUpgrade('profissional')}
                    disabled={loadingCheckout}
                    className="w-full py-6 bg-white text-primary rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-95 disabled:opacity-70 shadow-2xl shadow-black/10"
                  >
                    {loadingCheckout ? "Processando..." : "Become Professional"}
                  </button>
                </div>
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
              </motion.div>
            ) : (
              <div className="bg-card/40 border border-border/10 rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl shadow-primary/5">
                <h3 className="text-xl font-black text-foreground mb-4 tracking-tight leading-none">Multipos de Usuários?</h3>
                <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest mb-8 leading-relaxed">
                  Colabore com sua equipe e tenha relatórios de inteligência artificial.
                </p>
                <button 
                  onClick={() => handleUpgrade('pro')}
                  className="w-full py-5 bg-primary/10 text-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-primary/20 hover:bg-primary/20 transition-all shadow-inner"
                >
                  Migrar para o Enterprise
                </button>
              </div>
            )}
            
            <div className="p-8 border border-border/10 rounded-[2.5rem] bg-card/20 flex items-center gap-4 group hover:bg-card/40 transition-colors">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Segurança Bancária</h4>
                  <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Transações criptografadas pelo Stripe</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
