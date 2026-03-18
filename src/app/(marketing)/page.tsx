"use client";

import { motion } from "framer-motion";
import { 
  Check, 
  ChevronRight, 
  CircleHelp, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Settings, 
  Zap, 
  MousePointer2,
  FileText,
  BarChart3,
  Globe
} from "lucide-react";
import Link from "next/link";

// --- Configuration & Data ---

const container = "mx-auto w-full max-w-7xl px-6 md:px-8";
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const trustBadges = [
  "+50.000 orçamentos profissionais gerados",
  "Fechamento 3x mais rápido",
  "Acesso imediato à plataforma",
];

const steps = [
  {
    tag: "ETAPA 01",
    title: "MAPEAMENTO DE VALOR",
    desc: "Defina seus serviços e produtos com lógica de lucro real, eliminando o 'preço no chute'.",
    icon: TrendingUp,
  },
  {
    tag: "ETAPA 02",
    title: "ESTRUTURA DE IMPACTO",
    desc: "Gere PDFs com design de elite que passam autoridade imediata para o seu cliente.",
    icon: Flame,
  },
  {
    tag: "ETAPA 03",
    title: "GESTÃO DE TRAÇÃO",
    desc: "Acompanhe aprovações e recebimentos com controle total da sua saúde financeira.",
    icon: ShieldCheck,
  },
];

const included = [
  "Sistema de Orçamentos de Elite",
  "Gestão Financeira Simplificada",
  "Dashboard de Performance Real",
  "Catálogo de Serviços Digital",
  "Suporte Prioritário Exclusivo",
  "Acesso via Web & Mobile",
];

const faqItems = [
  {
    q: "O OrcaFácil serve para qualquer tipo de serviço?",
    a: "Sim. O método e a plataforma foram desenhados para qualquer prestador que queira sair do amadorismo: de eletricistas a consultores de marketing.",
  },
  {
    q: "Preciso baixar algum aplicativo?",
    a: "Não. O OrcaFácil é 100% na nuvem. Você acessa de qualquer lugar, direto pelo navegador do PC ou celular.",
  },
  {
    q: "Como funciona o envio do orçamento?",
    a: "Com um clique, você gera um link profissional ou um PDF de alta qualidade para enviar via WhatsApp ou E-mail.",
  },
  {
    q: "Os dados dos meus clientes estão seguros?",
    a: "Sim. Utilizamos criptografia de nível bancário e infraestrutura global via Supabase para garantir total privacidade e segurança.",
  },
];

// --- Sub-components ---

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-violet-400 backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
      {children}
    </div>
  );
}

