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

async function verifyColumn() {
  console.log('Verifying if user_id exists in itens_orcamento...');
  // We can't insert a real one easily without a valid orcamento_id, but we can try to select with it.
  const { error } = await supabase.from('itens_orcamento').select('user_id').limit(1);
  if (error) {
    console.log('Error selecting user_id:', error.message);
    if (error.message.includes('column "user_id" does not exist')) {
        console.log('CONFIRMED: user_id column does NOT exist.');
    } else {
        console.log('Other error (maybe RLS):', error.message);
    }
  } else {
    console.log('SUCCESS: user_id column exists or at least the query didn\'t fail on the column name.');
  }
}

verifyColumn();
