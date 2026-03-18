export type ClienteOption = {
  id: string;
  nome: string;
};

export type OrcamentoItemInput = {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
};

export type OrcamentoListItem = {
  id: string;
  descricao: string | null;
  valor_total: number;
  created_at: string;
  clientes?: {
    nome: string;
  } | null;
};