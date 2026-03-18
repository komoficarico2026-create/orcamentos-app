import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  Download,
  Wrench,
  Package
} from "lucide-react";

// Server Action to fetch public data bypassing RLS if needed, or using a service key.
// For now, we assume the table 'orcamentos' has public read access OR we use a standard client.
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are usually available server-side.

export const revalidate = 0; // Disable cache for this route so it's always fresh

async function getOrcamento(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: orcamento, error } = await supabase
    .from("orcamentos")
    .select(`
      *,
      clientes ( nome, email, telefone, endereco ),
      itens_orcamento ( * )
    `)
    .eq("id", id)
    .single();

  if (error || !orcamento) return null;

  // Fetch company profile associated with this budget
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", orcamento.user_id)
    .single();

  return { orcamento, profile };
}

export default async function PublicOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrcamento(id);

  if (!data) {
    return notFound();
  }

  const { orcamento, profile } = data;
  const itens = orcamento.itens_orcamento || [];

  // Categorizar itens
  const servicos = itens.filter((i: any) => i.tipo !== "material");
  const materiais = itens.filter((i: any) => i.tipo === "material");

  // Calcular totais parciais se o DB não tiver os subtotais salvos, 
  // caso contrário usamos o valor_total do orcamento.
  let subtotalServicos = 0;
  let subtotalMateriais = 0;

  servicos.forEach((i: any) => subtotalServicos += (i.quantidade * i.valor_unitario));
  materiais.forEach((i: any) => subtotalMateriais += (i.quantidade * i.valor_unitario));

  const subtotal = subtotalServicos + subtotalMateriais;
  
  // Vamos deduzir o desconto calculando a diferença entre subtotal e o valor_total (se aplicável)
  const valorTotalGravado = Number(orcamento.valor_total || 0);
  const desconto = Math.max(0, subtotal - valorTotalGravado);
  const totalFinal = subtotal - desconto;

  const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    rascunho: { label: "Em Análise", color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock },
    enviado: { label: "Aguardando Aprovação", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    aprovado: { label: "Aprovado", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    recusado: { label: "Recusado", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };

  const status = statusConfig[orcamento.status || "rascunho"] || statusConfig["rascunho"];
  const StatusIcon = status.icon;

  const dataEmissao = new Date(orcamento.created_at).toLocaleDateString("pt-BR");
  const validade = new Date(orcamento.created_at);
  validade.setDate(validade.getDate() + 15); // Exemplo: 15 dias de validade
  const dataValidade = validade.toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Banner (Print Hidden) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-200 print:hidden">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Proposta Comercial</p>
            <p className="font-bold text-slate-900">Nº {orcamento.id.split("-")[0].toUpperCase()}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-violet-600 rounded-xl shadow-sm hover:bg-violet-700 transition-colors"
          >
            Aprovar Orçamento
          </button>
        </div>
      </div>

      {/* Main Document / A4 Paper Style */}
      <div className="max-w-4xl mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-lg sm:shadow-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:m-0 print:p-0 relative">
        
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-600 to-violet-800"></div>

        <div className="p-6 md:p-12">
          
          {/* Header row 1: Logo & Status */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8 mb-8">
            <div className="flex-1">
              {profile?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logo_url} alt="Logo da Empresa" className="h-16 object-contain mb-4" />
              ) : (
                <div className="h-16 w-16 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-violet-200 mb-4">
                  {profile?.name?.charAt(0) || "P"}
                </div>
              )}
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.name || "Sua Empresa"}</h1>
              <div className="mt-2 space-y-1 text-sm text-slate-500">
                {profile?.cnpj && <p className="flex items-center gap-2"><Building className="w-4 h-4" /> {profile.cnpj}</p>}
                {profile?.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {profile.phone}</p>}
                {profile?.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.email}</p>}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end w-full md:w-auto">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wider mb-4 ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </div>
              <div className="text-right space-y-1 w-full md:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 flex justify-between gap-8">
                  <span>Emissão:</span> 
                  <span className="text-slate-900 font-bold">{dataEmissao}</span>
                </p>
                <p className="text-sm font-medium text-slate-500 flex justify-between gap-8">
                  <span>Validade:</span> 
                  <span className="text-slate-900 font-bold">{dataValidade}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Header row 2: Client Info */}
          <div className="bg-violet-50/50 rounded-2xl p-6 border border-violet-100/50 mb-10">
            <h3 className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-4">Preparado para</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-extrabold text-slate-900 text-lg">{orcamento.clientes?.nome || "Cliente Padrão"}</p>
                {orcamento.clientes?.email && <p className="text-slate-600 text-sm mt-1">{orcamento.clientes.email}</p>}
                {orcamento.clientes?.telefone && <p className="text-slate-600 text-sm">{orcamento.clientes.telefone}</p>}
              </div>
              <div className="md:text-right">
                {orcamento.descricao && (
                  <div className="mt-2 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 inline-block md:float-right">
                    <span className="font-bold text-slate-900 block mb-0.5">Referência:</span>
                    {orcamento.descricao}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-10">
            
            {/* Services */}
            {servicos.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-900">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Mão de Obra e Serviços</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Descrição</th>
                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center w-24">Qtd</th>
                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right w-36">V. Unitário</th>
                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right w-36">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {servicos.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-sm font-semibold text-slate-800">{item.descricao}</td>
                          <td className="py-4 px-4 text-sm text-slate-600 text-center">{item.quantidade}</td>
                          <td className="py-4 px-4 text-sm text-slate-600 text-right">
                            {Number(item.valor_unitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-slate-900 text-right">
                            {(item.quantidade * item.valor_unitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Materials */}
            {materiais.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                    <Package className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide">Materiais e Produtos</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Produto</th>
                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center w-24">Qtd</th>
                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right w-36">V. Unitário</th>
                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right w-36">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {materiais.map((item: any) => (
                        <tr key={item.id} className="group">
                          <td className="py-3 px-4 text-sm font-medium text-slate-700">{item.descricao}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 text-center">{item.quantidade}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 text-right">
                            {Number(item.valor_unitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-slate-700 text-right">
                            {(item.quantidade * item.valor_unitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Footer Summary / Totals */}
          <div className="mt-12 flex flex-col md:flex-row justify-between items-end gap-8 pt-8 border-t-2 border-slate-900 print:border-t-2">
            
            <div className="w-full md:w-1/2 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Formas de Pagamento</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 space-y-2">
                <p>• Pix: Pagamento à vista com 5% de desconto.</p>
                <p>• Cartão de Crédito: Em até 3x sem juros ou 12x com acréscimo da maquininha.</p>
                <p>• Boleto: Faturado para 15 ou 30 dias mediante aprovação cadastral.</p>
              </div>
            </div>

            <div className="w-full md:w-80 space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                <span>Subtotal Serviços</span>
                <span>{subtotalServicos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                <span>Subtotal Materiais</span>
                <span>{subtotalMateriais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
              
              {desconto > 0 && (
                <div className="flex justify-between items-center text-emerald-600 text-sm font-bold pt-2 border-t border-slate-200/60">
                  <span>Desconto Aplicado</span>
                  <span>- {desconto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200">
                <span className="text-base font-bold text-slate-900">Total a Pagar</span>
                <span className="text-2xl font-black text-violet-600 tracking-tight">
                  {totalFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>
            
          </div>

        </div>

        {/* Footer Ribbon */}
        <div className="bg-slate-900 px-6 py-4 text-center mt-8">
           <p className="text-slate-400 text-xs font-medium">
             Este documento é provisório. Valores sujeitos à alteração caso o escopo do projeto seja modificado.
           </p>
        </div>
      </div>
    </div>
  );
}
