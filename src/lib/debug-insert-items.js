const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Testing insert into itens_orcamento...');
  
  // 1. Get a budget ID to use as reference
  const { data: orcamentos, error: orcError } = await supabase.from('orcamentos').select('id').limit(1);
  if (orcError || !orcamentos || orcamentos.length === 0) {
    console.error('No budgets found to test with.');
    return;
  }
  const orcId = orcamentos[0].id;
  console.log('Using budget ID:', orcId);

  // 2. Try to insert an item (Note: this will fail RLS if not authenticated, but we want to see the error)
  // Actually, let's try to see if we can get a schema error vs an RLS error.
  const { data, error } = await supabase.from('itens_orcamento').insert([
    {
      orcamento_id: orcId,
      descricao: 'Teste de Inserção',
      quantidade: 1,
      valor_unitario: 100,
      tipo: 'servico'
    }
  ]).select();

  if (error) {
    console.log('Insert Error Status:', error.code);
    console.log('Insert Error Message:', error.message);
    console.log('Insert Error Details:', error.details);
    console.log('Insert Error Hint:', error.hint);
  } else {
    console.log('Insert Success:', data);
  }
}

testInsert();
