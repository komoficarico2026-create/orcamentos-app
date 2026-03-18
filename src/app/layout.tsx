import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "OrcaFácil — Orçamentos Profissionais para Prestadores de Serviço",
  description: "A plataforma nº 1 para criar orçamentos profissionais, gerenciar clientes e controlar seu financeiro. Feito para autônomos e pequenas empresas.",
  keywords: ["orçamento", "prestador de serviço", "gestão financeira", "SaaS", "autônomo", "nota fiscal", "proposta comercial"],
  authors: [{ name: "OrcaFácil Team" }],
  openGraph: {
    title: "OrcaFácil — Orçamentos Profissionais em Minutos",
    description: "Crie propostas de elite e receba pagamentos com mais facilidade.",
    url: "https://orcafacil.com.br",
    siteName: "OrcaFácil",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrcaFácil — Orçamentos Profissionais",
    description: "Transforme sua gestão de orçamentos hoje mesmo.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark"]}
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}