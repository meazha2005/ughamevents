import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { name, city, state } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'College name is required' }, { status: 400 });
    }

    // Get old college name to optionally update users
    const oldColleges = await query<any[]>(
      'SELECT name FROM uc_events_colleges WHERE id = ?',
      [Number(id)]
    );

    if (oldColleges.length === 0) {
      return NextResponse.json({ success: false, error: 'College not found' }, { status: 404 });
    }

    const oldName = oldColleges[0].name;

    await query(
      'UPDATE uc_events_colleges SET name = ?, city = ?, state = ? WHERE id = ?',
      [name.trim(), city?.trim() || null, state?.trim() || 'Tamil Nadu', Number(id)]
    );

    // Update existing student records if name changed
    if (oldName !== name.trim()) {
      await query(
        'UPDATE uc_events_users SET college_name = ? WHERE college_name = ?',
        [name.trim(), oldName]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'College updated successfully',
    });
  } catch (error: any) {
    console.error('Admin PUT college error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update college' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await query('DELETE FROM uc_events_colleges WHERE id = ?', [Number(id)]);

    return NextResponse.json({
      success: true,
      message: 'College deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin DELETE college error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete college' }, { status: 500 });
  }
}
