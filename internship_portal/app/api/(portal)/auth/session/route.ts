import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = cookies().get('intern_token')?.value
  return NextResponse.json({ authenticated: !!token })
}
