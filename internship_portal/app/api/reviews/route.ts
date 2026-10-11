import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('intern_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { internId, rating, reviewText, batchName } = await req.json();

    if (!internId || !rating || !reviewText || !batchName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // In production, we'd verify the JWT and ensure internId matches token payload
    
    const supabase = getAdminClient();
    
    const { data, error } = await supabase
      .from('testimonials')
      .insert([
        {
          intern_id: internId,
          rating,
          review_text: reviewText,
          batch_name: batchName,
          status: 'pending' // default to pending for admin approval
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
