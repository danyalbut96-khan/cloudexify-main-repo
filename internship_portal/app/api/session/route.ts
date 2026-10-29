import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('intern_token')?.value
    if (!token) return NextResponse.json({ isLoggedIn: false })
    
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')
    await jwtVerify(token, JWT_SECRET)
    
    return NextResponse.json({ isLoggedIn: true })
  } catch (e) {
    return NextResponse.json({ isLoggedIn: false })
  }
}
