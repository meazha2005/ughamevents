import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';


export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const colleges = await query<any[]>(
      `SELECT c.*, COUNT(u.id) as students_count
       FROM uc_events_colleges c
       LEFT JOIN uc_events_users u ON c.name = u.college_name
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    return NextResponse.json({ success: true, colleges });
  } catch (error: any) {
    console.error('Admin GET colleges error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch colleges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, city, state } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'College name is required' }, { status: 400 });
    }

    const result: any = await query(
      'INSERT INTO uc_events_colleges (name, city, state) VALUES (?, ?, ?)',
      [name.trim(), city?.trim() || null, state?.trim() || 'Tamil Nadu']
    );

    return NextResponse.json({
      success: true,
      message: 'College added successfully',
      college: { id: result.insertId, name: name.trim(), city, state },
    });
  } catch (error: any) {
    console.error('Admin POST college error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add college' },
      { status: 500 }
    );
  }
}
