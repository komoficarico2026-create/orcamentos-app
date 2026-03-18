"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors duration-200 text-left"
    >
      <LogOut className="w-5 h-5 group-hover:text-rose-500 transition-colors" />
      {loading ? "Saindo..." : "Sair do Sistema"}
    </button>
  );
}