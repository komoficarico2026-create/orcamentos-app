import { supabase } from "./supabase";

export async function syncOrcamentoToFinanceiro(orcamentoId: string) {
  try {
    // 1. Buscar os dados completos do orçamento
    const { data: orcamento, error: orcError } = await supabase
      .from("orcamentos")
      .select(`
        id, 
        user_id, 
        descricao, 
        valor_total, 
        status, 
        created_at,
        clientes ( nome )
      `)
      .eq("id", orcamentoId)
      .single();

    if (orcError || !orcamento) {
      console.error("Erro ao buscar orçamento para sincronia:", orcError);
      return;
    }

    // 2. Definir se deve existir no financeiro
    // Status que geram receita
    const statusFinanceiros = ["aprovado", "concluido", "em_execucao"];
    const deveEstarNoFinanceiro = statusFinanceiros.includes(orcamento.status);

    if (deveEstarNoFinanceiro) {
      // Upsert: Tentar encontrar registro existente pelo orcamento_id
      const { data: existing } = await supabase
        .from("financeiro")
        .select("id")
        .eq("orcamento_id", orcamentoId)
        .maybeSingle();

      const clientName = Array.isArray(orcamento.clientes) 
        ? orcamento.clientes[0]?.nome 
        : (orcamento.clientes as any)?.nome;

      const financeData = {
        user_id: orcamento.user_id,
        orcamento_id: orcamentoId,
        descricao: `Orçamento #${orcamento.id.slice(0, 8).toUpperCase()} - ${clientName || "Cliente"}`,
        valor: orcamento.valor_total,
        tipo: "entrada",
        data: new Date().toISOString().split("T")[0], // Data de hoje como padrão para entrada
      };

      if (existing) {
        await supabase.from("financeiro").update(financeData).eq("id", existing.id);
      } else {
        await supabase.from("financeiro").insert(financeData);
      }
    } else {
      // Se não deve estar (foi cancelado, rascunho, etc), remove do financeiro
      await supabase.from("financeiro").delete().eq("orcamento_id", orcamentoId);
    }
  } catch (err) {
    console.error("Erro crítico na sincronização financeira:", err);
  }
}
