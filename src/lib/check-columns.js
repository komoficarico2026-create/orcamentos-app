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

async function checkColumns() {
  console.log('Checking columns for itens_orcamento...');
  const { data, error } = await supabase.from('itens_orcamento').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Columns found in item:', data.length > 0 ? Object.keys(data[0]) : 'No data to infer columns');
  }
}

checkColumns();
