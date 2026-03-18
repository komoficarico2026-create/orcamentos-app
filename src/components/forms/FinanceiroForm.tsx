
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { DollarSign, FileText, Calendar, Plus, Save, X } from "lucide-react";

export type FinanceiroItem = {
  id: string;
  tipo: "entrada" | "despesa";
  valor: number;
  descricao: string | null;
  data: string;
  created_at: string;
};

type FinanceiroFormProps = {
  onCreated: () => Promise<void> | void;
  itemParaEditar?: FinanceiroItem | null;
  onCancelEdit?: () => void;
};

export default function FinanceiroForm({ 
  onCreated, 
  itemParaEditar, 
  onCancelEdit 
}: FinanceiroFormProps) {
  const [tipo, setTipo] = useState<"entrada" | "despesa">("entrada");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (itemParaEditar) {
      setTipo(itemParaEditar.tipo);
      setValor(itemParaEditar.valor.toString());
      setDescricao(itemParaEditar.descricao || "");
      setData(itemParaEditar.data);
      setError("");
    } else {
      resetForm();
    }
  }, [itemParaEditar]);

  function resetForm() {
    setTipo("entrada");
    setValor("");
    setDescricao("");
    setData(new Date().toISOString().slice(0, 10));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const valorNumero = Number(valor);

    if (!valorNumero || valorNumero <= 0) {
      setLoading(false);
      setError("Informe um valor válido.");
      return;
    }

    if (itemParaEditar) {
      // Update
      const { error: updateError } = await supabase
        .from("financeiro")
        .update({
          tipo,
          valor: valorNumero,
          descricao: descricao || null,
          data,
        })
        .eq("id", itemParaEditar.id);

      if (updateError) {
        setLoading(false);
        setError("Não foi possível atualizar o lançamento.");
        return;
      }
    } else {
      // Insert
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setError("Usuário não autenticado.");
        return;
      }

      const { error: insertError } = await supabase.from("financeiro").insert({
        user_id: user.id,
        tipo,
        valor: valorNumero,
        descricao: descricao || null,
        data,
      });

      if (insertError) {
        setLoading(false);
        setError("Não foi possível salvar o lançamento.");
        return;
      }
    }

    setLoading(false);
    resetForm();
    if (onCancelEdit) onCancelEdit();
    await onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="tipo" className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Tipo de Lançamento
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTipo("entrada")}
            className={`h-11 rounded-xl font-bold text-sm transition-all border-2 ${
              tipo === "entrada"
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200 dark:hover:border-slate-600"
            }`}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setTipo("despesa")}
            className={`h-11 rounded-xl font-bold text-sm transition-all border-2 ${
              tipo === "despesa"
                ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400"
                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200 dark:hover:border-slate-600"
            }`}
          >
            Despesa
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="valor" className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Valor (R$)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            id="valor"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="descricao-financeiro" className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Descrição / Categoria
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            id="descricao-financeiro"
            type="text"
            placeholder="Ex: Pagamento Fornecedor"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="data-financeiro" className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Data
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            id="data-financeiro"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          type="submit" 
          disabled={loading} 
          className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg dark:shadow-none transition-all ${
            itemParaEditar 
              ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:bg-amber-700 dark:hover:bg-amber-600" 
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600"
          }`}
        >
          {itemParaEditar ? <Save size={18} /> : <Plus size={18} />}
          {loading ? "Salvando..." : itemParaEditar ? "Salvar edições" : "Salvar lançamento"}
        </Button>

        {itemParaEditar && onCancelEdit && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelEdit}
            disabled={loading}
            className="h-12 w-12 p-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Cancelar"
          >
            <X size={20} />
          </Button>
        )}
      </div>
    </form>
  );
}