"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { OrcamentoItemInput } from "@/type/orcamento";

type OrcamentoFormGessoProps = {
  onCalculate: (itens: OrcamentoItemInput[]) => void;
};

export default function OrcamentoFormGesso({ onCalculate }: OrcamentoFormGessoProps) {
  const [areaForro, setAreaForro] = useState(0);
  const [valorForro, setValorForro] = useState(0);
  const [sanca, setSanca] = useState(0);
  const [valorSanca, setValorSanca] = useState(0);

  function handleCalculate() {
    const itens: OrcamentoItemInput[] = [];

    // Forro Placa/Drywall
    if (areaForro > 0 && valorForro > 0) {
      itens.push({
        descricao: `Forro de Gesso Drywall/Plaquinha (${areaForro} m²)`,
        quantidade: 1, // Treat the whole service as 1 block for simplicity, or 1 block of (area) * unit
        valor_unitario: areaForro * valorForro,
      });
    }

    // Sanca de Gesso
    if (sanca > 0 && valorSanca > 0) {
      itens.push({
        descricao: `Sanca de Gesso (${sanca} ml)`,
        quantidade: 1,
        valor_unitario: sanca * valorSanca,
      });
    }

    onCalculate(itens);
  }

  // Update parent whenever values change
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-indigo-900 border-b border-indigo-100 pb-2">
        Calculadora de Gesso (Draft)
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Forro (Teto)</h4>
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-700">Área (m²)</label>
            <Input
              type="number"
              min="0"
              value={areaForro || ""}
              onChange={(e) => setAreaForro(Number(e.target.value))}
              onBlur={handleCalculate}
              placeholder="Ex: 45"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-700">Valor cobrado por m² (R$)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={valorForro || ""}
              onChange={(e) => setValorForro(Number(e.target.value))}
              onBlur={handleCalculate}
              placeholder="Ex: 85.00"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Sanca (Acabamento)</h4>
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-700">Comprimento (Metro Linear)</label>
            <Input
              type="number"
              min="0"
              value={sanca || ""}
              onChange={(e) => setSanca(Number(e.target.value))}
              onBlur={handleCalculate}
              placeholder="Ex: 12"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-700">Valor cobrado por ml (R$)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={valorSanca || ""}
              onChange={(e) => setValorSanca(Number(e.target.value))}
              onBlur={handleCalculate}
              placeholder="Ex: 45.00"
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
