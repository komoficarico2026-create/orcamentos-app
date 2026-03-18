"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FinanceiroPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/recebimentos");
  }, [router]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest animate-pulse">Redirecionando fluxo financeiro...</p>
      </div>
    </main>
  );
}