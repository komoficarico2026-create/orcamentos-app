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

async function inspectTable() {
  console.log('Inspecting itens_orcamento columns...');
  
  // Try to query information_schema.columns via a trick (if possible) or just infer from error
  // Since we can't easily query information_schema via anon key, let's try to select and see what fails.
  const columnsToTest = ['id', 'user_id', 'orcamento_id', 'descricao', 'quantidade', 'valor_unitario', 'tipo', 'created_at'];
  
  for (const col of columnsToTest) {
    const { error } = await supabase.from('itens_orcamento').select(col).limit(1);
    if (error) {
      console.log(`Column ${col}: ERROR -> ${error.message}`);
    } else {
      console.log(`Column ${col}: EXISTS`);
    }
  }
}

inspectTable();
