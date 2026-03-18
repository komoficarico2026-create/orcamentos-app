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

async function inspectProfiles() {
  console.log('Inspecting profiles table...');
  
  const columnsToTest = [
    'user_id', 
    'name', 
    'company_name', 
    'company_document', 
    'company_phone', 
    'company_email', 
    'company_city', 
    'company_state', 
    'updated_at'
  ];
  
  for (const col of columnsToTest) {
    const { error } = await supabase.from('profiles').select(col).limit(1);
    if (error) {
      console.log(`Column ${col}: ERROR -> ${error.message}`);
    } else {
      console.log(`Column ${col}: EXISTS`);
    }
  }
}

inspectProfiles();
