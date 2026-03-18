"use client";

import { LifeBuoy, MessageSquare, Mail, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SuportePage() {
  const WHATSAPP_NUMBER = "5511999999999"; // Exemplo
  const SUPPORT_EMAIL = "suporte@profissa.com.br";

  return (
    <main className="min-h-screen bg-background text-foreground/80 p-8 font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* Premium Glass Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <LifeBuoy size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Support</h1>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1">Central de ajuda e atendimento prioritário</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1100px] mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
           <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-4 leading-none">Como podemos <span className="text-primary">te ajudar?</span></h2>
           <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Escolha o canal de comunicação preferencial</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* WhatsApp Bento Card */}
          <motion.a 
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 rounded-[3rem] p-10 border border-border/10 shadow-2xl shadow-primary/5 backdrop-blur-xl group hover:border-emerald-500/30 transition-all flex flex-col h-full overflow-hidden relative"
          >
            <div className="w-16 h-16 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-emerald-500/20">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Atendimento WhatsApp</h3>
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest leading-relaxed mb-10 flex-1">
              Fale com nosso time técnico em tempo real para dúvidas operacionais urgentes.
            </p>
            <div className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] w-fit shadow-xl shadow-emerald-500/20 group-hover:bg-emerald-700 transition-all">
               Iniciar Chat <ExternalLink size={14} />
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </motion.a>

          {/* Email Bento Card */}
          <motion.a 
            href={`mailto:${SUPPORT_EMAIL}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/40 rounded-[3rem] p-10 border border-border/10 shadow-2xl shadow-primary/5 backdrop-blur-xl group hover:border-primary/30 transition-all flex flex-col h-full overflow-hidden relative"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-primary/20">
              <Mail size={32} />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Suporte por E-mail</h3>
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest leading-relaxed mb-10 flex-1">
              Para questões administrativas, sugestões ou relatórios. Respondemos em até 24h úteis.
            </p>
            <div className="flex items-center gap-2 px-8 py-4 bg-background/50 border border-border/10 rounded-2xl">
               <span className="text-[10px] font-black text-primary tracking-widest uppercase">{SUPPORT_EMAIL}</span>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </motion.a>
        </div>

        {/* Knowledge Base Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary rounded-[3.5rem] p-12 text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20 group"
        >
           <div className="relative z-10 max-w-lg">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest mb-8 backdrop-blur-md border border-white/10">
                <LifeBuoy size={12} /> Autoatendimento
             </div>
             <h2 className="text-5xl font-black mb-6 tracking-tighter leading-none">Base de Conhecimento</h2>
             <p className="text-primary-foreground/70 text-sm font-medium mb-12 leading-relaxed">
               Aprenda a dominar todas as ferramentas da plataforma com nossos tutoriais e artigos passo a passo. 
               Otimize seus fluxos de trabalho agora.
             </p>
             <button className="px-10 py-5 bg-white text-primary font-black rounded-2xl hover:opacity-90 transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10">
               Explorar Tutoriais
             </button>
           </div>
           
           <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-10 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
             <LifeBuoy size={400} />
           </div>

           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* FAQs Short Link */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="text-center pb-20"
        >
           <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
             Ainda tem dúvidas? <button className="text-primary hover:underline underline-offset-4 decoration-2">Consulte nosso FAQ Master</button>
           </p>
        </motion.div>
      </div>
    </main>
  );
}
