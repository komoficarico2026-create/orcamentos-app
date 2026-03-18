"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  FileText, 
  Trash2, 
  Edit, 
  Plus, 
  Search,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  _count?: {
    orcamentos: number;
  };
};

export default function ClientesPage() {
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for form
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("clientes")
      .select(`
        id, 
        nome, 
        telefone, 
        email, 
        endereco,
        orcamentos(count)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Map the nested count to a flatter structure
      const formatted = data.map((c: any) => ({
        ...c,
        _count: {
          orcamentos: c.orcamentos?.[0]?.count || 0,
        },
      }));
      setClientes(formatted as Cliente[]);
    }

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Bloqueio de duplicadas
    const { data: existing } = await supabase
      .from("clientes")
      .select("id, nome")
      .ilike("nome", nome.trim())
      .maybeSingle();

    if (existing && existing.id !== editId) {
      setSaving(false);
      setError("Já existe um cliente cadastrado com este nome exato.");
      return;
    }

    if (editId) {
      const { error: updateErr } = await supabase
        .from("clientes")
        .update({
          nome: nome.trim(),
          telefone: telefone || null,
          email: email || null,
          endereco: endereco || null,
        })
        .eq("id", editId);

      if (updateErr) {
        setError("Não foi possível atualizar o cliente.");
        toast.error("Erro ao atualizar cliente.");
        setSaving(false);
        return;
      }
      toast.success("Cliente atualizado com sucesso!");
    } else {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setSaving(false);
        setError("Usuário não autenticado.");
        return;
      }
      const { error: insertErr } = await supabase.from("clientes").insert({
        user_id: currentUser.id,
        nome: nome.trim(),
        telefone: telefone || null,
        email: email || null,
        endereco: endereco || null,
      });

      if (insertErr) {
        setError("Não foi possível salvar o cliente.");
        toast.error("Erro ao cadastrar cliente.");
        setSaving(false);
        return;
      }
      toast.success("Cliente cadastrado com sucesso!");
    }

    setSaving(false);
    resetForm();
    await fetchClientes();
  }

  function handleEdit(cliente: Cliente) {
    setEditId(cliente.id);
    setNome(cliente.nome);
    setTelefone(cliente.telefone || "");
    setEmail(cliente.email || "");
    setEndereco(cliente.endereco || "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setNome("");
    setTelefone("");
    setEmail("");
    setEndereco("");
    setError("");
  }

  function handleDelete(id: string) {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setConfirmOpen(false);

    const { error } = await supabase.from("clientes").delete().eq("id", deleteTargetId);
    setDeleteTargetId(null);

    if (error) {
      toast.error("Erro ao excluir. O cliente pode ter orçamentos vinculados.");
    } else {
      toast.success("Cliente removido.");
      await fetchClientes();
    }
  }

  const filteredClientes = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.telefone && c.telefone.includes(searchTerm))
  );

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
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-none">Clientes</h1>
              <p className="hidden md:block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Gestão de carteira e contatos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background/50 border border-border/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all placeholder:text-foreground/30"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr] items-start">
          
          {/* Form Side - Glass Card */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/40 backdrop-blur-xl border-border/10 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 sticky top-28">
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-2xl ${editId ? 'bg-amber-500/10 text-amber-500' : 'bg-primary text-primary-foreground'}`}>
                  {editId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tight">
                  {editId ? "Editar cadastro" : "Novo cadastro"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                  >
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Nome Completo</label>
                  <Input
                    className="rounded-2xl border-border/10 bg-background/50 p-4 font-bold focus:ring-primary/20"
                    placeholder="Ex: João da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Telefone / WhatsApp</label>
                  <Input
                    className="rounded-2xl border-border/10 bg-background/50 p-4 font-bold focus:ring-primary/20"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">E-mail</label>
                  <Input
                    className="rounded-2xl border-border/10 bg-background/50 p-4 font-bold focus:ring-primary/20"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Endereço</label>
                  <Input
                    className="rounded-2xl border-border/10 bg-background/50 p-4 font-bold focus:ring-primary/20"
                    placeholder="Rua, Número, Bairro, Cidade"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={saving} 
                    className={`rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-xl ${editId ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-primary text-primary-foreground shadow-primary/20 border-none'}`}
                  >
                    {saving ? "Processando..." : editId ? "Atualizar Dados" : "Cadastrar Cliente"}
                  </Button>

                  {editId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                      disabled={saving}
                      className="rounded-2xl py-4 font-black uppercase tracking-widest text-xs bg-background/50 text-foreground/50 border-none transition-all hover:bg-background"
                    >
                      Descartar Edição
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </motion.div>

          {/* List Side - Bento Grid */}
          <div>
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-foreground tracking-tight">Base de Clientes</h2>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20 uppercase tracking-widest">
                  {filteredClientes.length} registros
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-card/40 rounded-[2.5rem] border border-border/10 backdrop-blur-xl">
                <div className="h-12 w-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-6 text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] animate-pulse">Sincronizando dados...</p>
              </div>
            ) : filteredClientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-card/40 rounded-[2.5rem] border-2 border-dashed border-border/10 backdrop-blur-xl">
                <div className="w-20 h-20 bg-background/50 rounded-3xl flex items-center justify-center mb-6 text-foreground/10">
                  <User size={40} />
                </div>
                <h3 className="text-lg font-black text-foreground mb-2 underline decoration-primary/30 underline-offset-8">Vazio por aqui</h3>
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest text-center max-w-xs leading-relaxed">
                  {clientes.length === 0 ? "Nenhum cliente cadastrado ainda. Use o formulário lateral." : "Nenhum resultado para os filtros atuais."}
                </p>
              </div>
            ) : (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredClientes.map((cliente) => (
                    <motion.div
                      key={cliente.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      variants={{ 
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      className="group relative bg-card/40 rounded-[2.5rem] border border-border/10 p-8 shadow-xl shadow-primary/5 backdrop-blur-xl hover:border-primary/50 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute -right-4 -top-4 w-32 h-32 bg-gradient-to-br from-primary to-primary/60 opacity-5 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-6 mb-8">
                          {/* Avatar Bento Style */}
                          <div className="w-20 h-20 rounded-[2rem] bg-foreground dark:bg-card flex items-center justify-center text-background dark:text-foreground text-3xl font-black shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 border border-border/10">
                            {cliente.nome.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4 mb-2">
                               <h3 className="text-2xl font-black text-foreground truncate group-hover:text-primary transition-colors tracking-tight">
                                {cliente.nome}
                              </h3>
                            </div>
                            
                            {cliente._count !== undefined && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-background/50 text-foreground/50 text-[10px] font-black uppercase tracking-widest rounded-xl border border-border/10 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <FileText size={12} />
                                {cliente._count.orcamentos} {cliente._count.orcamentos === 1 ? 'Orçamento' : 'Orçamentos'}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid gap-4 mb-10">
                          {cliente.telefone && (
                            <div className="flex items-center gap-4 text-xs font-bold text-foreground/50 uppercase tracking-widest bg-background/30 p-3 rounded-2xl border border-border/10">
                              <div className="p-2 bg-card rounded-xl shadow-sm text-primary">
                                <Phone size={14} />
                              </div>
                              <span className="truncate">{cliente.telefone}</span>
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center gap-4 text-xs font-bold text-foreground/50 tracking-widest bg-background/30 p-3 rounded-2xl border border-border/10">
                              <div className="p-2 bg-card rounded-xl shadow-sm text-primary">
                                <Mail size={14} />
                              </div>
                              <span className="truncate italic normal-case tracking-normal">{cliente.email}</span>
                            </div>
                          )}
                          {cliente.endereco && (
                            <div className="flex items-center gap-4 text-xs font-bold text-foreground/50 uppercase tracking-widest bg-background/30 p-3 rounded-2xl border border-border/10">
                              <div className="p-2 bg-card rounded-xl shadow-sm text-primary">
                                <MapPin size={14} />
                              </div>
                              <span className="truncate">{cliente.endereco}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-6 border-t border-border/10">
                          <Link 
                            href={`/dashboard/orcamentos?search=${encodeURIComponent(cliente.nome)}`}
                            className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                          >
                            Ver Projetos
                            <ArrowUpRight size={14} />
                          </Link>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(cliente)}
                              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-card text-foreground/40 hover:text-amber-500 hover:bg-amber-500/10 border border-border/10 transition-all duration-300 shadow-sm"
                              title="Editar Cliente"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(cliente.id)}
                              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-card text-foreground/40 hover:text-red-500 hover:bg-red-500/10 border border-border/10 transition-all duration-300 shadow-sm"
                              title="Excluir Cliente"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Excluir cliente"
        description="Tem certeza? Esta ação não pode ser desfeita. Clientes com orçamentos vinculados não podem ser removidos."
        confirmLabel="Sim, excluir"
        onConfirm={confirmDelete}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
      />
    </main>
  );
}