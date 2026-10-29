// Safe local environment check only. This script deliberately makes no database
// requests and never prints credentials or lists production user records.
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

let missing = false;
for (const name of required) {
  const configured = Boolean(process.env[name]);
  console.log(`${name}: ${configured ? 'configured' : 'missing'}`);
  if (!configured) missing = true;
}

if (missing) {
  console.error('Set the required variables in a trusted local environment before running the app.');
  process.exitCode = 1;
} else {
  console.log('Environment variables are present. No credentials were printed and no database request was made.');
}
