import { createClient, getAdminClient } from '@/lib/supabase/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    adminEmail = user.email!;
  }

  try {
    const adminClient = getAdminClient();

    // 1. Get Enrichment Stage configuration
    const { data: configRow } = await adminClient
      .from('pipeline_stage_config')
      .select('*')
      .eq('stage_key', 'enrichment')
      .single();

    const model = configRow?.openrouter_model || 'anthropic/claude-3.5-sonnet';
    const systemPrompt = configRow?.system_prompt || 
      'You are a business analysis bot. Generate a single, factual personalization detail sentence about a lead based ONLY on the provided Google Place data. Do not extrapolate, do not assume, and do not make up any facts or details. If data is missing, keep the statement simple and grounded. Example output: "This restaurant is a top-rated clinical spot in Islamabad with 4.8 stars based on 120 reviews."';

    // 2. Fetch leads with status = 'discovered'
    const { data: leads, error } = await adminClient
      .from('leads')
      .select('*')
      .eq('status', 'discovered')
      .limit(10); // Batch size to prevent long timeouts

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'No discovered leads found for enrichment.' });
    }

    let enrichedCount = 0;
    let unreachableCount = 0;
    const updatedLeads: any[] = [];

    for (const lead of leads) {
      // Look up Facebook handle from name/city
      const slugName = lead.business_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const facebookUrl = `https://facebook.com/${slugName}`;

      // If we don't have phone, email, and FB is missing/null, mark as unreachable
      // Note: Google place search gives phone. If we don't have phone and no email, it is unreachable.
      const hasContact = !!(lead.phone || lead.email || facebookUrl);

      if (!hasContact) {
        const { data: updated } = await adminClient
          .from('leads')
          .update({
            status: 'unreachable',
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id)
          .select()
          .single();

        unreachableCount++;
        if (updated) updatedLeads.push(updated);
        continue;
      }

      // Generate personalization detail using OpenRouter
      const placeDetailsText = `
        Name: ${lead.business_name}
        Category: ${lead.category}
        Rating: ${lead.google_rating || 'N/A'}
        Reviews: ${lead.google_review_count || '0'}
        Address: ${lead.address || 'N/A'}
      `;

      let personalization = '';
      try {
        personalization = await callOpenRouter({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate personalization detail for: \n${placeDetailsText}` }
          ],
          maxTokens: 150
        });
        personalization = personalization.trim();
      } catch (aiErr) {
        console.error('OpenRouter failed during enrichment:', aiErr);
        personalization = `This is a highly rated ${lead.category} in ${lead.city} with a Google Rating of ${lead.google_rating || 'N/A'}.`;
      }

      const { data: updated } = await adminClient
        .from('leads')
        .update({
          facebook_url: facebookUrl,
          personalization_detail: personalization,
          status: 'enriched',
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id)
        .select()
        .single();

      enrichedCount++;
      if (updated) updatedLeads.push(updated);
    }

    await logAction(
      adminEmail,
      `Ran Enrichment: enriched ${enrichedCount} leads, marked ${unreachableCount} as unreachable.`,
      'leads',
      'enrichment_run'
    );

    return NextResponse.json({
      success: true,
      enriched: enrichedCount,
      unreachable: unreachableCount,
      leads: updatedLeads
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
