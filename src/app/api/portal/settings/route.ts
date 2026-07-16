import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public endpoint — no auth required. Returns only non-sensitive portal config.
export async function GET() {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('intern_analysis_settings')
      .select('registration_open, batch_coming_soon_message, max_projects_per_intern')
      .eq('id', 1)
      .maybeSingle()

    return NextResponse.json({
      registration_open: data?.registration_open ?? false,
      batch_coming_soon_message: data?.batch_coming_soon_message ?? 'Batch 2 Registration Opening Soon!',
      max_projects_per_intern: data?.max_projects_per_intern ?? 4,
    })
  } catch {
    return NextResponse.json({
      registration_open: false,
      batch_coming_soon_message: 'Batch 2 Registration Opening Soon!',
      max_projects_per_intern: 4,
    })
  }
}
