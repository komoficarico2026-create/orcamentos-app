"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Settings,
  Star,
  Hammer,
  Archive,
  Ban,
  Pencil,
  FileDown,
  Trash2,
  Send,
  Filter,
  Home,
  ArrowUpRight
} from "lucide-react";
import { syncOrcamentoToFinanceiro } from "@/lib/financeiro-sync";
import { motion, AnimatePresence } from "framer-motion";

type OrcamentoStatus = "rascunho" | "enviado" | "mudancas" | "aprovado" | "execucao" | "concluido" | "cancelado" | "arquivado" | "recusado";

type Orcamento = {
  id: string;
  descricao: string;
  valor_total: number;
  created_at: string;
  clientes: {
    nome: string;
    telefone: string | null;
  } | null;
  status: OrcamentoStatus;
};

// Mapeamento visual das 8 categorias da imagem + 'recusado' (legado ou convertido para 'mudancas'/'cancelado')
const statusConfig: Record<string, { label: string; color: string; icon: any; iconColor: string }> = {
  rascunho: { label: "Rascunho", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: FileText, iconColor: "text-slate-500 dark:text-slate-400" },
  enviado: { label: "Aguardando aprovação", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Clock, iconColor: "text-blue-500 dark:text-blue-400" },
  mudancas: { label: "Sol. de mudanças", color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: Settings, iconColor: "text-amber-500 dark:text-amber-400" },
  aprovado: { label: "Aprovado", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle2, iconColor: "text-emerald-500 dark:text-emerald-400" },
  execucao: { label: "Em execução", color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", icon: Hammer, iconColor: "text-indigo-500 dark:text-indigo-400" },
  concluido: { label: "Concluído", color: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300", icon: CheckCircle2, iconColor: "text-teal-500 dark:text-teal-400" },
  cancelado: { label: "Cancelado", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: Ban, iconColor: "text-red-500 dark:text-red-400" },
  arquivado: { label: "Arquivado", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200", icon: Archive, iconColor: "text-amber-600 dark:text-amber-400" },
  recusado: { label: "Recusado", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle, iconColor: "text-red-500 dark:text-red-400" },
};

export default function OrcamentosPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
      </div>
    }>
      <OrcamentosContent />
    </Suspense>
  );
}

