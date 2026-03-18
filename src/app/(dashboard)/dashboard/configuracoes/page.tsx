"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User as UserIcon, 
  Upload, 
  Image as ImageIcon,
  X,
  FileText,
  Clock,
  Wallet
} from "lucide-react";
import { motion } from "framer-motion";

type UserProfile = {
  id?: string;
  name: string;
  company_name: string;
  company_document: string;
  company_phone: string;
  company_email: string;
  company_city: string;
  company_state: string;
  logo_url: string | null;
  pdf_validade: number;
  pdf_condicoes: string;
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    company_name: "",
    company_document: "",
    company_phone: "",
    company_email: "",
    company_city: "",
    company_state: "",
    logo_url: null,
    pdf_validade: 15,
    pdf_condicoes: "Pagamento à vista ou via PIX. Validade da proposta conforme campo acima.",
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (!profileError && data) {
        setProfile({
          id: data.id,
          name: data.name || "",
          company_name: data.company_name || "",
          company_document: data.company_document || "",
          company_phone: data.company_phone || "",
          company_email: data.company_email || "",
          company_city: data.company_city || "",
          company_state: data.company_state || "",
          logo_url: data.logo_url || null,
          pdf_validade: data.pdf_validade || 15,
          pdf_condicoes: data.pdf_condicoes || "Pagamento à vista ou via PIX. Validade da proposta conforme campo acima.",
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [router]);


  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        user_id: userData.user.id,
        name: profile.name,
        company_name: profile.company_name,
        company_document: profile.company_document,
        company_phone: profile.company_phone,
        company_email: profile.company_email,
        company_city: profile.company_city,
        company_state: profile.company_state,
        logo_url: profile.logo_url,
        pdf_validade: profile.pdf_validade,
        pdf_condicoes: profile.pdf_condicoes,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    setSaving(false);

    if (updateError) {
      toast.error("Erro ao salvar configurações.");
    } else {
      toast.success("Configurações atualizadas!");
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('empresa-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('empresa-logos')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, logo_url: publicUrl }));
      
      // Auto-salva no banco para evitar confusão do usuário
      await supabase
        .from("profiles")
        .upsert({
          user_id: userData.user.id,
          logo_url: publicUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      toast.success("Logo carregado e salvo com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao fazer upload da imagem. Certifique-se que o bucket existe.");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(field: keyof UserProfile, value: any) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest animate-pulse">Carregando perfil premium...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground/80 p-8 font-sans transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[10px] font-black text-foreground/40 hover:text-primary uppercase tracking-[0.2em] transition-colors mb-6 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar ao Início
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
               <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Settings</h1>
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1">Controle total da sua identidade corporativa</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Sessão 1: Identidade Visual */}
          <section className="bg-card/40 rounded-[3rem] p-10 border border-border/10 backdrop-blur-xl shadow-2xl shadow-primary/5 relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-10 px-1 flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                 <ImageIcon size={14} />
              </div> 
              Branding & Identidade
            </h3>

            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-[2.5rem] bg-background/50 border-2 border-dashed border-border/20 flex items-center justify-center overflow-hidden transition-all hover:border-primary/50 group/logo shadow-inner">
                  {profile.logo_url ? (
                    <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center">
                       <ImageIcon className="w-12 h-12 text-foreground/10 mx-auto mb-2" />
                       <span className="text-[8px] font-bold text-foreground/20 uppercase">Sem logo</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {profile.logo_url && (
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, logo_url: null }))}
                    className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all flex items-center justify-center border-4 border-card"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h4 className="text-lg font-black text-foreground tracking-tight mb-2">Logotipo Corporativo</h4>
                  <p className="text-[10px] font-bold text-foreground/30 uppercase leading-relaxed max-w-xs tracking-wider">
                    Será exibido nos orçamentos e comunicações oficiais. PNG/JPG fundo transparente sugerido.
                  </p>
                </div>
                
                <label className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20">
                  <Upload size={16} />
                  {profile.logo_url ? "Substituir Imagem" : "Carregar Identidade"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          </section>

          {/* Sessão 2: Dados da Empresa */}
          <section className="bg-card/40 rounded-[3rem] p-10 border border-border/10 backdrop-blur-xl shadow-2xl shadow-primary/5">
            <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-10 px-1 flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                 <Building2 size={14} />
              </div>
              Dados do Emissor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                  <UserIcon size={12} /> Responsável Técnico / Assinatura
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Empresa (Razão Social/Fantasia)</label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  placeholder="Nome do seu negócio"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">CNPJ / CPF / Documento</label>
                <input
                  type="text"
                  value={profile.company_document}
                  onChange={(e) => handleChange("company_document", e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Canal WhatsApp (Vendas)</label>
                <input
                  type="text"
                  value={profile.company_phone}
                  onChange={(e) => handleChange("company_phone", e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">E-mail Profissional</label>
                <input
                  type="email"
                  value={profile.company_email}
                  onChange={(e) => handleChange("company_email", e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  placeholder="financeiro@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Cidade Sede</label>
                <input
                  type="text"
                  value={profile.company_city}
                  onChange={(e) => handleChange("company_city", e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  placeholder="Ex: São Paulo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">UF</label>
                <input
                  type="text"
                  value={profile.company_state}
                  onChange={(e) => handleChange("company_state", e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner uppercase"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </section>

          {/* Sessão 3: Regras do Negócio / PDF */}
          <section className="bg-card/40 rounded-[3rem] p-10 border border-border/10 backdrop-blur-xl shadow-2xl shadow-primary/5">
            <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-10 px-1 flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                 <FileText size={14} />
              </div>
              Business Logic & PDF Engine
            </h3>

            <div className="space-y-8">
              <div className="max-w-xs space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                  <Clock size={12} /> Validade Padrão (Dias)
                </label>
                <input
                  type="number"
                  value={profile.pdf_validade}
                  onChange={(e) => handleChange("pdf_validade", Number(e.target.value))}
                  className="w-full bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-black text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                  <Wallet size={12} /> Cláusulas de Pagamento & Notas Legais
                </label>
                <textarea
                  value={profile.pdf_condicoes}
                  onChange={(e) => handleChange("pdf_condicoes", e.target.value)}
                  className="w-full bg-background/50 border border-border/10 rounded-[2rem] px-6 py-6 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner h-40 resize-none leading-relaxed"
                  placeholder="Ex: Pagamento 50% no aceite e 50% na conclusão via PIX..."
                />
              </div>
            </div>
          </section>

          <footer className="flex items-center justify-end pt-6 pb-20">
            <button
              type="submit"
              disabled={saving}
              className="px-12 py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? "Salvando Protocolos..." : "Atualizar Sistema Master"}
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
}
