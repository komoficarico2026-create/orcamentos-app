"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    checkSession();

    // Listen for real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-4xl text-slate-600">
          Verificando sessão...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}