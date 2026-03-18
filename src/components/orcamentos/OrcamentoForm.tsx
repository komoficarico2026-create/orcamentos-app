"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { syncOrcamentoToFinanceiro } from "@/lib/financeiro-sync";
import { ClienteOption, OrcamentoItemInput } from "@/type/orcamento";
import OrcamentoItemRow from "./OrcamentoItemRow";

import { 
  Save, 
  ArrowLeft, 
  FileText, 
  Wrench, 
  Package, 
  Eye,
  Settings2,
  ChevronDown,
  Building2,
  User,
  Tags,
  Plus,
  Info,
  X,
  Printer,
  ChevronLeft as ChevronLeftIcon,
  CircleCheck,
  Building
} from "lucide-react";

export interface ExtendedItemInput extends OrcamentoItemInput {
  tipo?: "servico" | "material";
}

const EMPTY_ITEM: ExtendedItemInput = {
  descricao: "",
  quantidade: 1,
  valor_unitario: 0,
  tipo: "servico"
};

export default function OrcamentoForm({ orcamentoId }: { orcamentoId?: string }) {
  const router = useRouter();

  // Estados Base
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [status, setStatus] = useState("rascunho");

  // Novo Toggle Simples vs Detalhado
  const [formato, setFormato] = useState<"simples" | "detalhado">("simples");
  
  // Estado para "Simples"
  const [simplesTexto, setSimplesTexto] = useState("");
  const [simplesValor, setSimplesValor] = useState(0);

  // Estado para "Detalhado" (O array normal que a gente já tinha)
  const [itens, setItens] = useState<ExtendedItemInput[]>([{ ...EMPTY_ITEM }]);
  const [desconto, setDesconto] = useState(0);

  // Catalog items
  const [catalog, setCatalog] = useState<{ id: string; nome: string; preco: number; tipo: "servico" | "material" }[]>([]);

  // UI States
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // Navegação topo
  const [isDescontosOpen, setIsDescontosOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchClientes();
    fetchProfile();
    fetchCatalog();
    if (orcamentoId) loadOrcamento(orcamentoId);
  }, [orcamentoId]);

  async function fetchCatalog() {
    const [servicosRes, produtosRes] = await Promise.all([
      supabase.from("servicos").select("id, nome, preco"),
      supabase.from("produtos").select("id, nome, preco_unitario")
    ]);

    const formattedCatalog: any[] = [
      ...(servicosRes.data || []).map(s => ({ ...s, tipo: "servico" })),
      ...(produtosRes.data || []).map(p => ({ id: p.id, nome: p.nome, preco: p.preco_unitario, tipo: "material" }))
    ];
    setCatalog(formattedCatalog);
  }

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) setProfile(data);
    }
  }

  async function fetchClientes() {
    setLoadingClientes(true);
    const { data, error } = await supabase.from("clientes").select("id, nome").order("nome", { ascending: true });
    if (!error && data) setClientes(data as ClienteOption[]);
    setLoadingClientes(false);
  }

  async function loadOrcamento(id: string) {
    const { data: orc, error: orcError } = await supabase.from("orcamentos").select("*").eq("id", id).single();
    if (orcError || !orc) {
      setError("Erro ao carregar orçamento.");
      return;
    }

    setClienteId(orc.cliente_id);
    setDescricao(orc.descricao || "");
    setStatus(orc.status || "rascunho");

    const { data: itensOrc } = await supabase.from("itens_orcamento").select("*").eq("orcamento_id", id).order("created_at", { ascending: true });
    
    // Se o orçamento só tiver um item e ele estiver marcado de um jeito genérico, podemos deduzir que é simples. Mas para não quebrar compatibilidade, usaremos detalhado por padrão na leitura se houver itens estruturados.
    if (itensOrc && itensOrc.length > 0) {
      if (itensOrc.length === 1 && itensOrc[0].tipo === "simples") {
        setFormato("simples");
        setSimplesTexto(itensOrc[0].descricao || "");
        setSimplesValor(itensOrc[0].valor_unitario || 0);
      } else {
        setFormato("detalhado");
        setItens(itensOrc.map((i: any) => ({
          descricao: i.descricao, quantidade: i.quantidade, valor_unitario: i.valor_unitario, tipo: i.tipo || "servico",
        })));
      }
    }
  }

  // Lidar com Itens do modo Completo
  function handleItemChange(index: number, field: keyof ExtendedItemInput, value: string) {
    setItens((prev) => prev.map((item, i) => {
      if (i !== index) return item;
      if (field === "quantidade") return { ...item, quantidade: Number(value || 0) };
      if (field === "valor_unitario") return { ...item, valor_unitario: Number(value || 0) };
      return { ...item, [field]: value };
    }));
  }
  function handleAddItem(tipo: "servico" | "material" = "servico") { setItens((prev) => [...prev, { ...EMPTY_ITEM, tipo }]); }
  function handleRemoveItem(index: number) { setItens((prev) => prev.filter((_, i) => i !== index)); }


  // --- Calculations Globais ---
  const metricas = useMemo(() => {
    if (formato === "simples") {
      return { maoDeObra: simplesValor, materiais: 0, subtotal: simplesValor, totalGeral: simplesValor };
    }

    let maoDeObra = 0; let materiais = 0;
    itens.forEach(item => {
      const totalItem = (item.quantidade || 0) * (item.valor_unitario || 0);
      if (item.tipo === "material") materiais += totalItem; else maoDeObra += totalItem;
    });
    const subtotal = maoDeObra + materiais;
    const totalGeral = subtotal - desconto;
    return { maoDeObra, materiais, subtotal, totalGeral };
  }, [itens, desconto, formato, simplesValor]);

  // --- Salvar ---
  async function handleSubmit() {
    setError("");
    if (!clienteId) {
      setError("Selecione um cliente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    let isEditing = !!orcamentoId;
    setSaving(true);
    let orcIdToUse = orcamentoId;

    if (isEditing) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: orcError } = await supabase.from("orcamentos").update({
        user_id: user?.id,
        cliente_id: clienteId, 
        descricao: descricao || null, 
        valor_total: metricas.totalGeral, 
        status: status,
      }).eq("id", orcamentoId);
      if (orcError) { setSaving(false); setError("Não foi possível atualizar o Orçamento."); return; }
      await supabase.from("itens_orcamento").delete().eq("orcamento_id", orcamentoId);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); setError("Usuário não autenticado."); return; }

      const { data: orcamento, error: orcError } = await supabase.from("orcamentos").insert({
        user_id: user.id,
        cliente_id: clienteId, 
        descricao: descricao || null, 
        valor_total: metricas.totalGeral, 
        status: status,
      }).select("id").single();
      if (orcError || !orcamento) { 
        console.error(orcError);
        setSaving(false); 
        setError("Não foi possível criar o Orçamento."); 
        return; 
      }
      orcIdToUse = orcamento.id;
    }

    // Preparar Items para Inserir
    let payloadItens = [];
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) { setSaving(false); setError("Usuário expirado."); return; }

    if (formato === "simples") {
      payloadItens.push({ 
        user_id: currentUser.id,
        orcamento_id: orcIdToUse, 
        descricao: simplesTexto || "Serviços Gerais", 
        quantidade: 1, 
        valor_unitario: simplesValor, 
        tipo: "simples" 
      });
    } else {
      payloadItens = itens.filter(i => i.descricao.trim() && i.quantidade > 0).map((item) => ({
        user_id: currentUser.id,
        orcamento_id: orcIdToUse, 
        descricao: item.descricao, 
        quantidade: item.quantidade, 
        valor_unitario: item.valor_unitario, 
        tipo: item.tipo
      }));
    }

    if (payloadItens.length > 0) {
      console.log("Tentando inserir itens:", payloadItens);
      const { error: itensError } = await supabase.from("itens_orcamento").insert(payloadItens);
      if (itensError) {
        console.error("Erro detalhado ao inserir itens:", itensError);
        setSaving(false);
        setError(`Erro ao cadastrar itens (${itensError.code}): ${itensError.message}. Detalhes: ${itensError.details || 'Sem detalhes'}`);
        return;
      }
    }
    
    // Sincronizar com o financeiro
    await syncOrcamentoToFinanceiro(orcIdToUse!);
    
    setSaving(false);
    router.push("/dashboard");
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col pt-0 pb-28 text-slate-900 relative">
      
      {/* Wrapper de Restrição Central */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-6">

        {/* 1. Header (Novo Orçamento + Barra Navegação) */}
        <div className="mb-8">
          <button onClick={() => router.push("/dashboard/orcamentos")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Voltar para lista
          </button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{orcamentoId ? "Editar Orçamento" : "Novo orçamento"}</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Eye className="w-4 h-4" /> Visualizar orçamento
              </button>
              <button 
                onClick={handleSubmit} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition"
              >
                <Save className="w-4 h-4" /> Salvar {orcamentoId ? "Alterações" : "Orçamento"}
              </button>
            </div>
          </div>

          {/* Menuzinho Horizontal Scrollspy Style */}
          <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto hide-scrollbar pb-0.5">
            <button onClick={() => { setActiveTab('info'); document.getElementById('info')?.scrollIntoView({behavior: 'smooth'}) }} className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Info className="w-4 h-4"/> Informações básicas</button>
            <button onClick={() => { setActiveTab('itens'); document.getElementById('itens')?.scrollIntoView({behavior: 'smooth'}) }} className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'itens' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Plus className="w-4 h-4"/> Itens e valores</button>
            <button onClick={() => { setActiveTab('descontos'); document.getElementById('descontos')?.scrollIntoView({behavior: 'smooth'}) }} className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'descontos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Tags className="w-4 h-4"/> Descontos e taxas</button>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

        <div className="space-y-6">

          {/* Bloco 1: Seleções Principais - Fundo Branco com Sombra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="info">
            
            {/* Cliente Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <h3 className="text-base font-bold text-slate-900 mb-1">Cliente</h3>
              <p className="text-sm text-slate-500 mb-5">Selecione um cliente para este orçamento.</p>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buscar / Cadastrados</label>
                <div className="flex gap-2">
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Ex: João Silva...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <button className="w-11 h-11 flex-shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 hover:bg-blue-100 transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Configuração Orçamento Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <h3 className="text-base font-bold text-slate-900 mb-1">Detalhes do Orçamento</h3>
              <p className="text-sm text-slate-500 mb-5">Informe um título ou referência.</p>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Título (Opcional)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Reforma da Fachada"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bloco 2: Itens e Valores (O Pulo do Gato) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]" id="itens">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Itens e Valores</h3>
                <p className="text-sm text-slate-500">Adicione os serviços e produtos para este orçamento.</p>
              </div>

              {/* Formato Switcher */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center lg:w-auto w-full">
                <button 
                  onClick={() => setFormato('simples')} 
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${formato === 'simples' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${formato === 'simples' ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                  Simples
                </button>
                <button 
                  onClick={() => setFormato('detalhado')} 
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${formato === 'detalhado' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${formato === 'detalhado' ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                  Detalhado <span className="hidden sm:inline-block bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">Rec.</span>
                </button>
              </div>
            </div>

            {/* MODO SIMPLES */}
            {formato === "simples" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="max-w-xs">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor Total (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                    <input 
                      type="number"
                      value={simplesValor || ""}
                      onChange={(e) => setSimplesValor(Number(e.target.value) || 0)}
                      className="w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 py-4 text-xl font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Descreva aqui os serviços que você vai realizar.</label>
                  <textarea 
                    value={simplesTexto}
                    onChange={(e) => setSimplesTexto(e.target.value)}
                    rows={4}
                    placeholder="Ex: Instalação de ar-condicionado split, incluindo suporte, tubulação e teste de funcionamento..."
                    className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-base font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-y shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* MODO DETALHADO */}
            {formato === "detalhado" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => handleAddItem("servico")} className="bg-blue-50 text-blue-700 border border-blue-100 font-bold text-xs px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-sm">
                    <Plus className="w-3 h-3" /> Adicionar Serviço
                  </button>
                  <button onClick={() => handleAddItem("material")} className="bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1 shadow-sm">
                    <Plus className="w-3 h-3" /> Adicionar Material
                  </button>
                </div>

                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {itens.map((item, index) => (
                    <div key={index} className="relative group bg-white rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-slate-200 p-1">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${item.tipo === 'material' ? 'bg-amber-400' : 'bg-blue-500'}`}></div>
                      <div className="pl-3">
                        <OrcamentoItemRow 
                          index={index} 
                          item={item as any} 
                          onChange={handleItemChange as any} 
                          onRemove={handleRemoveItem} 
                          canRemove={itens.length > 1}
                          catalog={catalog}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-500 font-medium mb-1">Subtotal de Itens</div>
                    <div className="text-2xl font-black text-slate-800">R$ {metricas.subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Acordeões Secundários */}
          <div className="space-y-4 pb-12" id="descontos">
            {/* Descontos Acordeão */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              <button onClick={() => setIsDescontosOpen(!isDescontosOpen)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Descontos, frete e taxas adicionais <span className="font-normal text-slate-400 text-sm">(Opcional)</span></h4>
                  <p className="text-xs text-slate-500 mt-0.5">Configure acréscimos ou reduções de valores neste orçamento.</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDescontosOpen ? 'rotate-180 text-blue-500' : ''}`} />
              </button>
              
              {isDescontosOpen && (
                <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                  <div className="max-w-xs mt-4">
                    <label className="text-sm font-bold text-slate-700 block mb-1">Desconto Extra (R$)</label>
                    <div className="relative border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                       <input type="number" value={desconto || ""} onChange={e => setDesconto(Number(e.target.value) || 0)} placeholder="0,00" className="w-full py-2.5 pl-10 pr-4 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Outros Acordeoes placeholder pra mostrar o visual da imagem */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              <button disabled className="w-full flex items-center justify-between p-5 text-left opacity-80 cursor-not-allowed">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Formas de Pagamento <span className="font-normal text-slate-400 text-sm">(Em Breve)</span></h4>
                  <p className="text-xs text-slate-500 mt-0.5">Configure as formas de pagamento para exibir na proposta.</p>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              <button disabled className="w-full flex items-center justify-between p-5 text-left opacity-80 cursor-not-allowed">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Fotos e Anexos <span className="font-normal text-slate-400 text-sm">(Em Breve)</span></h4>
                  <p className="text-xs text-slate-500 mt-0.5">Adicione até 12 fotos no seu orçamento para apresentar seus serviços.</p>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER FIXO (STICKY BOTTOM BAR) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] z-[100] transform translate-y-0 relative sm:fixed">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
            <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4">
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Valor Total a Pagar</p>
                 <div className="text-2xl font-black text-blue-600 tracking-tight leading-none">
                   R$ {metricas.totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                 </div>
               </div>
               {desconto > 0 && <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 flex items-center justify-center rounded-lg whitespace-nowrap">-{desconto} desc.</span>}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            {/* Seletor de Status (Simulando Imagem) */}
            <div className="relative w-full sm:w-auto flex items-center border border-slate-200 rounded-xl bg-white shadow-sm hover:border-blue-400 transition-colors overflow-hidden">
              <div className="pl-3 py-2 text-slate-400"><FileText className="w-4 h-4"/></div>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value)}
                className="appearance-none cursor-pointer bg-transparent text-slate-700 font-bold text-sm px-3 py-2.5 pr-8 outline-none w-full sm:w-auto flex-1 min-w-[140px]"
              >
                <option value="rascunho">Rascunho</option>
                <option value="enviado">Aguard. Aprovação</option>
                <option value="aprovado">Aprovado</option>
                <option value="execucao">Em Execução</option>
                <option value="concluido">Concluído</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
               <Eye className="w-4 h-4" /> Visualizar
            </button>

            <button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto flex flex-1 sm:flex-none items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
               <Save className="w-5 h-5" />
               {saving ? "Salvando..." : "Salvar e Fechar"}
            </button>
          </div>
          
        </div>
      </div>

      {/* ------------------------------------------------------------- 
          PREVIEW MODAL (FULL SCREEN) 
      -------------------------------------------------------------- */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 lg:p-4 transition-all duration-300">
          <div className="bg-white w-full h-full lg:h-[95vh] lg:max-w-6xl lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
               <div className="flex items-center gap-4">
                 <button onClick={() => setIsPreviewOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                   <ChevronLeftIcon className="w-6 h-6" />
                 </button>
                 <div>
                   <h2 className="text-xl font-black text-slate-900 tracking-tight">Visão do Cliente</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pré-visualização da proposta comercial</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                    <Printer className="w-4 h-4" /> Imprimir / PDF
                  </button>
                  <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 group transition-all">
                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {saving ? "Salvando..." : "Salvar Agora"}
                  </button>
                  <button onClick={() => setIsPreviewOpen(false)} className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Modal Content (Public View Clone) */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-12">
               <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 relative mb-12">
                  {/* Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                  <div className="p-8 md:p-14">
                    {/* Header Row: Logo & Company */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-10 mb-10">
                      <div className="flex-1">
                        {profile?.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.logo_url} alt="Logo" className="h-16 object-contain mb-6" />
                        ) : (
                          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-200 mb-6 uppercase">
                            {profile?.name?.charAt(0) || "P"}
                          </div>
                        )}
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.company_name || profile?.name || "Sua Empresa"}</h3>
                        <div className="mt-3 space-y-1.5 text-sm font-medium text-slate-500">
                           {profile?.company_document && <p className="flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /> {profile.company_document}</p>}
                           <p className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> {profile?.company_phone || profile?.phone || "(00) 00000-0000"}</p>
                        </div>
                      </div>

                      <div className="w-full md:w-auto text-left md:text-right space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                          <CircleCheck className="w-4 h-4" /> Proposta Comercial
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-bold text-slate-500 flex flex-col gap-1 min-w-[200px]">
                           <div className="flex justify-between items-center">
                             <span>ID:</span>
                             <span className="text-slate-900 font-black">#{orcamentoId?.slice(0, 8).toUpperCase() || "NOVO"}</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <span>Data:</span>
                             <span className="text-slate-900 font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Client Info Banner */}
                    <div className="bg-[#eff6ff]/50 rounded-2xl p-6 border border-blue-100 mb-12">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Preparado para</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                         <div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                              {clientes.find(c => c.id === clienteId)?.nome || "Selecione um cliente..."}
                            </h4>
                            <p className="text-slate-500 text-sm font-medium">{descricao || "Orçamento de Prestação de Serviços"}</p>
                         </div>
                      </div>
                    </div>

                    {/* Items Table Section */}
                    <div className="space-y-12 mb-16">
                       <div className="border-b-2 border-slate-900 pb-2 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                            <Wrench size={16} />
                         </div>
                         <h5 className="font-black text-slate-900 uppercase text-lg tracking-tight">Descrição dos Serviços e Materiais</h5>
                       </div>

                       <div className="overflow-x-auto">
                         <table className="w-full text-left border-separate border-spacing-0">
                           <thead>
                             <tr>
                               <th className="py-4 px-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Item</th>
                               <th className="py-4 px-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center">Qtd</th>
                               <th className="py-4 px-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-right">V. Unitário</th>
                               <th className="py-4 px-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-right">Total</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {formato === 'simples' ? (
                               <tr>
                                 <td className="py-6 px-4 font-bold text-slate-700">{simplesTexto || "Serviços Gerais"}</td>
                                 <td className="py-6 px-4 text-center text-slate-600 font-medium">1</td>
                                 <td className="py-6 px-4 text-right text-slate-600 font-medium">R$ {simplesValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                 <td className="py-6 px-4 text-right font-black text-slate-900">R$ {simplesValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                               </tr>
                             ) : (
                               itens.map((item, idx) => (
                                 <tr key={idx}>
                                   <td className="py-5 px-4 font-bold text-slate-700">{item.descricao}</td>
                                   <td className="py-5 px-4 text-center text-slate-600 font-medium">{item.quantidade}</td>
                                   <td className="py-5 px-4 text-right text-slate-600 font-medium">R$ {item.valor_unitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                   <td className="py-5 px-4 text-right font-black text-slate-900">R$ {(item.quantidade * item.valor_unitario).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                 </tr>
                               ))
                             )}
                           </tbody>
                         </table>
                       </div>
                    </div>

                    {/* Footer Summary Box */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 pt-10 border-t-2 border-slate-900">
                        <div className="flex-1 space-y-6">
                           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                              <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Informações de Pagamento</h6>
                              <div className="text-xs font-bold text-slate-600 whitespace-pre-wrap">
                                 {profile?.pdf_condicoes || "• À Vista: 5% de desconto no Pix.\n• Cartão: Parcelamento em até 12x.\n• Prazo: Sob consulta cadastral."}
                              </div>
                           </div>
                           <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                             Este documento é uma proposta comercial válida por {profile?.pdf_validade || 15} dias. Os valores descritos acima correspondem ao escopo atual do projeto, e qualquer inclusão pode acarretar em revisão de custos.
                           </p>
                        </div>

                        <div className="w-full md:w-80 bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20">
                           <div className="space-y-4 mb-8">
                             <div className="flex justify-between items-center opacity-60 text-[10px] font-black uppercase tracking-widest">
                               <span>Subtotal</span>
                               <span>R$ {metricas.subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                             </div>
                             {desconto > 0 && (
                               <div className="flex justify-between items-center text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                 <span>Desconto Aplicado</span>
                                 <span>- R$ {desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                               </div>
                             )}
                           </div>
                           <div className="border-t border-white/10 pt-6">
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Final</p>
                             <p className="text-4xl font-black tracking-tight leading-none">R$ {metricas.totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                           </div>
                        </div>
                    </div>
                  </div>

                  {/* Ribbon */}
                  <div className="bg-slate-100 px-8 py-4 text-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento gerado através da plataforma Profissa Digital</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}