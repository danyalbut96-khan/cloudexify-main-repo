import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('../landing/.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  const { data: cols, error: colError } = await supabase
    .from('information_schema.columns' as any)
    .select('table_name, column_name, data_type')
    .eq('table_schema', 'public');
    
  if (colError) {
    console.error('Error fetching schema:', colError);
  } else {
    const schema: Record<string, any[]> = {};
    for (const row of cols) {
      if (!schema[row.table_name]) schema[row.table_name] = [];
      schema[row.table_name].push({ col: row.column_name, type: row.data_type });
    }
    console.log(JSON.stringify(schema, null, 2));
  }
}

checkSchema();
