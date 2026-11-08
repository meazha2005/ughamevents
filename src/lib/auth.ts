import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ugham_events_secret_key_2026_jwt_token_999';

export interface UserSession {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'admin';
  phone?: string;
  college_name?: string;
  profile_pic?: string;
}

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function getSession(req?: NextRequest): Promise<UserSession | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('uc_token')?.value;
  }

  if (!token) return null;
  return verifyToken(token);
}
