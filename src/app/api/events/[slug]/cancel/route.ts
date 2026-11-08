import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Event registrations cannot be cancelled once confirmed.' },
    { status: 400 }
  );
}