function PrimaryButton({ href = "/login", children }: { href?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-7 py-4 text-sm font-black uppercase tracking-[0.06em] text-white shadow-[0_0_45px_rgba(139,92,246,0.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_65px_rgba(139,92,246,0.5)] md:px-9 md:py-5 md:text-base"
    >
      {children}
      <ChevronRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

function OfferCard({
  label,
  title,
  items,
  oldPrice,
  price,
  href,
  cta,
  featured = false,
}: {
  label: string;
  title: string;
  items: string[];
  oldPrice: string;
  price: string;
  href: string;
  cta: string;
  featured?: boolean;
}) {
  return (
    <motion.div
      {...fadeUp}
      className={`relative rounded-[2.5rem] border ${
        featured ? "border-violet-500/30 bg-violet-600/10 shadow-[0_0_65px_rgba(139,92,246,0.2)]" : "border-white/10 bg-white/[0.02]"
      } backdrop-blur-xl p-10 overflow-hidden group`}
    >
      {featured && (
        <div className="absolute top-0 right-0 p-4">
          <div className="rounded-full bg-violet-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Recomendado
          </div>
        </div>
      )}
      
      <p className={`text-xs font-black uppercase tracking-[0.24em] ${featured ? "text-violet-400" : "text-white/40"}`}>{label}</p>
      <h3 className="mt-4 text-3xl font-black uppercase text-white">{title}</h3>
      
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-white/70">
            <Check size={16} className="text-violet-500 shrink-0" />
            <span className="text-sm font-medium tracking-wide">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-12 pt-8 border-t border-white/5">
        <p className="text-sm uppercase tracking-[0.2em] text-white/20 line-through">De {oldPrice}</p>
        <div className="mt-2 flex items-end gap-2 text-white">
          <span className="pb-2 text-2xl font-black">R$</span>
          <span className="text-7xl font-black leading-none">{price}</span>
        </div>
      </div>

      <div className="mt-10">
        <Link
          href={href}
          className={`inline-flex w-full items-center justify-center rounded-2xl ${
            featured ? "bg-violet-600 shadow-xl shadow-violet-600/30" : "bg-white/10"
          } px-6 py-5 text-center text-sm font-black uppercase tracking-[0.06em] text-white transition duration-300 hover:-translate-y-1 hover:bg-violet-500 group-hover:scale-[1.02]`}
        >
          {cta}
        </Link>
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-violet-500 selection:text-white overflow-hidden uppercase-none">
      
      {/* --- Top Utility Bar --- */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-white/5">
        <div className="h-full w-1/3 bg-gradient-to-r from-violet-600 via-violet-400 to-transparent" />
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
        <div className={`${container} flex items-center justify-between h-20`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-violet-600/20">O</div>
             <span className="text-xl font-black tracking-tighter text-white">OrcaFácil<span className="text-violet-500">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <Link href="#mecanismo" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Funcionalidades</Link>
            <Link href="#oferta" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Preços</Link>
            <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Entrar</Link>
            <Link href="/signup" className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-violet-600/20 transition-all">Começar Agora</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 overflow-hidden">
        
        {/* Background Hi-Tech Ecosystem */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] border border-violet-500/10 rounded-full animate-spin-slow" />
            
            {/* Corner HUD */}
            <div className="absolute top-40 left-10 w-20 h-20 border-t border-l border-white/10 hidden lg:block" />
            <div className="absolute top-40 right-10 w-20 h-20 border-t border-r border-white/10 hidden lg:block" />

            {/* Orbiting Elements */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-1/3 left-[15%] opacity-20 hidden lg:block"
            >
               <FileText size={40} strokeWidth={1} />
            </motion.div>
            <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute bottom-1/3 right-[15%] opacity-20 hidden lg:block"
            >
               <BarChart3 size={40} strokeWidth={1} />
            </motion.div>
        </div>

        {/* Orbital Horizon Arc */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[150%] aspect-square max-w-[1800px] pointer-events-none">
          <div className="absolute inset-0 rounded-full border-[1px] border-white/10" />
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: '0 -20px 80px -10px rgba(139, 92, 246, 0.3), inset 0 2px 20px rgba(255, 255, 255, 0.05)'
            }} 
          />
        </div>

        <div className={`${container} relative z-10 text-center`}>
          <motion.div {...fadeUp}>
            <SectionLabel>Sistema de Elite para Prestadores</SectionLabel>

            <h1 className="mt-10 text-6xl font-black uppercase leading-[0.9] tracking-tighter md:text-8xl lg:text-[7.5rem]">
              Você não vende pouco<br />
              <span className="bg-gradient-to-r from-violet-500 via-violet-300 to-white bg-clip-text text-transparent">
                porque trabalha mal.
              </span>
            </h1>

            <p className="mx-auto mt-10 max-w-4xl text-lg leading-relaxed text-white/50 md:text-2xl md:leading-10 font-medium">
              Você vende pouco porque o seu processo é amador. <br className="hidden md:block" />
              Abandone as planilhas e o WhatsApp bagunçado. Instale o protocolo OrcaFácil e profissionalize sua operação hoje.
            </p>

            <div className="mt-14 flex flex-col items-center gap-6 md:flex-row md:justify-center">
              <PrimaryButton>Quero Profissionalizar Minha Loja</PrimaryButton>
              <Link
                href="#mecanismo"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-[0.1em] text-white/80 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 md:px-10 md:py-5 md:text-base"
              >
                Como o Protocolo Funciona
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/30 md:text-xs">
              {trustBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/5 bg-white/[0.02] px-5 py-2.5">
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- REALITY CHECK SECTION --- */}
      <section className="border-y border-white/5 py-24 md:py-32 bg-slate-950/20">
        <div className={container}>
          <motion.div {...fadeUp} className="mx-auto max-w-5xl text-center">
            <SectionLabel>Quebra de Realidade</SectionLabel>
            <h2 className="mt-8 text-4xl font-black uppercase leading-[0.95] md:text-7xl text-white">
              Se sua operação parasse hoje,<br />
              <span className="text-white/30">você teria um negócio ou um emprego?</span>
            </h2>
            <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/40 md:text-xl font-medium">
              Amadores dependem do esforço. Profissionais dependem de processos. <br />
              Onde você está perdendo tempo agora?
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-3">
            {[
              "Orçamentos manuais lentos",
              "Preços definidos na sorte",
              "Cobranças perdidas no chat",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/5 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition-all">
                   <Zap size={18} />
                </div>
                <p className="text-xl font-black uppercase leading-tight text-white/80 group-hover:text-white">{item}</p>
                <div className="mt-4 h-[1px] w-8 bg-white/10 group-hover:w-full group-hover:bg-violet-500 transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MECANISMO SECTION --- */}
      <section id="mecanismo" className="py-24 md:py-32">
        <div className={container}>
          <motion.div {...fadeUp} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <SectionLabel>Protocolo Operacional</SectionLabel>
              <h2 className="mt-6 text-4xl font-black uppercase leading-none md:text-6xl text-white">
                O Sistema <span className="text-violet-500">OrcaFácil.</span>
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-white/40 md:text-lg font-medium">
              Não é apenas um gerador de PDF. É um ambiente de gestão completa criado para transformar sua prestação de serviço em uma operação escalável e previsível.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="group relative rounded-[2.5rem] border border-white/10 bg-white/[0.01] p-10 transition duration-500 hover:-translate-y-2 hover:border-violet-500/20 hover:shadow-2xl hover:shadow-violet-600/10"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Icon size={120} strokeWidth={1} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-500">{step.tag}</p>
                  <h3 className="mt-6 text-2xl font-black uppercase leading-tight text-white">{step.title}</h3>
                  <p className="mt-6 text-base leading-relaxed text-white/50 font-medium">{step.desc}</p>
                  <div className="mt-10 h-1.5 w-12 rounded-full bg-violet-600 transition-all duration-500 group-hover:w-24 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="oferta" className="relative py-24 md:py-32 overflow-hidden border-y border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-violet-600/5 blur-[120px] rounded-full" />
        
        <div className={container}>
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionLabel>Investimento</SectionLabel>
            <h2 className="mt-8 text-4xl font-black uppercase md:text-7xl text-white leading-none">Profissionalismo tem preço.<br /><span className="text-white/30">O amadorismo custa caro.</span></h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/40 font-medium">
              Escolha o plano que melhor se adapta à sua tração atual e desbloqueie o próximo nível da sua operação.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-2">
            <OfferCard
              label="Plano Starter"
              title="Saindo do zero"
              items={[
                "Templates de Elite",
                "Gestão de 30 Orçamentos/mês",
                "Suporte via Email",
                "Hospedagem em Cloud",
              ]}
              oldPrice="R$ 97"
              price="37"
              href="/signup"
              cta="Ativar Plano Starter"
            />

            <OfferCard
              featured
              label="Protocolo Pro"
              title="Tração Absoluta"
              items={[
                "Tudo do Starter",
                "Orçamentos Ilimitados",
                "Gestão Financeira Completa",
                "Suporte VIP WhatsApp",
                "Dashboard de Performance",
                "Insights Estratégicos",
              ]}
              oldPrice="R$ 197"
              price="67"
              href="/signup"
              cta="Habilitar Protocolo Pro"
            />
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 md:py-32 bg-slate-950/20">
        <div className={container}>
          <motion.div {...fadeUp} className="mx-auto max-w-5xl text-center mb-16">
            <SectionLabel><CircleHelp size={14} className="inline mr-2" /> Dúvidas Frequentes</SectionLabel>
            <h2 className="mt-8 text-4xl font-black uppercase md:text-6xl text-white leading-none">Tire suas dúvidas antes de entrar no protocolo.</h2>
          </motion.div>

          <div className="mx-auto mt-12 max-w-4xl space-y-4">
            {faqItems.map((item, index) => (
              <motion.details
                key={item.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group rounded-3xl border border-white/5 bg-white/[0.01] p-8 open:border-violet-500/20 open:bg-violet-600/5 transition-all duration-300"
              >
                <summary className="cursor-pointer list-none pr-10 text-left text-lg md:text-xl font-bold uppercase leading-tight text-white/80 transition-colors group-open:text-white marker:hidden relative">
                  {item.q}
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-open:rotate-45 group-open:bg-violet-600 group-open:text-white transition-all">
                    +
                  </div>
                </summary>
                <p className="mt-8 text-base md:text-lg leading-relaxed text-white/40 font-medium border-t border-white/5 pt-6 leading-8">
                  {item.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative border-t border-white/5 bg-black/40 py-16 overflow-hidden">
        <div className={`${container}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
             <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-xl">O</div>
                   <span className="text-xl font-black tracking-tighter text-white">OrcaFácil<span className="text-violet-500">.</span></span>
                </div>
                <p className="text-white/30 text-sm max-w-sm leading-relaxed font-medium">
                  A plataforma técnica criada para transformar prestadores de serviço em empresários de elite. Atuamos na camada operacional para garantir clareza, controle e lucro.
                </p>
             </div>
             
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Navegação</h4>
                <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-white/40">
                   <li><Link href="#mecanismo" className="hover:text-violet-500 transition-colors">Funcionalidades</Link></li>
                   <li><Link href="#oferta" className="hover:text-violet-500 transition-colors">Planos</Link></li>
                   <li><Link href="/login" className="hover:text-violet-500 transition-colors">Acessar Conta</Link></li>
                </ul>
             </div>

             <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Suporte & Legal</h4>
                <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-white/40">
                   <li className="hover:text-violet-500 transition-colors cursor-pointer">Termos de Uso</li>
                   <li className="hover:text-violet-500 transition-colors cursor-pointer">Privacidade</li>
                   <li className="hover:text-violet-500 transition-colors cursor-pointer">Central de Ajuda</li>
                </ul>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-10 opacity-30">
            <p className="text-[9px] font-mono font-bold text-white uppercase tracking-[0.5em]">
              OrcaFácil Technical Environment © 2026 // v1.6.0
            </p>
            <div className="flex items-center gap-6 mt-6 md:mt-0">
               <Globe size={14} />
               <MousePointer2 size={14} />
               <ShieldCheck size={14} />
            </div>
          </div>
        </div>
      </footer>

      {/* --- Sticky Mobile CTA --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] md:hidden">
         <Link 
            href="/signup" 
            className="flex items-center justify-center gap-2 w-full bg-violet-600 h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-violet-600/40 border border-violet-400/20 active:scale-95 transition-all"
         >
            Começar Grátis Agora
            <ArrowRight size={16} />
         </Link>
      </div>

    </main>
  );
}