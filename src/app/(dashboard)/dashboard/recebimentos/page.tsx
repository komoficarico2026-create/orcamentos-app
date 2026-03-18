"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  CircleDollarSign, 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown,
  FileText,
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type OrcamentoRecebimento = {
  id: string;
  cliente_id: string;
  valor_total: number;
  status: string;
  created_at: string;
  clientes: {
    nome: string;
  } | null;
};

export default function RecebimentosPage() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoRecebimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("30");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    let startDate = new Date();
    let endDate = new Date();

    if (periodo === "7") startDate.setDate(startDate.getDate() - 7);
    else if (periodo === "14") startDate.setDate(startDate.getDate() - 14);
    else if (periodo === "mes") startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    else if (periodo === "todos") startDate = new Date(2000, 0, 1);
    else if (periodo === "custom") {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      // Validar 1 ano
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Limita silenciosamente a 1 ano para evitar sobrecarga
      if (diffDays > 365) {
        setLoading(false);
        return;
      }
    }
    else startDate.setDate(startDate.getDate() - 30); // fallback

    const query = supabase
      .from("orcamentos")
      .select(`
        id,
        cliente_id,
        valor_total,
        status,
        created_at,
        clientes ( nome )
      `)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setOrcamentos(data as unknown as OrcamentoRecebimento[]);
    }
    setLoading(false);
  }, [periodo, customStartDate, customEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = orcamentos.filter(o => 
    o.clientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPago = orcamentos
    .filter(o => o.status === "concluido")
    .reduce((acc, o) => acc + Number(o.valor_total), 0);

  const totalParcial = orcamentos
    .filter(o => o.status === "em_execucao") // Supondo execução como parcial para fins de UI
    .reduce((acc, o) => acc + Number(o.valor_total), 0);

  const totalNaoPago = orcamentos
    .filter(o => ["enviado", "aprovado"].includes(o.status))
    .reduce((acc, o) => acc + Number(o.valor_total), 0);

  return (
    <main className="min-h-screen bg-background font-sans transition-colors duration-500 pb-20 overflow-x-hidden">
      
      {/* Premium Glass Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 px-8 py-5 bg-card/40 border-b border-border/10 backdrop-blur-xl shadow-2xl shadow-primary/5 transition-all"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-none">Recebimentos</h1>
              <p className="hidden md:block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Gestão de entradas e faturamento</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none group-focus-within:text-primary transition-colors" size={16} />
               <select 
                 value={periodo}
                 onChange={(e) => setPeriodo(e.target.value)}
                 className="w-full appearance-none pl-12 pr-10 py-3 bg-background/50 border border-border/10 rounded-2xl text-xs font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all cursor-pointer"
               >
                 <option value="7">Últimos 7 dias</option>
                 <option value="14">Últimos 14 dias</option>
                 <option value="mes">Este Mês</option>
                 <option value="custom">Data Específica</option>
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" size={14} />
            </div>

            <div className="relative group md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Buscar por cliente ou #"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background/50 border border-border/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all placeholder:text-foreground/20"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Custom Date Filters */}
        {periodo === "custom" && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex flex-wrap items-center gap-6 mb-8 px-6 py-4 bg-card/40 rounded-[2rem] border border-border/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Início</span>
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-background/50 border border-border/10 rounded-xl px-4 py-2 text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Fim</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-background/50 border border-border/10 rounded-xl px-4 py-2 text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              />
            </div>
          </motion.div>
        )}

        {/* Stats Cards - Bento Grid */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { label: "Faturamento Realizado", val: totalPago, color: "emerald", icon: CircleDollarSign },
            { label: "Pendentes / Em Execução", val: totalParcial, color: "amber", icon: ArrowRight },
            { label: "Aguardando / Enviados", val: totalNaoPago, color: "blue", icon: Calendar }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
              className="bg-card/40 rounded-[2.5rem] p-8 border border-border/10 shadow-2xl shadow-primary/5 backdrop-blur-xl relative overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:w-3 transition-all duration-500`} />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className={`p-2.5 rounded-2xl bg-primary/10 text-primary`}>
                  <stat.icon size={16} />
                </div>
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] leading-none">{stat.label}</span>
              </div>
              <p className="text-4xl font-black text-foreground tracking-tight relative z-10 group-hover:translate-x-1 transition-transform">
                R$ {stat.val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* List Content Area */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-card/40 border border-border/10 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden backdrop-blur-xl"
        >
          {/* Header Bar */}
          <div className="bg-background/50 px-10 py-6 border-b border-border/10">
            <div className="grid grid-cols-12 gap-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
              <span className="col-span-2">Número</span>
              <span className="col-span-4">Cliente</span>
              <span className="col-span-2 text-right">Valor</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-2 text-right">Ações</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest animate-pulse">Sincronizando faturas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-background/50 rounded-3xl flex items-center justify-center mb-6 text-foreground/10">
                <FileText size={40} />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 underline decoration-primary/30 underline-offset-8">Nenhum registro</h3>
              <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest max-w-xs leading-relaxed">
                Nenhum orçamento encontrado para o período e critérios selecionados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {filtered.map((o, idx) => (
                <motion.div 
                  key={o.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (idx * 0.03) }}
                  className="px-10 py-6 grid grid-cols-12 gap-6 items-center hover:bg-background/80 transition-all duration-300 group"
                >
                  <span className="col-span-2 font-black text-foreground/40 text-[10px] uppercase bg-background/50 px-3 py-1.5 rounded-xl border border-border/10 w-fit group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    #{o.id.slice(0, 8)}
                  </span>
                  
                  <div className="col-span-4">
                    <p className="font-black text-foreground group-hover:text-primary transition-colors truncate">
                      {o.clientes?.nome || "Cliente não informado"}
                    </p>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">
                      {new Date(o.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <span className="col-span-2 text-right font-black text-foreground text-lg tracking-tighter">
                    R$ {Number(o.valor_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>

                  <div className="col-span-2 flex justify-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      o.status === "concluido" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5" :
                      o.status === "aprovado" ? "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm shadow-blue-500/5" :
                      "bg-foreground/5 text-foreground/40 border-border/10"
                    }`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-3">
                    <Link 
                      href={`/dashboard/orcamentos/${o.id}/editar`} 
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-background text-foreground/40 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                      title="Ver Detalhes"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Page Info */}
        {!loading && filtered.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex items-center justify-end px-10 text-[10px] font-black text-foreground/30 uppercase tracking-widest"
          >
            <span>Exibindo {filtered.length} faturamentos neste período</span>
          </motion.div>
        )}
      </div>
    </main>
  );
}
