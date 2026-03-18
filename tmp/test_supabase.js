// Using native fetch

const supabaseUrl = 'https://dotxyittbhajkejlftic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHh5aXR0YmhhamtlamxmdGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4Mjg3NjMsImV4cCI6MjA4ODQwNDc2M30.FOLgRaJ9ZKeMudnmz7ac0p2NWfMqJf7vfijRviK80D4';

async function testSupabase() {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        });
        
        if (response.ok) {
            console.log('--- SUPABASE STATUS ---');
            console.log('Connection: SUCCESS');
            console.log('HTTP Status:', response.status);
            const data = await response.json();
            console.log('Response:', JSON.stringify(data));
        } else {
            console.log('--- SUPABASE STATUS ---');
            console.log('Connection: FAILED');
            console.log('HTTP Status:', response.status);
            const text = await response.text();
            console.log('Error:', text);
        }
    } catch (err) {
        console.error('--- SUPABASE ERROR ---');
        console.error(err.message);
    }
}

testSupabase();
