const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function getColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'intern_projects' });
  if (error) {
     // fallback if rpc is not there
     const { data: d2, error: e2 } = await supabase.from('intern_projects').select('*').limit(1);
     if (d2) {
         console.log(Object.keys(d2[0]));
     } else {
         console.error(e2);
     }
  } else {
    console.log(data);
  }
}
getColumns();
