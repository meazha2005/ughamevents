import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { College } from '@/lib/types';


export async function GET() {
  try {
    const colleges = await query<College[]>(
      'SELECT id, name, city, state FROM uc_events_colleges ORDER BY name ASC'
    );
    return NextResponse.json({ success: true, colleges });
  } catch (error: any) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch colleges' },
      { status: 500 }
    );
  }
}
