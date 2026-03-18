"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Wallet, 
  ChevronRight, 
  Settings, 
  Clock, 
  Plus,
  BarChart3,
  Building,
  Crown,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type OrcamentoResumo = {
  id: string;
  descricao: string;
  valor_total: number;
  status: string;
  clientes: {
    nome: string;
  } | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  rascunho: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  enviado: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  aprovado: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  recusado: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("30");
  const [metrics, setMetrics] = useState({
    aguardando: 0,
    mudancas: 0,
    aprovados: 0,
    recebidos: 0,
    emAberto: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrcamentos, setRecentOrcamentos] = useState<OrcamentoResumo[]>([]);
  const [userName, setUserName] = useState("Profissional");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", userData.user.id)
          .maybeSingle();
        if (profile?.name) setUserName(profile.name.split(" ")[0]);
      }

      // Logic for Date Filter
      let startDate = new Date();
      if (dateFilter === "7") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateFilter === "30") {
        startDate.setDate(startDate.getDate() - 30);
      } else if (dateFilter === "mes") {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      } else {
        startDate = new Date(2000, 0, 1); // "todos"
      }
      const isoStartDate = startDate.toISOString();
      const dateOnlyStart = isoStartDate.split("T")[0];

      // 1. Orçamentos
      let queryOrc = supabase.from("orcamentos").select("status, valor_total, created_at");
      if (dateFilter !== "todos") {
        queryOrc = queryOrc.gte("created_at", isoStartDate);
      }
      const { data: orcamentosData } = await queryOrc;

      let aguardando = 0;
      let mudancas = 0;
      let aprovados = 0;

      if (orcamentosData) {
        orcamentosData.forEach(o => {
          if (o.status === 'enviado' || o.status === 'rascunho') aguardando++;
          if (o.status === 'recusado') mudancas++;
          if (o.status === 'aprovado') aprovados++;
        });
      }

      // 2. Financeiro
      let queryFin = supabase.from("financeiro").select("valor, tipo, data");
      if (dateFilter !== "todos") {
        queryFin = queryFin.gte("data", dateOnlyStart);
      }
      const { data: financeiroData } = await queryFin;

      let recebidos = 0;
      let emAberto = 0;

      if (financeiroData) {
        financeiroData.forEach((item) => {
          if (item.tipo === "entrada") {
            recebidos += Number(item.valor);
          } else {
            emAberto += Number(item.valor);
          }
        });
      }

      setMetrics({
        aguardando,
        mudancas,
        aprovados,
        recebidos,
        emAberto,
      });

      // Calcular dados do gráfico (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      
      const { data: chartFinData } = await supabase
        .from("financeiro")
        .select("valor, data")
        .eq("tipo", "entrada")
        .gte("data", sixMonthsAgo.toISOString().split("T")[0]);

      if (chartFinData) {
        const monthlyData = new Map();
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
          monthlyData.set(key, 0);
        }

        chartFinData.forEach((item) => {
          const d = new Date(item.data);
          const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
          if (monthlyData.has(key)) {
            monthlyData.set(key, monthlyData.get(key) + Number(item.valor));
          }
        });

        const formattedChartData = Array.from(monthlyData, ([name, total]) => ({ name, total }));
        setChartData(formattedChartData);
      }

      // 3. Últimos Orçamentos
      const { data: orcamentos } = await supabase
        .from("orcamentos")
        .select(`
          id,
          descricao,
          valor_total,
          status,
          created_at,
          clientes ( nome )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (orcamentos) setRecentOrcamentos(orcamentos as unknown as OrcamentoResumo[]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <main className="min-h-screen bg-background font-sans transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section with Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 blur-3xl -z-10 rounded-full" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-card/40 border border-border/10 backdrop-blur-xl shadow-2xl shadow-primary/5">
            <div className="space-y-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2"
              >
                <TrendingUp size={12} /> Painel de Controle
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-none">
                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">{userName}</span>! 👋
              </h1>
              <p className="text-foreground/50 font-medium text-lg">
                Seu negócio está pronto para o próximo nível.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/orcamentos/novo"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Orçamento</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </Link>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border/20 border-t-primary"></div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between -mb-4 gap-4">
              <h2 className="text-lg font-bold text-foreground">Meus resultados</h2>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground/50">Período:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-lg border border-border/10 bg-card/50 px-3 py-1.5 text-sm font-semibold text-foreground/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer shadow-sm transition-colors"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="mes">Este mês</option>
                  <option value="todos">Todo o período</option>
                </select>
              </div>
            </div>
            
            {/* Bento Grid Metrics */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-6 gap-6"
            >
              {/* Card 1: Status Orçamentos (Bento Large) */}
              <motion.div 
                variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                className="md:col-span-4 bg-card/40 rounded-[2.5rem] p-8 border border-border/10 shadow-xl shadow-primary/5 backdrop-blur-xl group hover:border-primary/30 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-6 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground tracking-tight text-xl">Orçamentos</h3>
                      <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Desempenho no período</p>
                    </div>
                  </div>
                  <Link href="/dashboard/orcamentos" className="p-2 rounded-xl bg-background/50 text-foreground/40 hover:text-primary transition-colors">
                    <ChevronRight size={20} />
                  </Link>
                </div>
                
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Aguardando</p>
                    <p className="text-4xl font-black text-foreground tracking-tighter">{metrics.aguardando}</p>
                    <div className="w-full h-1 bg-background/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        className="h-full bg-primary" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Mudanças</p>
                    <p className="text-4xl font-black text-foreground tracking-tighter">{metrics.mudancas}</p>
                    <div className="w-full h-1 bg-background/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "30%" }}
                        className="h-full bg-amber-500" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Aprovados</p>
                    <p className="text-4xl font-black text-primary tracking-tighter">{metrics.aprovados}</p>
                    <div className="w-full h-1 bg-background/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        className="h-full bg-emerald-500" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Recebidos (Bento Small) */}
              <motion.div 
                variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                className="md:col-span-2 bg-gradient-to-br from-primary to-primary/80 rounded-[2.5rem] p-8 text-primary-foreground shadow-xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Recebidos</p>
                  <p className="text-3xl font-black tracking-tighter">
                    R$ {metrics.recebidos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs font-bold opacity-80 italic">Financeiro em dia</p>
                  <ArrowUpRight size={20} className="opacity-60" />
                </div>
              </motion.div>
            </motion.div>

            {/* Gráfico de Faturamento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card/40 rounded-[2.5rem] p-8 border border-border/10 shadow-xl shadow-primary/5 backdrop-blur-xl group hover:border-primary/30 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground tracking-tight text-xl">Receita Recorrente</h3>
                    <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Últimos 6 meses</p>
                  </div>
                </div>
                <div className="text-2xl font-black text-primary">
                  R$ {chartData.reduce((acc, curr) => acc + curr.total, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest text-right mt-1">Acumulado</p>
                </div>
              </div>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--foreground)/0.1)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--foreground)/0.5)', fontSize: 12, fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--foreground)/0.5)', fontSize: 12, fontWeight: 700 }}
                      tickFormatter={(value) => `R$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border)/0.2)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', padding: '12px 20px' }}
                      itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 900, fontSize: '18px' }}
                      labelStyle={{ color: 'hsl(var(--foreground)/0.6)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 'Faturamento']}
                    />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Acesso Rápido e Lista Combinada */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Coluna Esquerda: Acesso Rápido & Pro */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground/40 uppercase tracking-[0.2em] mb-4">Acesso Rápido</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <Link href="/dashboard/financeiro" className="flex items-center p-5 bg-card/40 rounded-3xl border border-border/10 shadow-lg shadow-primary/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group backdrop-blur-xl">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground text-base transition-colors">Relatórios</h4>
                        <p className="text-xs text-foreground/50 font-medium transition-colors">Análise de desempenho</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors" />
                    </Link>

                    <Link href="/dashboard/configuracoes" className="flex items-center p-5 bg-card/40 rounded-3xl border border-border/10 shadow-lg shadow-primary/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group backdrop-blur-xl">
                      <div className="w-12 h-12 rounded-2xl bg-background/50 flex items-center justify-center text-foreground/40 mr-4 group-hover:scale-110 group-hover:-rotate-3 transition-all border border-border/10">
                        <Building className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground text-base transition-colors">Empresa</h4>
                        <p className="text-xs text-foreground/50 font-medium transition-colors">Dados e identidade</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors" />
                    </Link>
                  </div>
                </div>

                <div className="bg-foreground/[0.03] dark:bg-card/40 rounded-[2.5rem] p-8 text-foreground relative overflow-hidden shadow-2xl border border-border/10 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-6 border border-primary/20">
                      <Crown className="w-6 h-6 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                    </div>
                    <h4 className="font-black text-2xl mb-2 tracking-tighter">Seja PRO</h4>
                    <p className="text-foreground/50 text-sm mb-6 leading-relaxed">Assinatura profissional para quem busca escala e autoridade.</p>
                    <button className="w-full bg-primary text-primary-foreground font-black text-xs py-4 rounded-2xl hover:opacity-90 shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest">
                      Assinar Agora
                    </button>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Orçamentos Recentes */}
              <div className="lg:col-span-8 bg-card/40 rounded-[2.5rem] border border-border/10 shadow-xl shadow-primary/5 overflow-hidden backdrop-blur-xl group flex flex-col">
                <div className="px-8 py-7 border-b border-border/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center text-foreground/40 border border-border/10">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-foreground tracking-tight">Recentes</h2>
                      <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">Acompanhamento rápido</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 flex-1">
                  {recentOrcamentos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                      <div className="w-16 h-16 bg-background/50 rounded-2xl flex items-center justify-center mb-6 border border-border/10 shadow-inner">
                        <FileText className="w-8 h-8 text-foreground/20" />
                      </div>
                      <p className="text-foreground/50 font-medium max-w-xs mx-auto text-sm">Pronto para começar? Crie seu primeiro orçamento profissional agora.</p>
                      <Link href="/dashboard/orcamentos/novo" className="mt-4 inline-flex items-center gap-2 text-sm text-primary font-black hover:scale-105 transition-transform uppercase tracking-wider">
                        Começar Agora <Plus size={16} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentOrcamentos.map((orc, index) => (
                        <motion.div
                          key={orc.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (index * 0.1) }}
                        >
                          <Link 
                            href={`/dashboard/orcamentos/${orc.id}/editar`} 
                            className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-[1.8rem] hover:bg-foreground/[0.03] transition-all border border-transparent hover:border-border/10"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-card border border-border/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:border-primary/30 transition-all shadow-sm">
                                <span className="font-black text-primary text-lg">
                                  {orc.clientes?.nome?.charAt(0).toUpperCase() || "C"}
                                </span>
                              </div>
                              <div>
                                <div className="font-extrabold text-foreground group-hover:text-primary transition-colors text-lg leading-tight">
                                  {orc.clientes?.nome || "Cliente sem nome"}
                                </div>
                                <div className="text-xs font-bold text-foreground/40 mt-1 flex items-center gap-2 uppercase tracking-widest">
                                  {new Date(orc.created_at).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short"
                                  })} 
                                  <span className="w-1.5 h-1.5 rounded-full bg-border/20"></span> 
                                  <span className="line-clamp-1 italic normal-case font-medium">{orc.descricao || "Orçamento Padrão"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pl-16 sm:pl-0 gap-3">
                              <div className="font-black text-foreground text-xl tracking-tighter">
                                R$ {Number(orc.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </div>
                              <div className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-xl border-2 transition-all ${statusColors[orc.status || "rascunho"]}`}>
                                {statusLabels[orc.status || "rascunho"]}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}