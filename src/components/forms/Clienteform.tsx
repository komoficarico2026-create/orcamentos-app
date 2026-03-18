"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { User, Phone, Mail, MapPin, Save } from "lucide-react";

type ClienteFormProps = {
  onCreated: () => Promise<void> | void;
};

export default function ClienteForm({ onCreated }: ClienteFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("clientes").insert({
      user_id: user.id,
      nome,
      telefone: telefone || null,
      email: email || null,
      endereco: endereco || null,
    });

    setLoading(false);

    if (error) {
      setError("Não foi possível salvar o cliente.");
      return;
    }

    setNome("");
    setTelefone("");
    setEmail("");
    setEndereco("");
    await onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label htmlFor="nome" className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Nome Completo *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            id="nome"
            type="text"
            placeholder="Ex: João Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="telefone" className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Telefone / WhatsApp
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            id="telefone"
            type="text"
            placeholder="(11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="endereco" className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Endereço Completo
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            id="endereco"
            type="text"
            placeholder="Rua, Número, Bairro, Cidade - UF"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
        <Save size={18} />
        {loading ? "Salvando..." : "Salvar cliente"}
      </Button>
    </form>
  );
}