function OrcamentosContent() {
  const toast = useToast();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // Estados dos Filtros e View
  const [viewMode, setViewMode] = useState<"tabela" | "quadro">("tabela");
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [dateFilter, setDateFilter] = useState("30");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "cancelado", ou "favorito"
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem("orcamentos_favoritos");
    if (stored) {
      try {
         setFavorites(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("orcamentos_favoritos", JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name, name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) setCompanyName(profile.company_name || profile.name);
    }

    let startDate = new Date();
    let endDate = new Date();

    if (dateFilter === "7") startDate.setDate(startDate.getDate() - 7);
    else if (dateFilter === "14") startDate.setDate(startDate.getDate() - 14);
    else if (dateFilter === "30") startDate.setDate(startDate.getDate() - 30);
    else if (dateFilter === "mes") startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    else if (dateFilter === "custom") {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      const diffDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        alert("O período máximo é de 1 ano.");
        setLoading(false);
        return;
      }
    } else {
      startDate = new Date(2000, 0, 1);
    }

    const { data, error } = await supabase
      .from("orcamentos")
      .select(`id, descricao, valor_total, created_at, status, clientes ( nome, telefone )`)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Normalizando status antigos q não batem exato (ex: enviado, recusado)
      const mappedData = data.map(o => ({
        ...o,
        status: (o.status as OrcamentoStatus) || "rascunho"
      }));
      setOrcamentos(mappedData as unknown as Orcamento[]);
    }

    setLoading(false);
  }, [dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(id: string, newStatus: string) {
    setOrcamentos((prev) => prev.map((orc) => (orc.id === id ? { ...orc, status: newStatus as any } : orc)));
    const { error } = await supabase.from("orcamentos").update({ status: newStatus }).eq("id", id);
    if (error) {
      fetchData();
      toast.error("Erro ao atualizar status.");
    } else {
      await syncOrcamentoToFinanceiro(id);
    }
  }

  function handleDelete(id: string) {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setConfirmOpen(false);
    const { error } = await supabase.from("orcamentos").delete().eq("id", deleteTargetId);
    const targetId = deleteTargetId;
    setDeleteTargetId(null);
    if (!error) {
      setOrcamentos((prev) => prev.filter((o) => o.id !== targetId));
      toast.success("Orçamento excluído.");
    } else {
      toast.error("Erro ao excluir orçamento.");
    }
  }

  // Filtragem (Client Side)
  const filteredOrcamentos = useMemo(() => {
    return orcamentos.filter((orc) => {
      const matchSearch = 
        orc.clientes?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        orc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orc.id.includes(searchTerm);
      
      // Filtro especial para Favoritos
      if (statusFilter === "favorito") {
        return matchSearch && favorites.includes(orc.id);
      }

      // Se for "all", mostramos tudo EXCETO cancelado/recusado (Vista Ativa)
      // Se for um status específico (incluindo "cancelado"), mostramos apenas ele
      const matchStatus = statusFilter === "all" 
        ? (orc.status !== "cancelado" && orc.status !== "recusado")
        : orc.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orcamentos, searchTerm, statusFilter, favorites]);

  // Agrupamento Metricas (Ignora o texto de busca, obedece apenas a data)
  const metricas = useMemo(() => {
    const acc = {
      rascunho: { count: 0, val: 0 },
      enviado: { count: 0, val: 0 },
      mudancas: { count: 0, val: 0 },
      aprovado: { count: 0, val: 0 },
      execucao: { count: 0, val: 0 },
      concluido: { count: 0, val: 0 },
      cancelado: { count: 0, val: 0 },
      arquivado: { count: 0, val: 0 }
    };

    orcamentos.forEach(o => {
      let statusFixed = String(o.status);
      if (statusFixed === 'recusado') statusFixed = 'cancelado';
      if (!acc[statusFixed as keyof typeof acc]) return;
      acc[statusFixed as keyof typeof acc].count++;
      acc[statusFixed as keyof typeof acc].val += Number(o.valor_total || 0);
    });

    return acc;
  }, [orcamentos]);

  return (
    <main className="min-h-screen bg-background font-sans transition-colors duration-500 pb-20 overflow-x-hidden">
      
      {/* Top Header / View Toggles with Glassmorphism */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 px-8 py-5 bg-card/40 border-b border-border/10 backdrop-blur-xl shadow-2xl shadow-primary/5 transition-all"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Orçamentos</h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* View Switcher */}
            <div className="flex bg-background/50 p-1 rounded-2xl border border-border/10 backdrop-blur-md">
              <button 
                onClick={() => setViewMode("quadro")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === "quadro" ? "bg-card text-primary shadow-xl" : "text-foreground/40 hover:text-foreground"}`}
              >
                <LayoutGrid className="w-4 h-4" /> Quadro
              </button>
              <button 
                onClick={() => setViewMode("tabela")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === "tabela" ? "bg-card text-primary shadow-xl" : "text-foreground/40 hover:text-foreground"}`}
              >
                <List className="w-4 h-4" /> Tabela
              </button>
            </div>

            <Link href="/dashboard/orcamentos/novo" className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex-1 md:flex-none justify-center">
              <Plus className="w-4 h-4" /> Novo Orçamento
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Métricas Topo */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Meus resultados</h2>
            <div className="flex items-center gap-2">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-xs font-semibold text-foreground/60 bg-card border border-border/10 rounded-lg px-2 py-1 outline-none focus:border-primary transition-colors"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="14">Últimos 14 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="mes">Este mês</option>
                <option value="custom">Data Específica</option>
              </select>
            </div>
          </div>
          {dateFilter === "custom" && (
            <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Início:</span>
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-card border border-border/10 rounded-lg px-2 py-1 text-[10px] font-bold text-foreground focus:outline-none focus:border-primary shadow-sm transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Fim:</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-card border border-border/10 rounded-lg px-2 py-1 text-[10px] font-bold text-foreground focus:outline-none focus:border-primary shadow-sm transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Board de Resultados (Bento Grid) */}
        {!loading && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {Object.entries(metricas)
              .filter(([k]) => k !== "mudancas" && k !== "arquivado")
              .map(([k, meta]) => {
                const statusKey = k as OrcamentoStatus;
                const config = statusConfig[statusKey];
                const Icon = config.icon;
                const isActive = statusFilter === statusKey;
                
                return (
                  <motion.div 
                    key={statusKey} 
                    variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                    onClick={() => setStatusFilter(isActive ? "all" : statusKey)} 
                    className={`relative bg-card/40 rounded-[2.5rem] p-6 border cursor-pointer transition-all duration-500 group overflow-hidden ${isActive ? 'border-primary shadow-2xl shadow-primary/10' : 'border-border/10 hover:border-primary/50'}`}
                  >
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 opacity-5 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className={`w-10 h-10 rounded-2xl ${config.color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 group-hover:text-foreground/70 transition-colors">{config.label}</span>
                    </div>
                    <div className="relative z-10">
                      <div className="text-3xl font-black text-foreground tracking-tighter mb-2">
                        R$ {meta.val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest px-3 py-1.5 bg-background/50 rounded-xl border border-border/10 inline-block">
                        {meta.count} orçamentos
                      </div>
                    </div>
                  </motion.div>
                );
            })}
          </motion.div>
        )}

        {/* Controls Row (Search, Filter) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/40 p-4 rounded-[2rem] border border-border/10 mb-8 flex flex-col md:flex-row items-center gap-6 justify-between shadow-xl shadow-primary/5 backdrop-blur-xl"
        >
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar orçamento por cliente ou #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background/50 border border-border/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all placeholder:text-foreground/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button 
              onClick={() => setStatusFilter("all")}
              className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${statusFilter === "all" ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20" : "bg-card/50 text-foreground/40 border-border/10 hover:border-primary/50"}`}
            >
              Exibir Ativos <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </button>
            <button 
              onClick={() => setStatusFilter("cancelado")}
              className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${statusFilter === "cancelado" ? "bg-red-500 text-white border-red-500 shadow-xl shadow-red-500/20" : "bg-card/50 text-foreground/40 border-border/10 hover:border-red-500/50"}`}
            >
              Cancelados
            </button>
            <div className="h-8 w-px bg-border/10 mx-2" />
            <button 
              onClick={() => setStatusFilter("favorito")}
              className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${statusFilter === "favorito" ? "bg-amber-500 text-white border-amber-500 shadow-xl shadow-amber-500/20" : "bg-card/50 text-foreground/30 border-border/10 hover:border-amber-500/50"}`}
            >
              <Star className="w-4 h-4" /> Favoritos
            </button>
          </div>
        </motion.div>

        {/* Loading State Spinner */}
        {loading && (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrcamentos.length === 0 && (
          <div className="bg-card/40 border text-center border-border/10 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum orçamento encontrado.</h3>
            <p className="text-foreground/40 font-medium mb-6">Você ainda não tem orçamentos nesta visualização ou com estes filtros.</p>
            <Link href="/dashboard/orcamentos/novo" className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition">
              Criar meu primeiro orçamento
            </Link>
          </div>
        )}

        {/* View render: Quadro (Board) - Glass/Bento Style */}
        {!loading && viewMode === "quadro" && filteredOrcamentos.length > 0 && (
          <div className="flex gap-6 overflow-x-auto pb-12 hide-scrollbar snap-x">
            {Object.keys(metricas).map(statusKey => {
               const st = statusKey as OrcamentoStatus;
               const orcsList = filteredOrcamentos.filter(o => {
                  let mapped = o.status as string;
                  if (mapped === "recusado") mapped = "cancelado";
                  return mapped === st;
               });
               if (orcsList.length === 0) return null;
               const config = statusConfig[st];

               return (
                 <div key={st} className="w-[340px] shrink-0 snap-start">
                   <div className="flex items-center justify-between mb-4 px-4 py-2 bg-card/20 backdrop-blur-md rounded-2xl border border-border/10">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                       <config.icon size={14} className={config.iconColor} />
                       {config.label}
                     </h3>
                     <span className="bg-card text-foreground/60 text-[10px] font-black px-2 py-0.5 rounded-lg border border-border/10">{orcsList.length}</span>
                   </div>
                   
                   <div className="flex flex-col gap-4">
                     {orcsList.map((orc, index) => (
                       <motion.div
                         key={orc.id}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: index * 0.05 }}
                       >
                         <Link href={`/dashboard/orcamentos/${orc.id}/editar`} className="group block bg-card/40 p-6 rounded-[2rem] border border-border/10 shadow-xl shadow-primary/5 backdrop-blur-xl hover:border-primary/50 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-foreground/30 bg-background/50 px-3 py-1 rounded-xl uppercase tracking-widest group-hover:bg-primary/20 group-hover:text-primary transition-colors">#{orc.id.split("-")[0]}</span>
                                  <Star 
                                    onClick={(e) => { e.preventDefault(); toggleFavorite(orc.id); }}
                                    className={`w-4 h-4 cursor-pointer transition-colors ${favorites.includes(orc.id) ? "text-amber-500 fill-amber-500" : "text-foreground/10 hover:text-amber-500"}`} 
                                  />
                               </div>
                               <div className="p-2 text-foreground/20 group-hover:text-primary transition-colors">
                                  <ArrowUpRight size={16} />
                               </div>
                            </div>
                            <h4 className="font-black text-foreground text-lg leading-tight mb-2 group-hover:translate-x-1 transition-transform">{orc.clientes?.nome || "Cliente Padrão"}</h4>
                            <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest line-clamp-1 mb-6 italic">{orc.descricao || "Orçamento Padrão"}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-border/10">
                               <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{new Date(orc.created_at).toLocaleDateString("pt-BR")}</div>
                               <div className="text-xl font-black text-foreground tracking-tighter">R$ {Number(orc.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                            </div>
                         </Link>
                       </motion.div>
                     ))}
                   </div>
                 </div>
               )
            })}
          </div>
        )}

        {/* View render: Tabela (List) - Bento Style */}
        {!loading && viewMode === "tabela" && filteredOrcamentos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 border border-border/10 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden backdrop-blur-xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background/30 transition-colors">
                    <th className="py-6 px-8 font-black text-[10px] text-foreground/30 uppercase tracking-[0.2em]">Identificação</th>
                    <th className="py-6 px-8 font-black text-[10px] text-foreground/30 uppercase tracking-[0.2em]">Cliente & Descrição</th>
                    <th className="py-6 px-8 font-black text-[10px] text-foreground/30 uppercase tracking-[0.2em]">Data</th>
                    <th className="py-6 px-8 font-black text-[10px] text-foreground/30 uppercase tracking-[0.2em]">Valor Total</th>
                    <th className="py-6 px-8 font-black text-[10px] text-foreground/30 uppercase tracking-[0.2em]">Status</th>
                    <th className="py-6 px-8 font-black text-[10px] text-foreground/30 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {filteredOrcamentos.map((orcamento, index) => {
                    let st = orcamento.status as string;
                    if (st === "recusado") st = "cancelado";
                    const config = statusConfig[st] || statusConfig.rascunho;
                    
                    const wpLink = orcamento.clientes?.telefone ? buildWhatsAppLink({
                      phone: orcamento.clientes.telefone,
                      clientName: orcamento.clientes.nome,
                      companyName: companyName,
                      context: orcamento.status
                    }) : null;

                    return (
                      <motion.tr 
                        key={orcamento.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-primary/5 transition-colors group"
                      >
                        <td className="py-6 px-8">
                           <div className="flex items-center gap-4">
                              <Star 
                                onClick={() => toggleFavorite(orcamento.id)}
                                className={`w-4 h-4 cursor-pointer transition-colors ${favorites.includes(orcamento.id) ? "text-amber-500 fill-amber-500" : "text-foreground/10 hover:text-amber-500"}`} 
                              />
                              <span className="font-black text-foreground/40 bg-background/50 px-3 py-1.5 rounded-xl text-[10px] uppercase cursor-pointer hover:bg-background transition-all">
                                #{orcamento.id.split("-")[0]}
                              </span>
                           </div>
                        </td>
                        <td className="py-6 px-8">
                           <Link href={`/dashboard/orcamentos/${orcamento.id}/editar`} className="block group/link">
                             <div className="font-black text-foreground leading-none text-base group-hover/link:text-primary transition-colors">{orcamento.clientes?.nome || "Cliente Desconhecido"}</div>
                             <div className="text-xs text-foreground/30 font-bold uppercase tracking-widest truncate max-w-[250px] mt-2">{orcamento.descricao || "Sem descrição"}</div>
                           </Link>
                        </td>
                        <td className="py-6 px-8 text-xs font-black text-foreground/40 uppercase tracking-widest">
                          {new Date(orcamento.created_at).toLocaleDateString("pt-BR", {day:'2-digit', month: 'short'})}
                        </td>
                        <td className="py-6 px-8 font-black text-foreground text-lg tracking-tighter">
                          R$ {Number(orcamento.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-6 px-8">
                           <div className="relative inline-flex items-center group/select">
                             <select 
                               value={st}
                               onChange={(e) => handleStatusChange(orcamento.id, e.target.value)}
                               className={`pl-4 pr-10 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border-2 outline-none cursor-pointer appearance-none transition-all ${config.color} border-transparent hover:border-primary/30 shadow-sm`}
                             >
                               {Object.entries(statusConfig).filter(([k])=> k !== 'recusado').map(([k, c]) => (
                                  <option key={k} value={k} className="bg-card text-foreground font-bold uppercase py-2">{c.label}</option>
                               ))}
                             </select>
                             <ChevronDown size={14} className="absolute right-4 text-current pointer-events-none opacity-50" />
                           </div>
                        </td>
                        <td className="py-6 px-8">
                           <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/dashboard/orcamentos/${orcamento.id}/editar`} 
                                className="p-3 text-primary hover:bg-primary/10 rounded-2xl transition-all hover:scale-110 active:scale-90" 
                                title="Editar Orçamento"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                              
                              {wpLink ? (
                                <a 
                                  target="_blank" 
                                  href={wpLink} 
                                  rel="noreferrer" 
                                  className="p-3 text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all hover:scale-110 active:scale-90" 
                                  title="Enviar no WhatsApp"
                                >
                                  <Send className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="p-3 text-foreground/10 cursor-not-allowed">
                                  <Send className="w-4 h-4" />
                                </span>
                              )}

                              <Link 
                                href={`/dashboard/orcamentos/${orcamento.id}/pdf`} 
                                className="p-3 text-foreground/30 hover:text-orange-500 hover:bg-orange-500/10 rounded-2xl transition-all hover:scale-110 active:scale-90" 
                                title="Baixar PDF"
                              >
                                <FileDown className="w-4 h-4" />
                              </Link>

                              <button 
                                onClick={() => handleDelete(orcamento.id)} 
                                className="p-3 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all hover:scale-110 active:scale-90" 
                                title="Deletar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Excluir orçamento"
        description="Deseja realmente excluir este orçamento? Esta ação não pode ser desfeita e removerá o vínculo com o financeiro."
        confirmLabel="Sim, excluir"
        onConfirm={confirmDelete}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
      />
    </main>
  );
}