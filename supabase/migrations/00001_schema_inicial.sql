-- MASTER SCHEMA MIGRATION: 00001_schema_inicial.sql
-- Compilação de todas as lógicas isoladas de negócio e banco de dados do projeto OrcaFácil

-- 1. TABELA DE SERVIÇOS
CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC DEFAULT 0,
    custo NUMERIC,
    markup_pct NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own services" ON public.servicos;
DROP POLICY IF EXISTS "Users can view their own services" ON public.servicos;
DROP POLICY IF EXISTS "Users can update their own services" ON public.servicos;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.servicos;

CREATE POLICY "Users can insert their own services" ON public.servicos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own services" ON public.servicos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own services" ON public.servicos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own services" ON public.servicos FOR DELETE USING (auth.uid() = user_id);

-- 2. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_unitario NUMERIC DEFAULT 0,
    unidade TEXT,
    marca TEXT,
    modelo TEXT,
    custo NUMERIC,
    markup_pct NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own products" ON public.produtos;
DROP POLICY IF EXISTS "Users can view their own products" ON public.produtos;
DROP POLICY IF EXISTS "Users can update their own products" ON public.produtos;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.produtos;

CREATE POLICY "Users can insert their own products" ON public.produtos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own products" ON public.produtos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.produtos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.produtos FOR DELETE USING (auth.uid() = user_id);

-- 3. UPDATES NA TABELA PROFILES (Billing e Visual Premium)
-- Garante RLS e injeta colunas de configuração e faturamento do usuário
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_validade INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS pdf_condicoes TEXT DEFAULT 'Pagamento à vista ou via PIX. Validade da proposta conforme campo acima.',
ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

COMMENT ON COLUMN public.profiles.plan_name IS 'Nome do plano atual: free, profissional, pro';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Status da assinatura no Stripe: active, canceled, past_due, etc';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. ITENS DO ORÇAMENTO (Fixes de RLS e Colunas Extras)
-- Vincula o item de orçamento diretamente ao usuário para blindagem RLS pesada e adiciona coluna 'tipo'
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='itens_orcamento' AND column_name='tipo') THEN
        ALTER TABLE public.itens_orcamento ADD COLUMN tipo TEXT DEFAULT 'servico';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='itens_orcamento' AND column_name='user_id') THEN
        ALTER TABLE public.itens_orcamento ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

ALTER TABLE public.itens_orcamento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own budget items" ON public.itens_orcamento;
CREATE POLICY "Users can manage their own budget items" ON public.itens_orcamento FOR ALL USING (auth.uid() = user_id);

-- 5. RELAÇÕES DO FINANCEIRO COM ORÇAMENTO
-- Link de rastreabilidade
ALTER TABLE IF EXISTS public.financeiro 
ADD COLUMN IF NOT EXISTS orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_financeiro_orcamento_id ON public.financeiro(orcamento_id);

-- 6. CONFIGURAÇÃO DE BUCKETS DE STORAGE (Logos de Empresa)
INSERT INTO storage.buckets (id, name, public)
SELECT 'empresa-logos', 'empresa-logos', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'empresa-logos'
);

DROP POLICY IF EXISTS "Usuários podem ver logos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios logos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Storage Policies
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'empresa-logos');

CREATE POLICY "Usuários podem gerenciar seus próprios logos" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'empresa-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuários podem deletar seus próprios logos" 
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'empresa-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
