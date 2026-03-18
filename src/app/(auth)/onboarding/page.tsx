"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, ShieldCheck, Palette, Image as ImageIcon } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Estados dos formulários (Simulados para UI)
  const [logo, setLogo] = useState<File | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [site, setSite] = useState("");
  const [cnpj, setCnpj] = useState("");
  
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [noAddress, setNoAddress] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));
  
  const handleFinish = async () => {
    setLoading(true);
    // TODO: Salvar os dados do onboarding (Empresa + Perfil) no Supabase.
    // Exemplo: await saveCompanyProfile({ whatsapp, logo, address... })
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  const renderProgress = () => {
    return (
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              step >= i ? "bg-blue-600 w-8" : "bg-blue-100"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        
        {/* Passo 1: Logo */}
        {step === 1 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 mb-6 text-blue-500">
              <Palette size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Personalize seu Orçamento</h1>
            <p className="text-slate-500 mb-8">Transmita mais confiança desde o primeiro contato.</p>
            
            {renderProgress()}

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-left">
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 mb-8 flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={20} />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Orçamentos com Logotipo têm 50% mais chances de serem aprovados de primeira.</p>
                  <p className="opacity-80">Uma marca bem apresentada transmite seriedade e diferencia você da concorrência informal.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 text-sm text-slate-700">
                <input type="checkbox" id="no-logo" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="no-logo">Não tenho logotipo ou ícone</label>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 mb-4 group-hover:scale-105 transition-transform">
                  <ImageIcon size={32} />
                </div>
                <p className="font-medium text-slate-700 mb-4">Adicione Logotipo da sua empresa</p>
                <div className="px-6 py-2 rounded-full border border-blue-200 text-blue-600 text-sm font-medium bg-white hover:bg-blue-50 transition-colors pointer-events-none">
                  ↑ carregar
                </div>
                <p className="text-xs text-slate-400 mt-4">Tamanho máximo 5MB<br/>PNG ou JPEG</p>
              </div>
            </div>
          </div>
        )}

        {/* Passo 2: Contatos */}
        {step === 2 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 mt-8">Confiança no primeiro clique</h1>
            <p className="text-slate-500 mb-8">Mostre que você é um profissional estabelecido no mercado.</p>
            
            {renderProgress()}

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-left">
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 mb-8 flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={20} />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Profissionais com redes sociais e site têm mais chances de fechar negócio.</p>
                  <p className="opacity-80">Você vai mesmo ficar pra trás? Preencha os campos abaixo agora.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Whatsapp (Opcional)
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Instagram (Opcional)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="seunegocio"
                      className="w-full rounded-r-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    CNPJ (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Passo 3: Endereço */}
        {step === 3 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 mb-6 text-blue-500">
              <MapPin size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Passe <span className="text-blue-600">+ segurança</span> com o seu endereço</h1>
            <p className="text-slate-500 mb-8">Mostre que seu negócio é estável e confiável deixando claro onde você atende.</p>
            
            {renderProgress()}

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-left">
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 mb-6 flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={20} />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Um endereço comercial completo mostra que o seu negócio possui estabilidade.</p>
                  <p className="opacity-80">Sem endereço, seu negócio parece improvisado.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 text-sm text-slate-700">
                <input 
                  type="checkbox" 
                  id="no-address" 
                  checked={noAddress}
                  onChange={(e) => setNoAddress(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
                <label htmlFor="no-address">Não tenho endereço fixo</label>
              </div>

              {!noAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">CEP</label>
                    <input type="text" value={cep} onChange={e => setCep(e.target.value)} placeholder="00000-000" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Logradouro (Rua, Av, etc)</label>
                    <input type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Rua Exemplo" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Número</label>
                    <input type="text" value={numero} onChange={e => setNumero(e.target.value)} placeholder="000" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Bairro</label>
                    <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Cidade</label>
                    <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Estado</label>
                    <input type="text" value={estado} onChange={e => setEstado(e.target.value)} placeholder="SP" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passo 4: Conclusão */}
        {step === 4 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 mb-8 shadow-sm">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Show <span className="text-slate-900">de Bola!</span></h1>
            <p className="text-slate-600 font-medium mb-12">Agora você pode criar orçamentos profissionais que conquistam mais clientes!</p>

            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 mb-8 mx-auto max-w-sm flex items-start gap-3 text-left">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={20} />
              <p className="text-sm font-medium">Dica: Quanto mais completo seu perfil, maior a chance de seus orçamentos serem aprovados!</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleFinish} 
                disabled={loading}
                className="px-8 py-3 rounded-xl border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-colors bg-white shadow-sm disabled:opacity-50"
              >
                Explorar app
              </button>
              <button 
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Preparando..." : "Criar Orçamento Profissional"}
              </button>
            </div>
          </div>
        )}

        {/* Rodapé de Navegação (Pulos / Voltar / Avançar) - Oculto no passo final */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-8 max-w-2xl mx-auto w-full px-4">
            {step > 1 ? (
              <button onClick={handleBack} className="text-slate-500 font-medium hover:text-slate-800 px-4 py-2 rounded-lg transition-colors">
                ← Voltar
              </button>
            ) : (
              <div /> // Placeholder
            )}
            
            <div className="flex items-center gap-4">
              <button onClick={handleNext} className="text-slate-400 font-medium hover:text-slate-600 px-4 py-2 border border-slate-200 rounded-lg bg-white transition-colors">
                Pular
              </button>
              <button onClick={handleNext} className="bg-blue-600 text-white font-medium px-8 py-2.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                Prosseguir →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}