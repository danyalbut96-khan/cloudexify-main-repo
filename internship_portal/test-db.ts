import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  // Test testimonials fetch
  console.log('Fetching testimonials...');
  const { data: tData, error: tError } = await supabase.from('testimonials').select('*').limit(1);
  if (tError) console.error('Testimonials Error:', tError);
  else console.log('Testimonials Columns:', Object.keys(tData[0] || {}));

  // Test batches fetch
  console.log('Fetching batches...');
  const { data: bData, error: bError } = await supabase.from('batches').select('*').limit(1);
  if (bError) console.error('Batches Error:', bError);
  else console.log('Batches Columns:', Object.keys(bData[0] || {}));

  // Test the exact query we are using in Testimonials.tsx
  console.log('Testing exact Testimonials.tsx query...');
  const { data: exactData, error: exactError } = await supabase
    .from('testimonials')
    .select(`
      id,
      rating,
      review_text,
      batch_name,
      created_at,
      interns (
        full_name,
        university,
        semester,
        profile_picture_url
      )
    `)
    .limit(1);
  
  if (exactError) console.error('Exact Query Error:', exactError);
  else console.log('Exact Query Success!', exactData);
}

checkSchema();
