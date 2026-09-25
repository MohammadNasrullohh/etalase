import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub draft journals of user
export async function GET() {
  return NextResponse.json({
    data: [],
  })
}
