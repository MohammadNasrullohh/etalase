import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub approval queue in standalone mode
export async function GET() {
  return NextResponse.json([])
}
