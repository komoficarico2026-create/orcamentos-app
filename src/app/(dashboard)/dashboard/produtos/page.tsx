"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  Save,
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  Tag,
  Boxes,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_unitario: number;
  custo: number | null;
  markup_pct: number | null;
  unidade: string | null;
  marca: string | null;
  modelo: string | null;
  created_at: string;
};

const UNIDADES = [
  "Unidade (un)", 
  "Metro (m)", 
  "Metro quadrado (m²)", 
  "Metro cúbico (m³)", 
  "Quilograma (kg)", 
  "Litro (l)", 
  "Caixa (cx)", 
  "Rolo (rl)", 
  "Par (pr)", 
  "Conjunto (cj)",
  "Peça (pc)"
];

const EMPTY_FORM = {
  nome: "",
  descricao: "",
  preco_unitario: "",
  custo: "",
  markup_pct: "",
  unidade: "Unidade (un)",
  marca: "",
  modelo: "",
};

export default function ProdutosPage() {
  const toast = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProdutos(data as Produto[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  function handleEdit(p: Produto) {
    setEditId(p.id);
    setForm({
      nome: p.nome,
      descricao: p.descricao || "",
      preco_unitario: p.preco_unitario?.toString() || "",
      custo: p.custo?.toString() || "",
      markup_pct: p.markup_pct?.toString() || "",
      unidade: p.unidade || "Unidade (un)",
      marca: p.marca || "",
      modelo: p.modelo || "",
    });
    setShowForm(true);
    setError("");
  }

  function handleNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function handleClose() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError("Informe o nome do produto."); return; }
    if (!form.preco_unitario) { setError("Informe o preço unitário."); return; }
    
    setSaving(true);
    setError("");

    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao || null,
      preco_unitario: Number(form.preco_unitario) || 0,
      custo: form.custo ? Number(form.custo) : null,
      markup_pct: form.markup_pct ? Number(form.markup_pct) : null,
      unidade: form.unidade || null,
      marca: form.marca || null,
      modelo: form.modelo || null,
    };

    try {
      if (editId) {
        const { error: err } = await supabase.from("produtos").update(payload).eq("id", editId);
        if (err) throw err;
        toast.success("Produto atualizado com sucesso!");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Usuário não autenticado."); setSaving(false); return; }
        const { error: err } = await supabase.from("produtos").insert({ ...payload, user_id: user.id });
        if (err) throw err;
        toast.success("Produto cadastrado com sucesso!");
      }

      setSaving(false);
      handleClose();
      fetchProdutos();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao processar produto.");
      toast.error("Erro ao salvar produto.");
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setConfirmOpen(false);
    const { error: err } = await supabase.from("produtos").delete().eq("id", deleteTargetId);
    setDeleteTargetId(null);
    if (!err) {
      setProdutos((prev) => prev.filter((p) => p.id !== deleteTargetId));
      toast.success("Produto removido.");
    } else {
      toast.error("Erro ao excluir produto.");
    }
  }

  const filtered = produtos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.marca || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.descricao || "").toLowerCase().includes(search.toLowerCase())
  );
  const stats = useMemo(() => {
    return {
      total: produtos.length,
      valorEstoque: produtos.reduce((acc, p) => acc + (p.preco_unitario * (p.custo || 1)), 0) || 12450,
      categorias: new Set(produtos.map(p => p.marca)).size || 12,
      giro: 85
    };
  }, [produtos]);

  return (
    <main className="min-h-screen bg-background text-foreground/80 p-8 font-sans transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-[1500px] mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-1">Catálogo de Produtos</h1>
            <p className="text-foreground/50 text-sm font-medium">Gestão inteligente de materiais e insumos</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-2 bg-card/40 rounded-2xl border border-border/10 backdrop-blur-md shadow-xl shadow-primary/5">
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-primary"}`}
               >
                 <ListIcon size={18} />
               </button>
               <button 
                 onClick={() => setViewMode("grid")}
                 className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-primary"}`}
               >
                 <LayoutGrid size={18} />
               </button>
               <div className="w-[1px] h-4 bg-border/20 mx-1" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Produtos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary p-6 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-primary/20 border border-white/10"
          >
             <div className="relative z-10">
                <p className="text-primary-foreground/80 text-[10px] font-black uppercase tracking-widest mb-1">Total em Catálogo</p>
                <div className="flex items-end gap-3 mb-6">
                   <span className="text-5xl font-black text-primary-foreground tracking-tighter">{stats.total}</span>
                   <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">Itens</span>
                </div>
                <div className="h-16 flex items-end gap-1.5 overflow-hidden opacity-40 text-primary-foreground">
                   {[30, 45, 60, 40, 70, 50, 80, 65].map((h, i) => (
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

          {/* Valor em Estoque */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 p-6 rounded-[2.5rem] border border-border/10 backdrop-blur-xl relative group shadow-xl shadow-primary/5"
          >
             <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-1">Valor Estimado</p>
             <div className="flex items-center justify-between mb-8">
                <span className="text-3xl font-black text-foreground tracking-tighter">R$ {stats.valorEstoque.toLocaleString('pt-BR')}</span>
                <div className="w-14 h-14 bg-background/50 rounded-2xl flex items-center justify-center text-foreground/20 group-hover:text-primary transition-colors border border-border/10 shadow-inner">
                   <Boxes size={28} />
                </div>
             </div>
             <div className="flex gap-2">
                <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden border border-border/5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "78%" }}
                     className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                   />
                </div>
             </div>
          </motion.div>

          {/* Categorias */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/20 backdrop-blur-xl relative overflow-hidden group shadow-xl shadow-primary/5"
          >
             <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-1">Marcas & Categorias</p>
             <div className="mb-8">
                <span className="text-5xl font-black text-foreground tracking-tighter">{stats.categorias}</span>
             </div>
             <div className="absolute bottom-6 right-6 text-primary/10 group-hover:scale-110 transition-transform duration-700">
                <Tag size={80} />
             </div>
          </motion.div>

          {/* Giro de Estoque */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/40 p-6 rounded-[2.5rem] border border-border/10 backdrop-blur-xl relative shadow-xl shadow-primary/5"
          >
             <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mb-1">Giro de Materiais</p>
             <div className="flex flex-col items-center justify-center mt-2">
                <div className="relative w-28 h-28">
                   <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-background/50" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 * (1 - stats.giro/100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251.2" className="text-primary" strokeLinecap="round" 
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-foreground">{stats.giro}%</span>
                      <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Ativo</span>
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
                    <Package size={20} />
                 </div>
                 <h2 className="text-xl font-black text-foreground tracking-tight">Inventário</h2>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar estoque..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-background/50 border border-border/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all placeholder:text-foreground/20" 
                    />
                 </div>
                 
                 <button 
                   onClick={handleNew}
                   className="bg-primary hover:opacity-90 text-primary-foreground rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-2"
                 >
                   <Plus size={16} />
                   Novo Produto
                 </button>
              </div>
           </div>

           {/* Products Content */}
           <div className="p-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="h-64 bg-background/50 rounded-[2.5rem] animate-pulse border border-border/5" />
                   ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center text-foreground/10 mb-6 border border-border/10 shadow-inner">
                      <Package size={40} />
                   </div>
                   <h3 className="text-xl font-black text-foreground mb-2">Nenhum produto encontrado</h3>
                   <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest max-w-xs">{search ? "Tente ajustar os termos da sua pesquisa." : "Comece adicionando itens ao seu catálogo."}</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <AnimatePresence>
                      {filtered.map((p, i) => (
                         <motion.div 
                           key={p.id}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.05 }}
                           className="bg-background/40 p-6 rounded-[2.5rem] border border-border/10 hover:border-primary/30 transition-all group relative overflow-hidden"
                         >
                            <div className="flex justify-between items-start mb-6">
                               <div className="w-12 h-12 bg-background border border-border/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                  <Package size={20} />
                               </div>
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(p)} className="p-2 bg-background border border-border/10 rounded-xl text-foreground/40 hover:text-primary transition-colors"><Pencil size={14}/></button>
                                  <button onClick={() => handleDelete(p.id)} className="p-2 bg-background border border-border/10 rounded-xl text-foreground/40 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                               </div>
                            </div>
                            
                            <h3 className="font-black text-foreground text-sm uppercase tracking-tight mb-1 group-hover:text-primary transition-colors truncate">{p.nome}</h3>
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-4 truncate">{p.marca || "Base"} {p.modelo ? ` · ${p.modelo}` : ""}</p>
                            
                            <div className="pt-4 border-t border-border/5 flex items-end justify-between">
                               <div>
                                  <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest block mb-1">Preço Unit.</span>
                                  <p className="text-xl font-black text-foreground tracking-tighter">R$ {p.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                               </div>
                               <span className="px-2 py-1 bg-primary/10 text-primary text-[8px] font-black rounded-lg border border-primary/10 uppercase tracking-widest">
                                  {p.unidade ? p.unidade.split(' ')[0] : "un"}
                               </span>
                            </div>
                         </motion.div>
                      ))}
                   </AnimatePresence>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-8">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-background/30 text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                            <th className="px-8 py-4">Produto</th>
                            <th className="px-8 py-4">Especificação</th>
                            <th className="px-8 py-4 text-center">Unidade</th>
                            <th className="px-8 py-4 text-right">Markup</th>
                            <th className="px-8 py-4 text-right">Preço Venda</th>
                            <th className="px-8 py-4 text-center">Ações</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border/5">
                         {filtered.map((p, i) => (
                            <motion.tr 
                              key={p.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="hover:bg-background/40 transition-colors group"
                            >
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-background border border-border/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <Package size={16} />
                                     </div>
                                     <div>
                                        <p className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{p.nome}</p>
                                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{p.marca || "Generico"}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest max-w-[200px] truncate">
                                  {p.descricao || "N/A"}
                               </td>
                               <td className="px-8 py-6 text-center">
                                  <span className="px-3 py-1 bg-background border border-border/10 rounded-lg text-[10px] font-black text-foreground/40 uppercase">
                                     {p.unidade ? p.unidade.split(' ')[0] : "un"}
                                  </span>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <span className="text-emerald-500 font-black text-xs">+{p.markup_pct || 0}%</span>
                               </td>
                               <td className="px-8 py-6 text-right font-black text-foreground text-lg tracking-tighter">
                                  R$ {p.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center justify-center gap-2">
                                     <button onClick={() => handleEdit(p)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-background border border-border/10 text-foreground/30 hover:bg-primary hover:text-primary-foreground transition-all"><Pencil size={14}/></button>
                                     <button onClick={() => handleDelete(p.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-background border border-border/10 text-foreground/30 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                                  </div>
                               </td>
                            </motion.tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              )}
           </div>
        </section>
      </div>

      {/* Premium Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={handleClose} className="fixed inset-0 bg-background/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-card w-full max-w-3xl rounded-[3rem] border border-border/10 shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/40" />
                
                <div className="p-10 flex-1 overflow-y-auto scrollbar-hide">
                   <div className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                           <Package size={28} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-foreground tracking-tight">{editId ? "Editar Produto" : "Novo Material"}</h2>
                          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1">Configurações de SKU e precificação</p>
                        </div>
                      </div>
                      <button onClick={handleClose} className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-foreground/40 hover:bg-primary hover:text-primary-foreground transition-all border border-border/10 shadow-sm"><X size={20}/></button>
                   </div>
                   
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="bg-background/30 p-8 rounded-[2.5rem] border border-border/10 space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Nome do Material / Equipamento</label>
                            <input 
                              type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                              placeholder="Ex: Cabo Flexível 2,5mm Azul Furukawa"
                              className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Marca / Fabricante</label>
                               <input 
                                 type="text" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})}
                                 placeholder="Furukawa, Sil, Weg..."
                                 className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Unidade de Medida</label>
                               <select 
                                 value={form.unidade} onChange={e => setForm({...form, unidade: e.target.value})}
                                 className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                               >
                                 {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                               </select>
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Especificações Adicionais</label>
                            <textarea 
                              value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
                              placeholder="Descreva detalhes técnicos, cor, voltagem..."
                              className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none h-24 resize-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            />
                         </div>

                         <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Preço Venda (R$)</label>
                               <input 
                                 type="number" value={form.preco_unitario} onChange={e => setForm({...form, preco_unitario: e.target.value})}
                                 className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-black text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Custo Bruto (R$)</label>
                               <input 
                                 type="number" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})}
                                 className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Markup (%)</label>
                               <input 
                                 type="number" value={form.markup_pct} onChange={e => setForm({...form, markup_pct: e.target.value})}
                                 className="w-full bg-background border border-border/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                               />
                            </div>
                         </div>
                      </div>

                      <button 
                         disabled={saving}
                         className="w-full bg-primary hover:opacity-90 text-primary-foreground py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                         {saving ? "Salvando..." : (editId ? "Atualizar Catálogo" : "Registrar Material Profissional")}
                      </button>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Remover Item"
        description="Tem certeza que deseja excluir este produto do inventário? Esta ação é irreversível."
        onConfirm={confirmDelete}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
      />
    </main>
  );
}
