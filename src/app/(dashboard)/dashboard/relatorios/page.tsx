"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Archive,
  AlertCircle,
  CircleDollarSign,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type OrcamentoStats = {
  status: string;
  count: number;
  valor: number;
};

type MonthlyData = {
  mes: string;
  total: number;
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  rascunho:    { label: "Rascunho",            icon: FileText,    color: "text-foreground/60",   bg: "bg-card/40",   border: "border-border/10" },
  enviado:     { label: "Aguardando Aprov.",   icon: Clock,       color: "text-amber-500",       bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  aprovado:    { label: "Aprovado",            icon: CheckCircle2,color: "text-emerald-500",     bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  recusado:    { label: "Recusado",            icon: XCircle,     color: "text-red-500",         bg: "bg-red-500/10",     border: "border-red-500/20" },
  em_execucao: { label: "Em Execução",         icon: Zap,         color: "text-blue-500",        bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  concluido:   { label: "Concluído",           icon: CheckCircle2,color: "text-emerald-600",     bg: "bg-emerald-600/10", border: "border-emerald-600/20" },
  cancelado:   { label: "Cancelado",           icon: XCircle,     color: "text-rose-500",        bg: "bg-rose-500/10",    border: "border-rose-500/20" },
  arquivado:   { label: "Arquivado",           icon: Archive,     color: "text-foreground/40",   bg: "bg-card/20",   border: "border-border/5" },
};

const PERIODOS = [
  { label: "Últimos 30 dias",  value: "30"   },
  { label: "Últimos 90 dias",  value: "90"   },
  { label: "Este ano",         value: "ano"  },
  { label: "Todos",            value: "todos"},
];

import { motion, AnimatePresence } from "framer-motion";

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("30");
  const [showPeriodo, setShowPeriodo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrcamentoStats[]>([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [taxaAprovacao, setTaxaAprovacao] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);

    let startDate = new Date();
    if (periodo === "30") startDate.setDate(startDate.getDate() - 30);
    else if (periodo === "90") startDate.setDate(startDate.getDate() - 90);
    else if (periodo === "ano") startDate = new Date(startDate.getFullYear(), 0, 1);
    else startDate = new Date(2000, 0, 1);

    const isoStart = startDate.toISOString();
    const dateStart = isoStart.split("T")[0];

    // Orçamentos
    const { data: orcData } = await supabase
      .from("orcamentos")
      .select("id, status, valor_total")
      .gte("created_at", isoStart);

    if (orcData) {
      const grouped: Record<string, { count: number; valor: number }> = {};
      let totalV = 0;
      let aprovCount = 0;
      let totalEnvAprov = 0;

      orcData.forEach((o) => {
        const s = o.status || "rascunho";
        if (!grouped[s]) grouped[s] = { count: 0, valor: 0 };
        grouped[s].count++;
        grouped[s].valor += Number(o.valor_total || 0);
        totalV += Number(o.valor_total || 0);
        if (s === "aprovado" || s === "enviado") totalEnvAprov++;
        if (s === "aprovado") aprovCount++;
      });

      setStats(Object.entries(grouped).map(([k, v]) => ({ status: k, count: v.count, valor: v.valor })));
      setTotalGeral(totalV);
      setTaxaAprovacao(totalEnvAprov > 0 ? Math.round((aprovCount / totalEnvAprov) * 100) : 0);
      setTicketMedio(aprovCount > 0 ? (grouped["aprovado"]?.valor || 0) / aprovCount : 0);
    }

    // Financeiro
    const { data: finData } = await supabase
      .from("financeiro")
      .select("valor, tipo")
      .gte("data", dateStart);

    if (finData) {
      let r = 0;
      let d = 0;
      finData.forEach((f) => {
        if (f.tipo === "entrada") r += Number(f.valor);
        else d += Number(f.valor);
      });
      setReceitas(r);
      setDespesas(d);
    }

    setLoading(false);
  }, [periodo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const periodoLabel = PERIODOS.find((p) => p.value === periodo)?.label || "Período";
  const totalOrcamentos = stats.reduce((a, s) => a + s.count, 0);
  const saldo = receitas - despesas;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-background text-foreground/80 p-8 font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* Premium Glass Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Intelligence</h1>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1">Análise de performance e resultados em tempo real</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button
              onClick={() => setShowPeriodo(!showPeriodo)}
              className="flex items-center gap-3 px-6 py-3 bg-card/40 border border-border/10 backdrop-blur-md rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60 hover:text-primary transition-all shadow-xl shadow-primary/5 active:scale-95"
            >
              <Calendar size={16} className="text-primary" />
              {periodoLabel}
              <ChevronDown size={14} className={`transition-transform duration-300 ${showPeriodo ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {showPeriodo && (
                <>
                  <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     exit={{ opacity: 0 }}
                     onClick={() => setShowPeriodo(false)}
                     className="fixed inset-0 z-[60]" 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-card border border-border/10 rounded-[2rem] shadow-2xl z-[70] overflow-hidden p-2 backdrop-blur-xl"
                  >
                    {PERIODOS.map((p) => (
                      <button 
                        key={p.value} 
                        onClick={() => { setPeriodo(p.value); setShowPeriodo(false); }}
                        className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${periodo === p.value ? "bg-primary text-primary-foreground" : "text-foreground/40 hover:bg-background/50 hover:text-foreground"}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button className="w-12 h-12 flex items-center justify-center bg-card/40 border border-border/10 text-foreground/40 hover:text-primary transition-all rounded-2xl shadow-xl shadow-primary/5">
            <Download size={20} />
          </button>
        </div>
      </motion.div>

      <div className="max-w-[1500px] mx-auto space-y-8">
        
        {/* KPI Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { label: "Total Orçado", value: `R$ ${totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Taxa de Conversão", value: `${taxaAprovacao}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "Ticket Médio", value: `R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: CircleDollarSign, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
            { label: "Volume Total", value: totalOrcamentos.toString(), icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          ].map((kpi, idx) => (
            <motion.div 
              key={idx}
              variants={item}
              className="bg-card/40 rounded-[2.5rem] p-8 border border-border/10 shadow-2xl shadow-primary/5 backdrop-blur-xl group hover:border-primary/20 transition-all flex flex-col justify-between"
            >
              <div className={`w-14 h-14 ${kpi.bg} rounded-[1.5rem] flex items-center justify-center ${kpi.color} mb-6 border ${kpi.border} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                <kpi.icon size={24} />
              </div>
              <div>
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.15em] mb-1">{kpi.label}</div>
                <div className="text-3xl font-black text-foreground tracking-tighter leading-none">
                  {loading ? <div className="h-8 bg-background/50 animate-pulse rounded-xl w-32" /> : kpi.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Budget Status Bento */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="lg:col-span-2 bg-card/40 rounded-[3rem] p-10 border border-border/10 backdrop-blur-xl flex flex-col shadow-2xl shadow-primary/5"
           >
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Status do Funil</h2>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-1">Distribuição de orçamentos por etapa estratégica</p>
                 </div>
                 <div className="w-12 h-12 bg-background/50 border border-border/10 rounded-2xl flex items-center justify-center text-foreground/20">
                    <TrendingUp size={20} />
                 </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                   {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-24 bg-background/30 animate-pulse border border-border/5 rounded-[2rem]" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const stat = stats.find((s) => s.status === key);
                    const Icon = cfg.icon;
                    return (
                      <div key={key} className={`${cfg.bg} rounded-[2rem] border ${cfg.border} p-6 group hover:translate-y-[-4px] transition-all`}>
                        <div className={`p-2.5 rounded-xl bg-background/50 w-fit mb-4 ${cfg.color} shadow-sm border border-border/5`}>
                          <Icon size={18} />
                        </div>
                        <div className="text-[9px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-2">{cfg.label}</div>
                        <div className="text-lg font-black text-foreground tracking-tighter mb-1">
                          R$ {(stat?.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                        </div>
                        <div className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{stat?.count || 0} contratos</div>
                      </div>
                    );
                  })}
                </div>
              )}
           </motion.div>

           {/* Conversion Trends Bento */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="bg-primary rounded-[3.5rem] p-10 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group"
           >
              <div className="relative z-10 h-full flex flex-col">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[1.5rem] border border-white/20 flex items-center justify-center mb-10 self-end shadow-xl">
                    <Zap size={32} />
                 </div>
                 
                 <div className="mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground/70 mb-2">Efficiency Score</p>
                    <h2 className="text-7xl font-black tracking-tighter mb-8 leading-none">{taxaAprovacao}%</h2>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Conversão de propostas</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Optimized ✨</span>
                       </div>
                       <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10 p-1">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${taxaAprovacao}%` }}
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                          />
                       </div>
                       <p className="text-[10px] font-medium leading-relaxed opacity-70 italic mt-6">
                         Sua taxa de conversão atingiu o nível elite. Mantenha o padrão de excelência nas próximas propostas.
                       </p>
                    </div>
                 </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
           </motion.div>
        </div>

        {/* Financial Health Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/40 rounded-[3rem] border border-border/10 shadow-2xl shadow-primary/5 backdrop-blur-xl overflow-hidden"
        >
           <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/10">
              <div className="p-10 flex flex-col justify-between group hover:bg-emerald-500/5 transition-colors">
                 <div>
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
                       <TrendingUp size={28} />
                    </div>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-2 px-1">Receita Confirmada</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter">
                      {loading ? "R$ —" : `R$ ${receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    </h3>
                 </div>
                 <div className="mt-8 pt-6 border-t border-border/5">
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Fluxo projetado para {periodoLabel}</p>
                 </div>
              </div>

              <div className="p-10 flex flex-col justify-between group hover:bg-rose-500/5 transition-colors">
                 <div>
                    <div className="w-14 h-14 bg-rose-500/10 rounded-2xl border border-rose-500/20 flex items-center justify-center text-rose-500 mb-8 group-hover:scale-110 transition-transform">
                       <CircleDollarSign size={28} />
                    </div>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-2 px-1">Custos & Despesas</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter">
                      {loading ? "R$ —" : `R$ ${despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    </h3>
                 </div>
                 <div className="mt-8 pt-6 border-t border-border/5">
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Total de custos operacionais registrados</p>
                 </div>
              </div>

              <div className={`p-10 flex flex-col justify-between group ${saldo >= 0 ? "hover:bg-primary/5" : "hover:bg-rose-500/5"} transition-colors`}>
                 <div>
                    <div className={`w-14 h-14 ${saldo >= 0 ? "bg-primary/10 text-primary border-primary/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"} border rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                       <BarChart3 size={28} />
                    </div>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-2 px-1">Lucro Líquido</p>
                    <h3 className={`text-5xl font-black tracking-tighter ${saldo >= 0 ? "text-foreground" : "text-rose-500"}`}>
                      {loading ? "R$ —" : `R$ ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    </h3>
                 </div>
                 <div className="mt-8 pt-6 border-t border-border/5 flex items-center justify-between">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${saldo >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                       {saldo >= 0 ? "+" : ""}
                       {((saldo / (receitas || 1)) * 100).toFixed(1)}% Margem
                    </div>
                    {saldo > 0 && <TrendingUp size={16} className="text-emerald-500" />}
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </main>
  );
}
