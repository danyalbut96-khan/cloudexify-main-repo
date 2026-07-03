import { getAdminClient } from '@/lib/supabase/server';
import { getStoredCredential } from '@/lib/ai/openrouter';
import { isRateLimited } from '@/lib/utils';
import { logAction } from '@/lib/server-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Support CRON authentication
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  let adminEmail = 'system@vercel-cron.local';
  if (!isCron) {
    // If not cron, check active user session
    const supabase = getAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    adminEmail = user.email!;
  }

  try {
    const adminClient = getAdminClient();

    // 1. Get Google Places credential
    const googleCreds = await getStoredCredential('google_places');
    const apiKey = googleCreds?.apiKey;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Places API key is not configured.' }, { status: 400 });
    }

    // 2. Fetch Discovery Stage config
    const { data: configRow } = await adminClient
      .from('pipeline_stage_config')
      .select('*')
      .eq('stage_key', 'discovery')
      .single();

    const city = configRow?.config?.city || 'Islamabad';
    const categories = configRow?.config?.categories || ['restaurant', 'clinic', 'beauty_salon'];

    let discoveredCount = 0;
    let processedCount = 0;
    const addedLeads: any[] = [];

    // 3. Run search per category
    for (const category of categories) {
      const searchTerms = `${category.replace('_', ' ')}s in ${city}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerms)}&key=${apiKey}`;

      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) {
        console.error(`Places search failed for ${searchTerms}`);
        continue;
      }

      const searchData = await searchRes.json();
      if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
        console.error(`Places search status error: ${searchData.status}`);
        continue;
      }

      const results = searchData.results || [];
      // Restrict results per category to prevent API rate/timeout issues in one pass
      const limitedResults = results.slice(0, 10);

      for (const place of limitedResults) {
        processedCount++;
        const placeId = place.place_id;

        // Fetch Details for website verification
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        if (!detailsRes.ok) continue;

        const detailsData = await detailsRes.json();
        const detail = detailsData.result;
        if (!detail) continue;

        // Filter: Business must NOT have a website to qualify for the leadgen list
        if (!detail.website) {
          const { data: inserted, error: insertError } = await adminClient
            .from('leads')
            .insert({
              business_name: detail.name,
              category,
              city,
              address: detail.formatted_address || null,
              phone: detail.formatted_phone_number || null,
              google_place_id: placeId,
              google_rating: detail.rating || null,
              google_review_count: detail.user_ratings_total || null,
              status: 'discovered'
            })
            .select()
            .maybeSingle();

          if (!insertError && inserted) {
            discoveredCount++;
            addedLeads.push(inserted);
          }
        }
      }
    }

    await logAction(
      adminEmail,
      `Ran Discovery: processed ${processedCount} places, added ${discoveredCount} website-less leads.`,
      'leads',
      'discovery_run'
    );

    return NextResponse.json({
      success: true,
      processed: processedCount,
      discovered: discoveredCount,
      leads: addedLeads
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
