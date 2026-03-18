"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Settings, ShieldCheck, ArrowRight, Lock, User, Pencil, Calculator, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }



    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#020617] overflow-hidden">
      
      {/* Background HUD & Technical Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* Technical Grid/Dots */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        
        {/* Corner Brackets (HUD) */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-white/10" />
        <div className="absolute top-10 right-10 w-20 h-20 border-t border-r border-white/10" />
        <div className="absolute bottom-10 left-10 w-20 h-20 border-b border-l border-white/10" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-white/10" />

        {/* Orbiting Elements as Technical Icons */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] border border-white/5 rounded-full"
        />

      </div>

      {/* Orbital Horizon Arc */}
      <div className="absolute bottom-[-10%] md:bottom-[-25%] left-1/2 -translate-x-1/2 w-[150%] aspect-square max-w-[1800px] pointer-events-none">
        <div className="absolute inset-0 rounded-full border-[1px] border-white/10" />
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 -20px 80px -10px rgba(139, 92, 246, 0.4), inset 0 2px 20px rgba(255, 255, 255, 0.1)'
          }} 
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Side: Branding Impact (Welcome. Style) */}
        <div className="flex flex-col gap-4 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
               <div className="w-12 h-[1px] bg-violet-500" />
               <span className="text-violet-500 text-[10px] font-black uppercase tracking-[0.5em]">Plataforma OS</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
              Crie sua conta<span className="text-violet-500">.</span>
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium max-w-md tracking-wide leading-relaxed">
              Junte-se à elite dos prestadores e transforme seu negócio com nossa inteligência operacional.
            </p>
            
            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start opacity-30 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2">
                   <Settings className="animate-spin" style={{ animationDuration: '12s' }} size={20} />
                   <span className="text-[10px] font-mono uppercase tracking-widest">Onboarding Ready</span>
                </div>
                <div className="flex items-center gap-2">
                   <ShieldCheck size={20} />
                   <span className="text-[10px] font-mono uppercase tracking-widest">Global Encryption</span>
                </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Re-styled Form */}
        <div className="flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group"
          >
            {/* Subtle Inner Glow */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-violet-500/10 blur-[60px] rounded-full" />
            
            <div className="relative z-10">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">Informações Básicas</h2>
                <div className="h-1 w-12 bg-violet-500 rounded-full" />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                >
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    {error}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Ex: João da Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-black/60 transition-all placeholder:text-white/10"
                      style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                    E-mail Institucional
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="seu@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-black/60 transition-all placeholder:text-white/10"
                      style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                    Senha Secreta
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-black/60 transition-all placeholder:text-white/10"
                      style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
                      required
                    />
                  </div>
                </div>

                <p className="text-[9px] text-white/20 font-medium px-2 leading-relaxed tracking-wider">
                  Ao criar uma conta, você concorda com nossos <span className="text-violet-500/50 hover:text-violet-500 cursor-pointer">Termos de uso</span> e <span className="text-violet-500/50 hover:text-violet-500 cursor-pointer">Segurança</span>.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-2xl py-5 text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_10px_40px_-10px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                >
                  {loading ? (
                     <>
                       <Settings className="animate-spin" size={16} />
                       Criando Conta...
                     </>
                  ) : (
                    <>
                      Criar Conta Agora
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/login" className="text-[10px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.3em]">
                   Já possui acesso? <span className="text-violet-500">Fazer Login</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
         <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-white">
           OrcaFácil Technical Environment © 2026 // v1.5.0
         </p>
      </div>

    </div>
  );
}