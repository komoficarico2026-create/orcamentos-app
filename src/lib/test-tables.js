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

async function testTables() {
  console.log('Testing connection...');
  
  const { data: servicos, error: servError } = await supabase.from('servicos').select('*').limit(1);
  if (servError) {
    console.error('Error fetching servicos:', servError.message, servError.details, servError.hint);
  } else {
    console.log('servicos table ok, found:', servicos.length);
  }

  const { data: produtos, error: prodError } = await supabase.from('produtos').select('*').limit(1);
  if (prodError) {
    console.error('Error fetching produtos:', prodError.message);
  } else {
    console.log('produtos table ok, found:', produtos.length);
  }

  const { data: financeiro, error: finError } = await supabase.from('financeiro').select('*').limit(1);
  if (finError) {
    console.error('Error fetching financeiro:', finError.message);
  } else {
    console.log('financeiro table ok, found:', financeiro.length);
  }

  const { data: itens, error: itensError } = await supabase.from('itens_orcamento').select('*').limit(1);
  if (itensError) {
    console.error('Error fetching itens_orcamento:', itensError.message);
  } else {
    console.log('itens_orcamento table ok, found:', itens.length);
  }
}

testTables();
