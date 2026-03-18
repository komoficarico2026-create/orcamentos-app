"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { supabase } from "@/lib/supabase";
import { Cliente } from "@/type/cliente";

type ClientesTableProps = {
  clientes: Cliente[];
  onDeleted: () => Promise<void> | void;
};

export default function ClientesTable({
  clientes,
  onDeleted,
}: ClientesTableProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!clientToDelete) return;

    const { error } = await supabase.from("clientes").delete().eq("id", clientToDelete);

    if (!error) {
      await onDeleted();
    }
    setClientToDelete(null);
  }

  if (clientes.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-xl p-12 text-center text-white/50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
          <span className="text-2xl opacity-50">👥</span>
        </div>
        <p className="font-medium">Nenhum cliente cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a]/40 backdrop-blur-xl shadow-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">Nome</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">Telefone</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">E-mail</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">Endereço</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">Ações</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-white">{cliente.nome}</td>
                <td className="px-6 py-4 text-sm text-white/60">{cliente.telefone || "-"}</td>
                <td className="px-6 py-4 text-sm text-white/60">{cliente.email || "-"}</td>
                <td className="px-6 py-4 text-sm text-white/60">{cliente.endereco || "-"}</td>
                <td className="px-6 py-4">
                  <Button
                    type="button"
                    className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-none hover:shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)] transition-all text-xs py-1.5 px-3"
                    onClick={() => handleDelete(cliente.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}