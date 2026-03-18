"use client";

import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown,
  X,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Trash2,
  FileText,
  Pencil
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import FinanceiroForm, { FinanceiroItem } from "@/components/forms/FinanceiroForm";

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<FinanceiroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("30");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState<FinanceiroItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const toast = useToast();

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
      if (diffDays > 365) {
        toast.error("O período máximo é de 1 ano.");
        setLoading(false);
        return;
      }
    }
    else startDate.setDate(startDate.getDate() - 30); // default

    const query = supabase
      .from("financeiro")
      .select("*")
      .eq("tipo", "despesa")
      .gte("data", startDate.toISOString().split('T')[0])
      .lte("data", endDate.toISOString().split('T')[0])
      .order("data", { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setDespesas(data as FinanceiroItem[]);
    }
    setLoading(false);
  }, [periodo, customStartDate, customEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleDelete(id: string) {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setConfirmOpen(false);
    const { error } = await supabase.from("financeiro").delete().eq("id", deleteTargetId);
    if (!error) {
      setDespesas(prev => prev.filter(d => d.id !== deleteTargetId));
      toast.success("Despesa excluída com sucesso!");
    } else {
      toast.error("Erro ao excluir despesa.");
    }
    setDeleteTargetId(null);
  }

  const filtered = despesas.filter(d => 
    d.descricao?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPago = despesas.reduce((acc, d) => acc + Number(d.valor), 0);
  const totalPeriodo = totalPago;

  return (
    <main className="min-h-screen bg-background transition-colors duration-500 pb-20 overflow-x-hidden font-sans">
      
      {/* Premium Glass Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 px-8 py-5 bg-card/40 border-b border-border/10 backdrop-blur-xl shadow-2xl shadow-primary/5 transition-all"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard size={20} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-none">Despesas</h1>
              <p className="hidden md:block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Gestão de gastos e saídas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => { setItemParaEditar(null); setShowForm(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap"
            >
              <Plus size={16} />
              Lançar despesa
            </button>

            <div className="relative group flex-1 md:w-48">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none group-focus-within:text-primary transition-colors" size={14} />
               <select 
                 value={periodo}
                 onChange={(e) => setPeriodo(e.target.value)}
                 className="w-full appearance-none pl-12 pr-10 py-3 bg-background/50 border border-border/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all cursor-pointer"
               >
                 <option value="7">7 dias</option>
                 <option value="14">14 dias</option>
                 <option value="mes">Mês</option>
                 <option value="custom">Custom</option>
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" size={12} />
            </div>

            <div className="relative group md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Filtrar lançamentos..."
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
            className="flex flex-wrap items-center gap-6 mb-8 px-8 py-5 bg-card/40 rounded-[2.5rem] border border-border/10 backdrop-blur-xl shadow-xl shadow-primary/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Início</span>
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-background/50 border border-border/10 rounded-xl px-4 py-2 text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Fim</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-background/50 border border-border/10 rounded-xl px-4 py-2 text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </motion.div>
        )}

        {/* Stats Bento Grid */}
        <motion.div 
           initial="hidden"
           animate="visible"
           variants={{
             hidden: { opacity: 0 },
             visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
           }}
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
            className="col-span-1 lg:col-span-2 bg-card/40 rounded-[2.5rem] p-8 border border-border/10 shadow-2xl shadow-primary/5 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:w-3 transition-all duration-500" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] leading-none">Total Desembolsado</span>
                <p className="text-[10px] text-foreground/40 font-bold mt-1">Soma de todos os custos no período</p>
              </div>
            </div>
            <p className="text-5xl font-black text-foreground tracking-tighter relative z-10 group-hover:translate-x-1 transition-transform">
              R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
            className="bg-card/40 rounded-[2.5rem] p-8 border border-border/10 shadow-2xl shadow-primary/5 backdrop-blur-xl group"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] leading-none">Atividades</span>
            </div>
            <p className="text-4xl font-black text-foreground tracking-tight">
              {filtered.length}
            </p>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-2 px-3 py-1 bg-background/50 rounded-lg w-fit border border-border/10">Registros</p>
          </motion.div>
        </motion.div>

        {/* List Content */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-card/40 border border-border/10 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden backdrop-blur-xl"
        >
          {/* List Header */}
          <div className="bg-background/50 px-10 py-6 border-b border-border/10">
            <div className="grid grid-cols-12 gap-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
              <span className="col-span-5">Descrição do Gasto</span>
              <span className="col-span-2 text-right">Valor</span>
              <span className="col-span-3 text-center">Data do Lançamento</span>
              <span className="col-span-2 text-right">Ações</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest animate-pulse">Auditando despesas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-background/50 rounded-3xl flex items-center justify-center mb-6 text-foreground/10">
                <CreditCard size={40} />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 underline decoration-primary/30 underline-offset-8">Caixa vazio</h3>
              <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest max-w-xs leading-relaxed">
                Nenhuma despesa registrada para o período. Comece lançando seus gastos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              <AnimatePresence>
                {filtered.map((d, idx) => (
                  <motion.div 
                    key={d.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.1 + (idx * 0.03) }}
                    className="px-10 py-7 grid grid-cols-12 gap-6 items-center hover:bg-background/80 transition-all duration-300 group"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors shadow-sm">
                        <CreditCard size={18} />
                      </div>
                      <p className="font-black text-foreground group-hover:text-primary transition-colors truncate">
                        {d.descricao || "Sem descrição"}
                      </p>
                    </div>

                    <span className="col-span-2 text-right font-black text-foreground text-lg tracking-tighter">
                      R$ {Number(d.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>

                    <span className="col-span-3 text-center text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                      {new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>

                    <div className="col-span-2 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => { setItemParaEditar(d as any); setShowForm(true); }}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-background text-foreground/40 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm border border-border/10"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-background text-foreground/40 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm border border-border/10"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Premium Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card w-full max-w-2xl rounded-[3rem] shadow-2xl relative border border-border/10 overflow-hidden z-10"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/40" />
              
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <CreditCard size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tight">
                        {itemParaEditar ? "Editar Lançamento" : "Nova Despesa"}
                      </h2>
                      <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1">Preencha os detalhes financeiros</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-foreground/40 hover:bg-primary hover:text-primary-foreground transition-all active:scale-90 shadow-sm border border-border/10"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-background/30 p-8 rounded-[2.5rem] border border-border/10">
                  <FinanceiroForm 
                    onCreated={() => { fetchData(); setShowForm(false); }}
                    itemParaEditar={itemParaEditar as any}
                    onCancelEdit={() => setShowForm(false)}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Excluir Despesa"
        description="Tem certeza que deseja excluir este lançamento de despesa? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
        variant="danger"
      />
    </main>
  );
}
