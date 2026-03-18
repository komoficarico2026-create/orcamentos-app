"use client";

import { ExtendedItemInput } from "./OrcamentoForm";
import { Trash2, Wrench, Package } from "lucide-react";

type OrcamentoItemRowProps = {
  index: number;
  item: ExtendedItemInput;
  onChange: (index: number, field: keyof ExtendedItemInput, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  catalog: { id: string; nome: string; preco: number; tipo: "servico" | "material" }[];
};

export default function OrcamentoItemRow({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
  catalog,
}: OrcamentoItemRowProps) {
  const totalItem = (item.quantidade || 0) * (item.valor_unitario || 0);

  const filteredCatalog = catalog.filter(c => c.tipo === item.tipo);

  const handleSelectFromCatalog = (nome: string) => {
    const found = filteredCatalog.find(c => c.nome === nome);
    if (found) {
      onChange(index, "descricao", found.nome);
      onChange(index, "valor_unitario", found.preco.toString());
    } else {
      onChange(index, "descricao", nome);
    }
  };

  return (
    <div className="py-4 border-b border-slate-100 last:border-0 group-hover:bg-slate-50/50 transition-colors rounded-r-xl">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pr-2">
        
        {/* Tipo Toggle & Descrição */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex gap-2 mb-1">
            <button
              type="button"
              onClick={() => onChange(index, "tipo", "servico")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md transition-colors ${
                item.tipo === "servico" 
                  ? "bg-amber-100 text-amber-800 border border-amber-200" 
                  : "bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200"
              }`}
            >
              <Wrench className="w-3 h-3" /> Serviço
            </button>
            <button
              type="button"
              onClick={() => onChange(index, "tipo", "material")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md transition-colors ${
                item.tipo === "material" 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                  : "bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200"
              }`}
            >
              <Package className="w-3 h-3" /> Material
            </button>
          </div>
          
          <input
            type="text"
            list={`catalog-${index}`}
            placeholder="Ex: Instalação de luminária"
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none border-b border-dashed border-slate-300 focus:border-blue-500 pb-1 cursor-text transition-colors"
            value={item.descricao}
            onChange={(e) => handleSelectFromCatalog(e.target.value)}
            required
          />
          <datalist id={`catalog-${index}`}>
            {filteredCatalog.map((c) => (
              <option key={c.id} value={c.nome}>
                R$ {c.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} {item.tipo === "material" ? "(Produto)" : "(Serviço)"}
              </option>
            ))}
          </datalist>
        </div>

        {/* Valores */}
        <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0">
          
          <div className="w-20">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Qtd</label>
            <input
              type="number"
              min="1"
              step="1"
              value={item.quantidade}
              onChange={(e) => onChange(index, "quantidade", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-center text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="w-28">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">V. Unitário</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.valor_unitario}
                onChange={(e) => onChange(index, "valor_unitario", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="w-24 text-right">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Total Item</label>
            <div className="text-sm font-bold text-slate-900 py-1.5">
              R$ {totalItem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="w-8 flex justify-end">
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={!canRemove}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              title="Remover item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}