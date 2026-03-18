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

async function checkRLS() {
  console.log('Checking RLS policies...');
  
  // Try to select without being authenticated (as anon)
  // These should return 0 rows if RLS is on and working, or error if not allowed at all
  const tables = ['orcamentos', 'financeiro', 'clientes', 'itens_orcamento', 'profiles'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: Possible error or denied access: ${error.message}`);
    } else {
      console.log(`Table ${table}: Accessible (returned ${data.length} rows as anon)`);
      if (data.length > 0) {
        console.warn(`WARNING: Table ${table} might be exposing data to anon users!`);
      }
    }
  }
}

checkRLS();
