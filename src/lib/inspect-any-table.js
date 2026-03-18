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

const tableName = process.argv[2] || 'financeiro';

async function inspectTable() {
  console.log(`Inspecting ${tableName} columns...`);
  
  // Test common columns for financial/budgets
  const columnsToTest = [
    'id', 'user_id', 'orcamento_id', 'descricao', 'valor', 'tipo', 'categoria', 
    'status', 'data', 'created_at', 'vencimento', 'pago'
  ];
  
  for (const col of columnsToTest) {
    const { error } = await supabase.from(tableName).select(col).limit(1);
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        // Skip
      } else {
        console.log(`Column ${col}: ERROR -> ${error.message}`);
      }
    } else {
      console.log(`Column ${col}: EXISTS`);
    }
  }
}

inspectTable();
