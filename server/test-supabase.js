// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('_prisma_migrations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error (expected for first time):', error.message);
    } else {
      console.log('✅ Connection successful!');
    }
    
    // Test raw SQL query
    const { data: rawData, error: rawError } = await supabase
      .rpc('version');
    
    if (rawError) {
      console.log('Raw query error:', rawError.message);
    } else {
      console.log('✅ Raw query successful!');
    }
    
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

testConnection();
