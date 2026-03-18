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

async function checkSchema() {
  console.log('Checking schema for itens_orcamento...');
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'itens_orcamento' });
  
  if (error) {
    // If RPC doesn't exist, try a direct query to information_schema if possible (usually not via anon key)
    console.error('RPC Error (likely get_table_columns not defined):', error.message);
    
    // Fallback: try to insert a dummy row to see what errors we get
    console.log('Attempting dummy insert to see schema errors...');
    const { error: insertError } = await supabase.from('itens_orcamento').insert({}).select();
    if (insertError) {
        console.log('Insert Error feedback:', insertError.message);
    }
  } else {
    console.log('Columns:', data);
  }
}

checkSchema();
