import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { OrcamentoPdfData, OrcamentoPdfProfile, OrcamentoPdfItem } from "@/type/orcamento-pdf";

// Configuramos fontes padrão do sistema que funcionam bem
// Nota: O react-pdf suporta fontes externas, mas Helvetica/Courier/Times são as 'standard'
// Para um look premium, vamos focar em pesos e espaçamentos.

type Props = {
  profile: OrcamentoPdfProfile | null;
  orcamento: OrcamentoPdfData | null;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    color: "#334155",
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  
  // --- Decoration Elements ---
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#0f172a",
  },

  // --- Header Section ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    width: "65%",
  },
  logo: {
    width: 64,
    height: 64,
    objectFit: "contain",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  companyDetail: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  badgeContainer: {
    width: "30%",
    alignItems: "flex-end",
  },
  badge: {
    backgroundColor: "#f8fafc",
    border: "1 solid #e2e8f0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 120,
  },
  badgeTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // --- Client & Info Section ---
  infoGrid: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 35,
    paddingBottom: 20,
    borderBottom: "1 solid #f1f5f9",
  },
  clientCol: {
    flex: 1,
  },
  infoCol: {
    width: "35%",
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  clientInfoText: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 2,
    lineHeight: 1.4,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 8,
    color: "#64748b",
  },
  recordValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e293b",
  },

  // --- Items Table ---
  table: {
    marginTop: 10,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottom: "1 solid #f1f5f9",
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#fafafa",
  },
  colDesc: { width: "55%" },
  colUnit: { width: "18%", textAlign: "right" },
  colQtd: { width: "9%", textAlign: "center" },
  colTotal: { width: "18%", textAlign: "right" },
  
  itemTitle: { fontSize: 9, fontWeight: "bold", color: "#1e293b" },
  itemPrice: { fontSize: 9, color: "#334155" },
  itemTotal: { fontSize: 9, fontWeight: "bold", color: "#0f172a" },

  // --- Summary Section ---
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 40,
  },
  notesCol: {
    flex: 1,
  },
  notesText: {
    fontSize: 8,
    color: "#64748b",
    lineHeight: 1.5,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
  },
  totalsCol: {
    width: "35%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: "1 solid #f8fafc",
  },
  totalLabel: { fontSize: 8, color: "#64748b" },
  totalValue: { fontSize: 8, fontWeight: "bold", color: "#1e293b" },
  
  grandTotalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },

  // --- Footer ---
  signatureArea: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "center",
  },
  signatureLine: {
    width: 220,
    borderTop: "1 solid #cbd5e1",
    alignItems: "center",
    paddingTop: 8,
  },
  signatureText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#334155",
  },
  
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1 solid #f1f5f9",
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
  pageNumber: {
    fontSize: 7,
    color: "#94a3b8",
  }
});

function money(value: number) {
  return `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function OrcamentoPdfDocument({ profile, orcamento }: Props) {
  const itens = orcamento?.itens || [];
  const orcNum = String(orcamento?.id || "").slice(0, 8).toUpperCase();
  const subtotal = orcamento?.valor_total || 0;

  return (
    <Document title={`Orçamento #${orcNum}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />

        {/* --- Header --- */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {profile?.logo_url ? (
              <Image src={profile.logo_url} style={styles.logo} />
            ) : (
              <View style={[styles.logo, { backgroundColor: '#f1f5f9', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#cbd5e1' }}>O</Text>
              </View>
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {profile?.company_name || profile?.name || "Sua Empresa"}
              </Text>
              <Text style={styles.companyDetail}>{profile?.company_document ? `CNPJ/CPF: ${profile.company_document}` : ""}</Text>
              <Text style={styles.companyDetail}>{profile?.company_email}</Text>
              <Text style={styles.companyDetail}>{profile?.company_phone || profile?.phone}</Text>
              <Text style={styles.companyDetail}>
                {[profile?.company_city, profile?.company_state].filter(Boolean).join(" - ")}
              </Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeTitle}>Proposta Comercial</Text>
              <Text style={styles.badgeValue}>#{orcNum}</Text>
            </View>
          </View>
        </View>

        {/* --- Info Grid --- */}
        <View style={styles.infoGrid}>
          <View style={styles.clientCol}>
            <Text style={styles.sectionTitle}>Cliente / Destinatário</Text>
            <Text style={styles.clientName}>{orcamento?.clientes?.nome || "Cliente Padrão"}</Text>
            <Text style={styles.clientInfoText}>{orcamento?.clientes?.endereco}</Text>
            <Text style={styles.clientInfoText}>
              {orcamento?.clientes?.email} {orcamento?.clientes?.email && orcamento?.clientes?.telefone ? "•" : ""} {orcamento?.clientes?.telefone}
            </Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.sectionTitle}>Detalhes do Orçamento</Text>
            <View style={styles.dataRow}>
              <Text style={styles.recordLabel}>Emissão:</Text>
              <Text style={styles.recordValue}>{orcamento?.created_at ? formatDate(orcamento.created_at) : "-"}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.recordLabel}>Vencimento:</Text>
              <Text style={styles.recordValue}>{profile?.pdf_validade || 15} dias</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.recordLabel}>Status:</Text>
              <Text style={[styles.recordValue, { color: '#2563eb' }]}>Orçamento</Text>
            </View>
          </View>
        </View>

        {/* --- Items Table --- */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}><Text style={styles.tableHeaderText}>Descrição dos Serviços / Materiais</Text></View>
            <View style={styles.colUnit}><Text style={styles.tableHeaderText}>Preço Unit.</Text></View>
            <View style={styles.colQtd}><Text style={styles.tableHeaderText}>Qtd.</Text></View>
            <View style={styles.colTotal}><Text style={styles.tableHeaderText}>Subtotal</Text></View>
          </View>

          {itens.map((item: OrcamentoPdfItem, index) => (
            <View key={item.id} style={[styles.tableRow, index % 2 === 0 ? {} : styles.tableRowEven]}>
              <View style={styles.colDesc}>
                <Text style={styles.itemTitle}>{item.descricao}</Text>
              </View>
              <View style={styles.colUnit}>
                <Text style={styles.itemPrice}>{money(item.valor_unitario)}</Text>
              </View>
              <View style={styles.colQtd}>
                <Text style={styles.itemPrice}>{item.quantidade}</Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={styles.itemTotal}>
                  {money(Number(item.quantidade) * Number(item.valor_unitario))}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* --- Summary & Totals --- */}
        <View style={styles.summarySection}>
          <View style={styles.notesCol}>
            <Text style={styles.sectionTitle}>Notas & Condições</Text>
            <Text style={styles.notesText}>
              {profile?.pdf_condicoes || "Validade da proposta conforme campo de data. Pagamento via PIX ou transferência bancária. Início da execução mediante aprovação deste orçamento."}
            </Text>
          </View>

          <View style={styles.totalsCol}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{money(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descontos</Text>
              <Text style={styles.totalValue}>{money(0)}</Text>
            </View>
            <View style={styles.grandTotalBox}>
              <Text style={styles.grandTotalLabel}>Total Geral</Text>
              <Text style={styles.grandTotalValue}>{money(subtotal)}</Text>
            </View>
          </View>
        </View>

        {/* --- Signature --- */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>{orcamento?.clientes?.nome || "Assinatura do Cliente"}</Text>
            <Text style={{ fontSize: 6, color: '#94a3b8', marginTop: 2 }}>Aceite Digital / Física</Text>
          </View>
        </View>

        {/* --- Footer --- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Gerado com OrcaFácil • orcafacil.com.br</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} fixed />
        </View>
      </Page>
    </Document>
  );
}