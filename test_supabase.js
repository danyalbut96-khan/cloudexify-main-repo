const { createClient } = require('@supabase/supabase-js');

async function test() {
  console.log("Checking Environment Variables...");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("URL:", url ? "Set (" + url + ")" : "NOT SET");
  console.log("Service Role Key:", roleKey ? "Set (starts with " + roleKey.substring(0, 10) + "... length: " + roleKey.length + ")" : "NOT SET");
  console.log("Anon Key:", anonKey ? "Set (starts with " + anonKey.substring(0, 10) + "... length: " + anonKey.length + ")" : "NOT SET");

  if (!url || !roleKey) {
    console.log("Cannot test because keys are missing in current shell.");
    return;
  }

  const adminClient = createClient(url, roleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log("\nTesting admin.listUsers()...");
  const { data, error } = await adminClient.auth.admin.listUsers();
  
  if (error) {
    console.log("ERROR fetching users:", error.message || error);
  } else {
    console.log("SUCCESS! Found", data.users.length, "users.");
  }
}

test();
