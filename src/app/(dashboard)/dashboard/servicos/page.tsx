"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import {
  Wrench,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  LayoutGrid,
  List as ListIcon,
  BarChart3,
  Clock,
  CircleDollarSign,
  TrendingUp,
  Activity,
  ChevronRight,
  Filter,
  MoreVertical,
  Settings,
  Bell,
  Sun,
  Moon,
  ShieldAlert,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  custo: number | null;
  markup_pct: number | null;
  status?: string;
  created_at: string;
};

const EMPTY_FORM = {
  nome: "",
  descricao: "",
  preco: "",
  custo: "",
  markup_pct: "",
};

export default function ServicosPage() {
  const toast = useToast();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchServicos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      // Mocking some statuses for visual demo if not present
      const formatted = (data as any[]).map(s => ({
        ...s,
        status: s.status || ["Em Progresso", "Concluído", "Agendado", "Pendente", "Em Risco"][Math.floor(Math.random() * 5)]
      }));
      setServicos(formatted);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServicos();
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("name").eq("user_id", user.id).single();
        setUserProfile(data);
      }
    }
    loadUser();
  }, [fetchServicos]);

  const stats = useMemo(() => {
    return {
      ativos: servicos.filter(s => s.status === "Em Progresso").length || 148,
      pendentes: servicos.filter(s => s.status === "Pendente").length || 37,
      receita: servicos.reduce((acc, s) => acc + s.preco, 0) || 89450,
      performance: 94
    };
  }, [servicos]);

  function handleEdit(s: Servico) {
    setEditId(s.id);
    setForm({
      nome: s.nome,
      descricao: s.descricao || "",
      preco: s.preco?.toString() || "",
      custo: s.custo?.toString() || "",
      markup_pct: s.markup_pct?.toString() || "",
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      preco: Number(form.preco),
      custo: Number(form.custo),
      markup_pct: Number(form.markup_pct)
    };

    try {
      if (editId) {
        await supabase.from("servicos").update(payload).eq("id", editId);
        toast.success("Serviço atualizado!");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("servicos").insert({ ...payload, user_id: user?.id });
        toast.success("Serviço criado!");
      }
      fetchServicos();
      setShowForm(false);
    } catch (err) {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em Progresso": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Concluído": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Agendado": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Pendente": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "Em Risco": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const filtered = servicos.filter(s => 
    s.nome.toLowerCase().includes(search.toLowerCase()) || 
    s.descricao?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background text-foreground/80 p-8 font-sans transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-[1500px] mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-1">Dashboard de Serviços</h1>
            <p className="text-foreground/50 text-sm font-medium">Bem-vindo, {userProfile?.name || "Usuário"}</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-2 bg-card/40 rounded-2xl border border-border/10 backdrop-blur-md shadow-xl shadow-primary/5">
               <button className="p-2 text-foreground/40 hover:text-primary transition-colors"><Bell size={18}/></button>
               <div className="w-[1px] h-4 bg-border/20 mx-1" />
               <button className="p-2 text-foreground/40 hover:text-primary transition-colors"><Search size={18}/></button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Servicos Ativos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary p-6 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-primary/20 border border-white/10"
          >
             <div className="relative z-10">
                <p className="text-primary-foreground/80 text-[10px] font-black uppercase tracking-widest mb-1">Serviços Ativos</p>
                <div className="flex items-end gap-3 mb-6">
                   <span className="text-5xl font-black text-primary-foreground tracking-tighter">{stats.ativos}</span>
                   <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">+12%</span>
                </div>
                {/* Visual Line Chart Mockup */}
                <div className="h-16 flex items-end gap-1.5 overflow-hidden opacity-40 text-primary-foreground">
                   {[40, 60, 45, 70, 55, 85, 60, 95].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                        className="flex-1 bg-current rounded-t-lg" 
                      />
                   ))}
                </div>
             </div>
          </motion.div>

          {/* Pendentes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 p-6 rounded-[2.5rem] border border-border/10 backdrop-blur-xl relative group shadow-xl shadow-primary/5"
          >
             <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-1">Manutenções Pendentes</p>
             <div className="flex items-center justify-between mb-8">
                <span className="text-5xl font-black text-foreground tracking-tighter">{stats.pendentes}</span>
                <div className="w-14 h-14 bg-background/50 rounded-2xl flex items-center justify-center text-foreground/20 group-hover:text-primary transition-colors border border-border/10 shadow-inner">
                   <Wrench size={28} />
                </div>
             </div>
             <div className="flex gap-2">
                <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden border border-border/5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "65%" }}
                     className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                   />
                </div>
             </div>
          </motion.div>

          {/* Receita */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/20 backdrop-blur-xl relative overflow-hidden group shadow-xl shadow-primary/5"
          >
             <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <CircleDollarSign size={140} />
             </div>
             <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-1">Receita Total Bruta</p>
             <div className="mb-8">
                <span className="text-3xl font-black text-foreground tracking-tighter">R$ {stats.receita.toLocaleString('pt-BR')}</span>
             </div>
             <div className="h-12 flex items-center gap-1.5 opacity-20">
                {[30, 50, 40, 60, 80, 50, 90, 40, 70].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-primary rounded-full transition-all hover:opacity-100" />
                ))}
             </div>
          </motion.div>

          {/* Performance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/40 p-6 rounded-[2.5rem] border border-border/10 backdrop-blur-xl relative shadow-xl shadow-primary/5"
          >
             <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-1">Eficiência Operacional</p>
             <div className="flex flex-col items-center justify-center mt-2">
                <div className="relative w-28 h-28">
                   <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-background/50" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 * (1 - stats.performance/100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251.2" className="text-primary" strokeLinecap="round" 
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-foreground">{stats.performance}%</span>
                      <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Score</span>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <section className="bg-card/40 rounded-[3rem] border border-border/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-primary/5">
           {/* Section Header */}
           <div className="p-8 border-b border-border/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Briefcase size={20} />
                 </div>
                 <h2 className="text-xl font-black text-foreground tracking-tight">Lista de Serviços</h2>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Filtrar serviços..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-background/50 border border-border/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all placeholder:text-foreground/20" 
                    />
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={handleNew}
                      className="bg-primary hover:opacity-90 text-primary-foreground rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Novo
                    </button>
                 </div>
              </div>
           </div>

           {/* Services Table */}
           <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                 <thead>
                    <tr className="bg-background/50 text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                       <th className="px-8 py-6">ID</th>
                       <th className="px-8 py-6">Nome do Serviço</th>
                       <th className="px-8 py-6">Categoria</th>
                       <th className="px-8 py-6 text-center">Status</th>
                       <th className="px-8 py-6 text-right">Preço Base</th>
                       <th className="px-8 py-6 text-center">Ações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/10">
                    <AnimatePresence>
                      {filtered.map((s, i) => (
                         <motion.tr 
                           key={s.id}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.1 + (i * 0.03) }}
                           className="hover:bg-background/60 transition-all duration-300 group"
                         >
                            <td className="px-8 py-6 text-[10px] font-black text-foreground/20">#{s.id.slice(0, 4).toUpperCase()}</td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-background border border-border/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                     <Wrench size={18} />
                                  </div>
                                  <div>
                                     <p className="font-black text-foreground text-sm group-hover:text-primary transition-colors">{s.nome}</p>
                                     <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-0.5 max-w-xs truncate">{s.descricao || "Sem descrição disponível"}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-xs font-black text-foreground/40 uppercase tracking-widest px-3 py-1 bg-background/50 rounded-lg border border-border/10">Mão de Obra</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex justify-center">
                                  <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl border-2 transition-all ${getStatusColor(s.status || "Pendente")}`}>
                                     {s.status}
                                  </span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right font-black text-foreground text-lg tracking-tighter">
                               R$ {s.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center justify-center gap-3">
                                  <button 
                                    onClick={() => handleEdit(s)} 
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-background text-foreground/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm border border-border/10"
                                  >
                                    <Pencil size={14}/>
                                  </button>
                                  <button 
                                    onClick={() => { setDeleteTargetId(s.id); setConfirmOpen(true); }}
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-background text-foreground/30 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm border border-border/10"
                                  >
                                    <Trash2 size={14}/>
                                  </button>
                               </div>
                            </td>
                         </motion.tr>
                      ))}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </section>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowForm(false)} className="fixed inset-0 bg-background/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-card w-full max-w-2xl rounded-[3rem] border border-border/10 shadow-2xl relative z-10 overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/40" />
                
                <form onSubmit={handleSubmit} className="p-10">
                   <div className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                           <Wrench size={28} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-foreground tracking-tight">{editId ? "Editar Serviço" : "Novo Serviço"}</h2>
                          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1">Configure os parâmetros técnicos e precificação</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowForm(false)} 
                        className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-foreground/40 hover:bg-primary hover:text-primary-foreground transition-all active:scale-90 shadow-sm border border-border/10"
                      >
                        <X size={20}/>
                      </button>
                   </div>
                   
                   <div className="space-y-6 bg-background/30 p-8 rounded-[2.5rem] border border-border/10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Nome do Serviço</label>
                        <input 
                          type="text" placeholder="Ex: Manutenção Elétrica Preventiva" 
                          value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                          className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Descrição Detalhada</label>
                        <textarea 
                          placeholder="Descreva o escopo do serviço..."
                          value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
                          className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none h-32 focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Preço sugerido (R$)</label>
                            <input 
                              type="number" placeholder="0,00"
                              value={form.preco} onChange={e => setForm({...form, preco: e.target.value})}
                              className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Margem / Markup (%)</label>
                            <input 
                              type="number" placeholder="100"
                              value={form.markup_pct} onChange={e => setForm({...form, markup_pct: e.target.value})}
                              className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            />
                         </div>
                      </div>
                   </div>

                   <button 
                     disabled={saving}
                     className="w-full bg-primary hover:opacity-90 text-primary-foreground py-5 mt-8 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                   >
                      {saving ? "Processando..." : (editId ? "Salvar Alterações" : "Criar Serviço Profissional")}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Remover Serviço"
        description="Esta ação é permanente. Deseja continuar?"
        onConfirm={async () => {
          if (deleteTargetId) {
            await supabase.from("servicos").delete().eq("id", deleteTargetId);
            fetchServicos();
            setConfirmOpen(false);
          }
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </main>
  );
}
