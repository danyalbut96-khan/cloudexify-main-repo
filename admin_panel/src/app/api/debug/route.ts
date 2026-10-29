import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: tData } = await supabase.from('testimonials').select('*').limit(1)
  const { data: fData } = await supabase.from('intern_feedbacks').select('*').limit(1)
  const { data: wData } = await supabase.from('waitlist_subscribers').select('*').limit(1)
  
  return NextResponse.json({
    testimonials: tData,
    feedbacks: fData,
    waitlist: wData
  })
}
