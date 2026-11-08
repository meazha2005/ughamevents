'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Registering state per event
  const [registeringSlug, setRegisteringSlug] = useState<string | null>(null);
  const [registerMessage, setRegisterMessage] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (query = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('search', query.trim());

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error('Failed to fetch events', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleRegister = async (slug: string) => {
    if (!user) {
      window.location.href = `/auth/signin?redirect=/events/${slug}`;
      return;
    }

    setRegisteringSlug(slug);
    try {
      const res = await fetch(`/api/events/${slug}/register`, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setRegisterMessage((prev) => ({
          ...prev,
          [slug]: data.message || 'Registered successfully!',
        }));
        setEvents((prev) =>
          prev.map((e) =>
            e.slug === slug
              ? {
                  ...e,
                  is_registered: true,
                  registered_count: Number(e.registered_count || 0) + 1,
                }
              : e
          )
        );
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration failed', err);
    } finally {
      setRegisteringSlug(null);
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#0020d8] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            UGHAM Events Directory
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Explore Campus <span className="text-ugham-gradient">Events</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Discover verified technical seminars, inter-college hackathons, practical workshops,
            and academic symposiums across premier colleges.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row gap-2.5 bg-slate-50/90 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, venue, or keyword..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] text-slate-800 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl sm:rounded-2xl bg-ugham-gradient text-white font-bold text-sm shadow-ugham hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 text-[#0020d8] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading events from database...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl p-10 sm:p-12 text-center border border-slate-200/80 max-w-xl mx-auto my-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Events Scheduled Currently</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery.trim()
                ? `No events found matching "${searchQuery}". Try a different keyword.`
                : 'There are no active events currently scheduled. Check back soon for upcoming campus hackathons and seminars.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {searchQuery.trim() ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    fetchEvents('');
                  }}
                  className="px-5 py-2.5 rounded-full text-slate-700 font-bold text-xs bg-white border border-slate-300 hover:bg-slate-100 transition-all shadow-sm"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-full text-white font-bold text-xs bg-ugham-gradient shadow-ugham hover:opacity-95 transition-all"
                >
                  Back to Home
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {events.map((ev) => {
              const isReg = Boolean(ev.is_registered);
              const regMsg = registerMessage[ev.slug];

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-ugham-card hover:shadow-2xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Event Poster Image */}
                    <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden">
                      {ev.poster_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.poster_url}
                          alt={ev.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-ugham-gradient flex items-center justify-center text-white font-extrabold text-2xl">
                          {ev.category_name || 'UGHAM'}
                        </div>
                      )}

                      {/* Top Badges */}
                      {ev.category_name && (
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-[#0020d8] shadow-sm">
                            {ev.category_name}
                          </span>
                        </div>
                      )}

                      {ev.mode && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-white shadow-sm capitalize">
                            {ev.mode}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Details Content */}
                    <div className="p-6 space-y-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#7928ca]">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(ev.event_date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 font-medium">
                          {new Date(ev.event_date).toLocaleTimeString('en-IN', {
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <Link href={`/events/${ev.slug}`}>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-[#0020d8] transition-colors line-clamp-2 leading-tight">
                          {ev.title}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {ev.short_description || ev.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-4 h-4 text-[#c0047e] flex-shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#0020d8]" />
                            <strong className="text-slate-700">{ev.registered_count || 0}</strong> registered
                          </span>
                          {ev.fee > 0 ? (
                            <span className="font-bold text-slate-900">₹{ev.fee}</span>
                          ) : (
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-6 pt-0">
                    {regMsg && (
                      <div className="mb-2 p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{regMsg}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${ev.slug}`}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#0020d8] text-slate-700 hover:text-[#0020d8] font-bold text-xs text-center transition-all"
                      >
                        Details
                      </Link>

                      {isReg ? (
                        <span className="py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegister(ev.slug)}
                          disabled={registeringSlug === ev.slug}
                          className="py-2.5 px-5 rounded-xl bg-ugham-gradient text-white font-bold text-xs shadow-ugham hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          {registeringSlug === ev.slug ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Register</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
