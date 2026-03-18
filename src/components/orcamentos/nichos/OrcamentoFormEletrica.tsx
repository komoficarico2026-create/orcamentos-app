"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { OrcamentoItemInput } from "@/type/orcamento";

type OrcamentoFormEletricaProps = {
  onCalculate: (itens: OrcamentoItemInput[]) => void;
};

export default function OrcamentoFormEletrica({ onCalculate }: OrcamentoFormEletricaProps) {
  const [pontosLuz, setPontosLuz] = useState(0);
  const [valorPontoLuz, setValorPontoLuz] = useState(0);
  const [pontosTomada, setPontosTomada] = useState(0);
  const [valorPontoTomada, setValorPontoTomada] = useState(0);
  const [quadro, setQuadro] = useState(0);
  const [valorQuadro, setValorQuadro] = useState(0);

  function handleCalculate() {
    const itens: OrcamentoItemInput[] = [];

    if (pontosLuz > 0 && valorPontoLuz > 0) {
      itens.push({
        descricao: `Instalação de Ponto de Luz`,
        quantidade: pontosLuz,
        valor_unitario: valorPontoLuz,
      });
    }

    if (pontosTomada > 0 && valorPontoTomada > 0) {
      itens.push({
        descricao: `Instalação de Tomada / Interruptor`,
        quantidade: pontosTomada,
        valor_unitario: valorPontoTomada,
      });
    }

    if (quadro > 0 && valorQuadro > 0) {
      itens.push({
        descricao: `Montagem de Quadro de Distribuição (QDC)`,
        quantidade: quadro,
        valor_unitario: valorQuadro,
      });
    }

    onCalculate(itens);
  }

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-amber-900 border-b border-amber-100 pb-2">
        Calculadora de Elétrica (Draft)
      </h3>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Luz */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 text-sm">Pontos de Luz</h4>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Qtd</label>
            <Input
              type="number"
              min="0"
              value={pontosLuz || ""}
              onChange={(e) => setPontosLuz(Number(e.target.value))}
              onBlur={handleCalculate}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">R$ un.</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={valorPontoLuz || ""}
              onChange={(e) => setValorPontoLuz(Number(e.target.value))}
              onBlur={handleCalculate}
            />
          </div>
        </div>

        {/* Tomadas */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 text-sm">Tomadas</h4>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Qtd</label>
            <Input
              type="number"
              min="0"
              value={pontosTomada || ""}
              onChange={(e) => setPontosTomada(Number(e.target.value))}
              onBlur={handleCalculate}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">R$ un.</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={valorPontoTomada || ""}
              onChange={(e) => setValorPontoTomada(Number(e.target.value))}
              onBlur={handleCalculate}
            />
          </div>
        </div>

        {/* Quadros */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 text-sm">Quadros</h4>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Qtd</label>
            <Input
              type="number"
              min="0"
              value={quadro || ""}
              onChange={(e) => setQuadro(Number(e.target.value))}
              onBlur={handleCalculate}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">R$ un.</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={valorQuadro || ""}
              onChange={(e) => setValorQuadro(Number(e.target.value))}
              onBlur={handleCalculate}
            />
          </div>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 italic">
        * Preencha os campos e clique fora para importar para a lista oficial abaixo.
      </p>
    </div>
  );
}
