"use client";

import { useParams } from "next/navigation";
import OrcamentoForm from "@/components/orcamentos/OrcamentoForm";

export default function EditarOrcamentoPage() {
  const params = useParams();
  const orcamentoId = params?.id as string;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <OrcamentoForm orcamentoId={orcamentoId} />
      </div>
    </main>
  );
}
