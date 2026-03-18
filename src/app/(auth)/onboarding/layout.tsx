import { FileText } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Header Fixo Simples (Apenas a logo no topo da tela estilo Profissa) */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-center z-50 pointer-events-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <FileText size={24} />
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 w-full flex flex-col pt-16">
        {children}
      </div>
    </div>
  );
}
