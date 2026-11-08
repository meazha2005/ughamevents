'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Calendar, LogOut, Sparkles } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide global website header in student and management dashboards so there is only one navigation panel
  if (pathname?.startsWith('/profile') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-44 sm:h-14 sm:w-52 transition-transform duration-200 group-hover:scale-[1.02] flex items-center">
              <Image
                src="/logo.png"
                alt="UGHAM - Where Evolution Starts"
                width={200}
                height={56}
                style={{ maxHeight: '48px', width: 'auto', objectFit: 'contain' }}
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation (System: in header) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-semibold transition-colors hover:text-[#0020d8] flex items-center gap-1.5 ${
                pathname === '/' ? 'text-[#0020d8]' : 'text-slate-600'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#7928ca]" />
              Home
            </Link>

            <Link
              href="/events"
              className={`text-sm font-semibold transition-colors hover:text-[#0020d8] flex items-center gap-1.5 ${
                pathname?.startsWith('/events') ? 'text-[#0020d8]' : 'text-slate-600'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#0020d8]" />
              Events
            </Link>

            <Link
              href="/#gallery"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#0020d8]"
            >
              Past Events
            </Link>
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-slate-200 hover:border-[#0020d8] hover:shadow-sm transition-all group bg-slate-50/60"
                >
                  <div className="w-9 h-9 rounded-full bg-ugham-gradient p-0.5 overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                    {user.profile_pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profile_pic}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-[#0020d8] transition-colors leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[140px] leading-tight">
                      {user.college_name || 'Student'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-sm font-semibold text-slate-700 hover:text-[#0020d8] px-4 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold text-white bg-ugham-gradient hover:opacity-95 px-5 py-2.5 rounded-full shadow-ugham hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Quick Action */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-ugham-gradient text-white font-bold text-xs flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm"
              >
                {user.profile_pic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-ugham-gradient shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
