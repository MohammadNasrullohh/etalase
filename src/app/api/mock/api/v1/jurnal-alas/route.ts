import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub published journals of user
export async function GET() {
  return NextResponse.json({
    data: [],
  })
}
