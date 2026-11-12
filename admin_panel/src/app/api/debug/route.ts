import { NextResponse } from 'next/server'

// Intentionally disabled. Debug endpoints must never expose database samples.
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
