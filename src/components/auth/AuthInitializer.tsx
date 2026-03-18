"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthInitializer() {
  const router = useRouter();

  useEffect(() => {
    // Escuta mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Define o cookie que o middleware espera
        // O Supabase costuma usar sb-<project-id>-auth-token
        // No nosso middleware estamos procurando por sb-*-auth-token
        // Vamos definir um cookie genérico que satisfaça a regex/lógica do middleware
        const cookieName = `sb-auth-token`;
        const expires = new Date(session.expires_at! * 1000).toUTCString();
        
        // Salvamos o token no cookie para o middleware ler
        document.cookie = `${cookieName}=${session.access_token}; path=/; expires=${expires}; SameSite=Lax`;
        
        console.log("[AuthInitializer] Sessão detectada, cookie definido.");
      } else {
        // Remove o cookie ao fazer logout
        document.cookie = `sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        console.log("[AuthInitializer] Sem sessão, cookie removido.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
