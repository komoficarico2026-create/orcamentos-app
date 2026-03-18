"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import OrcamentoPdfDocument from "./OrcamentoPdfDocument";

export function DownloadButton({ profile, orcamento, fileName }: { profile: any, orcamento: any, fileName: string }) {
  return (
    <PDFDownloadLink
      document={<OrcamentoPdfDocument profile={profile} orcamento={orcamento} />}
      fileName={fileName}
      className="inline-flex rounded-2xl bg-primary px-6 py-3 text-[10px] uppercase tracking-widest font-black text-primary-foreground hover:opacity-90 transition-all shadow-2xl shadow-primary/20"
    >
      {({ loading }) => (loading ? "Preparando PDF..." : "Baixar PDF")}
    </PDFDownloadLink>
  );
}

export function Viewer({ profile, orcamento }: { profile: any, orcamento: any }) {
  return (
    <PDFViewer width="100%" height={900}>
      <OrcamentoPdfDocument profile={profile} orcamento={orcamento} />
    </PDFViewer>
  );
}
