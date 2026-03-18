"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { OrcamentoItemInput } from "@/type/orcamento";

type OrcamentoFormHidraulicaProps = {
  onCalculate: (itens: OrcamentoItemInput[]) => void;
};

export default function OrcamentoFormHidraulica({ onCalculate }: OrcamentoFormHidraulicaProps) {
  const [pontos, setPontos] = useState(0);
  const [valorPonto, setValorPonto] = useState(0);
  const [loucas, setLoucas] = useState(0);
  const [valorLoucas, setValorLoucas] = useState(0);

  function handleCalculate() {
    const itens: OrcamentoItemInput[] = [];

    // Ponto de água/esgoto
    if (pontos > 0 && valorPonto > 0) {
      itens.push({
        descricao: `Ponto de Água Fria/Quente ou Esgoto`,
        quantidade: pontos,
        valor_unitario: valorPonto,
      });
    }

    // Instalação de louças/metais
    if (loucas > 0 && valorLoucas > 0) {
      itens.push({
        descricao: `Instalação de Louças e Metais (Vaso, Pia, Torneira)`,
        quantidade: loucas,
        valor_unitario: valorLoucas,
      });
    }

    onCalculate(itens);
  }

  return (
    <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-cyan-900 border-b border-cyan-100 pb-2">
        Calculadora de Hidráulica (Draft)
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 text-sm">Pontos Estruturais (Água/Esgoto)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Qtd Pontos</label>
              <Input
                type="number"
                min="0"
                value={pontos || ""}
                onChange={(e) => setPontos(Number(e.target.value))}
                onBlur={handleCalculate}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">R$ por ponto</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorPonto || ""}
                onChange={(e) => setValorPonto(Number(e.target.value))}
                onBlur={handleCalculate}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 text-sm">Louças e Metais (Acabamento)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Qtd Louças</label>
              <Input
                type="number"
                min="0"
                value={loucas || ""}
                onChange={(e) => setLoucas(Number(e.target.value))}
                onBlur={handleCalculate}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">R$ por louça</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorLoucas || ""}
                onChange={(e) => setValorLoucas(Number(e.target.value))}
                onBlur={handleCalculate}
              />
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 italic">
        * Preencha os campos e clique fora para importar para a lista oficial abaixo.
      </p>
    </div>
  );
}
