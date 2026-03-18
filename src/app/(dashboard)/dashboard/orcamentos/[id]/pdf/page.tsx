"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import OrcamentoPdfDocument from "@/components/orcamentos/OrcamentoPdfDocument";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// Disable SSR for PDF components to avoid "document is not defined" or "window is not defined"
const DownloadButton = dynamic(
  () => import("@/components/orcamentos/PdfComponents").then((mod) => mod.DownloadButton),
  { ssr: false }
);

const Viewer = dynamic(
  () => import("@/components/orcamentos/PdfComponents").then((mod) => mod.Viewer),
  { ssr: false }
);

export default function OrcamentoPdfPage() {
  const params = useParams();
  const orcamentoId = params?.id as string;

  const [profile, setProfile] = useState<any | null>(null);
  const [orcamento, setOrcamento] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orcamentoId) return;

    async function fetchData() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "name, phone, company_name, company_phone, company_email, company_document, company_city, company_state, logo_url, pdf_validade, pdf_condicoes"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("Não foi possível carregar os dados da empresa.");
        setLoading(false);
        return;
      }

      const { data: orcamentoData, error: orcamentoError } = await supabase
        .from("orcamentos")
        .select(`
          id,
          descricao,
          valor_total,
          created_at,
          status,
          clientes (
            id,
            nome,
            telefone,
            email,
            endereco
          )
        `)
        .eq("id", orcamentoId)
        .single();

      if (orcamentoError || !orcamentoData) {
        setError("Não foi possível carregar o orçamento.");
        setLoading(false);
        return;
      }

      const { data: itensData, error: itensError } = await supabase
        .from("itens_orcamento")
        .select("id, descricao, quantidade, valor_unitario")
        .eq("orcamento_id", orcamentoId)
        .order("created_at", { ascending: true });

      if (itensError) {
        setError("Não foi possível carregar os itens do orçamento.");
        setLoading(false);
        return;
      }

      setProfile(profileData || null);
      setOrcamento({
        ...orcamentoData,
        itens: itensData || [],
      });

      setLoading(false);
    }

    fetchData();
  }, [orcamentoId]);

  const fileName = useMemo(() => {
    if (!orcamento) return "orcamento.pdf";
    return `orcamento-${String(orcamento.id).slice(0, 8)}.pdf`;
  }, [orcamento]);

  const whatsappLink = useMemo(() => {
    if (!orcamento?.clientes?.telefone) return null;

    return buildWhatsAppLink({
      phone: orcamento.clientes.telefone,
      clientName: orcamento.clientes.nome,
      companyName: profile?.company_name || "Nome da Empresa",
    });
  }, [orcamento, profile]);

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <Card className="bg-card/40 border-border/10 backdrop-blur-xl">Carregando orçamento...</Card>
        </div>
      </main>
    );
  }

  if (error || !orcamento) {
    return (
      <main className="min-h-screen bg-transparent px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <Card className="bg-card/40 border-border/10 backdrop-blur-xl">{error || "Orçamento não encontrado."}</Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tighter">PDF do orçamento</h1>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                Visualize, baixe e envie a proposta comercial.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 text-[10px] uppercase tracking-widest font-black text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10"
                >
                  Enviar no WhatsApp
                </a>
              ) : (
                <span className="inline-flex rounded-2xl bg-card/40 border border-border/10 px-6 py-3 text-[10px] uppercase tracking-widest font-black text-foreground/40">
                  Cliente sem telefone
                </span>
              )}

              <DownloadButton profile={profile} orcamento={orcamento} fileName={fileName} />
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-border/10 bg-white/5 backdrop-blur-xl shadow-2xl p-4">
            <Viewer profile={profile} orcamento={orcamento} />
          </div>
        </div>
      </main>
  );
}