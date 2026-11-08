'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Globe } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on portal dashboards and auth pages
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/auth')
  ) {
    return null;
  }

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-20 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-12 w-48 flex items-center">
              <Image
                src="/logo.png"
                alt="UGHAM"
                width={192}
                height={48}
                style={{ maxHeight: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Official Events Portal for <strong className="text-slate-800">events.ugham.com</strong>.
              Empowering college students through hackathons, technical seminars, practical workshops,
              and academic symposiums across premier colleges.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#0020d8]" /> events.ugham.com
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#c0047e]" /> info@ugham.com
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4">
              Explore Events
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/events" className="hover:text-[#0020d8] transition-colors">
                  Hackathons & Coding Sprints
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#0020d8] transition-colors">
                  Technical Seminars
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#0020d8] transition-colors">
                  Hands-on Workshops
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#0020d8] transition-colors">
                  College Tech Symposiums
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/auth/signin" className="hover:text-[#0020d8] transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-[#0020d8] transition-colors">
                  New Student Registration
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#0020d8] transition-colors">
                  My Registered Events
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} UGHAM (events.ugham.com). All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Powered by</span>
            <span className="font-semibold text-slate-600">ZTOI Technologies</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
