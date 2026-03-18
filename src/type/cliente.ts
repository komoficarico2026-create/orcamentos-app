export type Cliente = {
  id: string;
  user_id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  created_at: string;
};