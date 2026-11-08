'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CalendarDays, UserCheck, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide mobile bottom nav on student portal, admin portal, and auth screens (navigation handled by sidebar/drawer)
  if (
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/auth')
  ) {
    return null;
  }

  const isEventsActive = pathname === '/events' || pathname?.startsWith('/events');
  const isProfileActive = pathname === '/profile' || pathname?.startsWith('/auth');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-6 py-2.5">
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {/* Button 1: Events */}
        <Link
          href="/events"
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl transition-all duration-200 font-bold text-sm ${
            isEventsActive
              ? 'bg-ugham-gradient text-white shadow-ugham scale-[1.02]'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'
          }`}
        >
          <CalendarDays className={`w-5 h-5 ${isEventsActive ? 'text-white' : 'text-[#0020d8]'}`} />
          <span>Events</span>
        </Link>

        {/* Button 2: Profile */}
        <Link
          href={user ? '/profile' : '/auth/signin'}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl transition-all duration-200 font-bold text-sm ${
            isProfileActive
              ? 'bg-ugham-gradient text-white shadow-ugham scale-[1.02]'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'
          }`}
        >
          {user ? (
            <UserCheck className={`w-5 h-5 ${isProfileActive ? 'text-white' : 'text-[#c0047e]'}`} />
          ) : (
            <User className={`w-5 h-5 ${isProfileActive ? 'text-white' : 'text-[#c0047e]'}`} />
          )}
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
}
