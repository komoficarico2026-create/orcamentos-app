"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { supabase } from "@/lib/supabase";
import { FinanceiroItem } from "@/components/forms/FinanceiroForm";

type FinanceiroTableProps = {
  itens?: FinanceiroItem[];
  onDeleted: () => Promise<void> | void;
  onEdit: (item: FinanceiroItem) => void;
};

export default function FinanceiroTable({
  itens = [],
  onDeleted,
  onEdit,
}: FinanceiroTableProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;

    const { error } = await supabase.from("financeiro").delete().eq("id", itemToDelete);

    if (!error) {
      await onDeleted();
    }
    setItemToDelete(null);
  }

  if (itens.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        Nenhuma movimentação registrada ainda.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Tipo</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Valor</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Descrição</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Data</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>

          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      item.tipo === "entrada"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.tipo}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm text-slate-800">
                  R$ {Number(item.valor).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-sm text-slate-600">
                  {item.descricao || "-"}
                </td>

                <td className="px-4 py-3 text-sm text-slate-600">
                  {new Date(item.data).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs px-3 py-1.5"
                      onClick={() => onEdit(item)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5"
                      onClick={() => handleDelete(item.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}