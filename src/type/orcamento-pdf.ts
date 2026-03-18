export type OrcamentoPdfItem = {
  id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
};

export type OrcamentoPdfProfile = {
  name: string | null;
  phone: string | null;
  company_name: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_document: string | null;
  company_city: string | null;
  company_state: string | null;
  logo_url: string | null;
  pdf_validade: number | null;
  pdf_condicoes: string | null;
};

export type OrcamentoPdfCliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
};

export type OrcamentoPdfData = {
  id: string;
  descricao: string | null;
  valor_total: number;
  created_at: string;
  status: string;
  clientes: OrcamentoPdfCliente | null;
  itens: OrcamentoPdfItem[];
};