'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  Code2,
  GraduationCap,
  Laptop,
  Flame,
  Award,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';

const pastEventImages = [
  { src: '/images/1.png', title: 'Campus Tech Symposium', tag: 'Symposium' },
  { src: '/images/2.png', title: 'Student Innovation Summit', tag: 'Hackathon' },
  { src: '/images/3.png', title: 'National Coding Sprint', tag: 'Hackathon' },
  { src: '/images/4.png', title: 'Industry Expert Seminar', tag: 'Seminar' },
  { src: '/images/5.png', title: 'Hands-on Technical Workshop', tag: 'Workshop' },
  { src: '/images/6.png', title: 'Student Project Exhibition', tag: 'Exhibition' },
  { src: '/images/7.png', title: 'Hackathon Awards Ceremony', tag: 'Awards' },
  { src: '/images/8.png', title: 'Keynote & Career Guidance', tag: 'Seminar' },
  { src: '/images/9.png', title: 'Team Problem Solving Sprint', tag: 'Hackathon' },
  { src: '/images/10.png', title: 'Inter-College Tech Assembly', tag: 'Symposium' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, collegesRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/colleges'),
        ]);

        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          setFeaturedEvents(eventsData.events?.slice(0, 3) || []);
        }

        const collegesData = await collegesRes.json();
        if (collegesData.success) {
          setColleges(collegesData.colleges || []);
        }
      } catch (e) {
        console.error('Error fetching home data', e);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-ugham-gradient-subtle border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#0020d8] animate-pulse" />
              <span className="text-ugham-gradient uppercase tracking-wider">
                events.ugham.com
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">Where Evolution Starts</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Empowering Students Through{' '}
              <span className="text-ugham-gradient">Campus Events</span> &{' '}
              <span className="text-[#0020d8]">Hackathons</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Welcome to the official UGHAM Events Portal. Discover verified technical seminars,
              inter-college hackathons, hands-on workshops, and symposiums across premier colleges.
            </p>

            {/* Call to Actions */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/events"
                className="px-8 py-3.5 rounded-full bg-ugham-gradient text-white font-bold text-sm shadow-ugham hover:opacity-95 active:scale-[0.99] transition-all flex items-center gap-2"
              >
                <span>Browse All Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {user ? (
                <Link
                  href="/profile"
                  className="px-8 py-3.5 rounded-full bg-white border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50 shadow-sm transition-all"
                >
                  My Student Profile
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="px-8 py-3.5 rounded-full bg-white border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50 shadow-sm transition-all"
                >
                  Register as Student
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Ambient background blur circles */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-fuchsia-300/20 blur-3xl pointer-events-none" />
      </section>

      {/* ================= WHAT WE OFFER ================= */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0020d8] uppercase tracking-wider">
              Opportunities For College Students
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              What You Can Experience
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Accelerate your engineering, coding, and problem-solving skills with verified events.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-100 hover:border-[#0020d8]/30 transition-all hover:shadow-ugham-card group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0020d8] flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Hackathons & Sprints
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Competitive coding marathons, team innovation sprints, and real problem-solving with awards.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-100 hover:border-[#7928ca]/30 transition-all hover:shadow-ugham-card group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#7928ca] flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Technical Seminars
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Expert guest lectures, industry keynote speakers, and emerging technology discussions.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-100 hover:border-[#c0047e]/30 transition-all hover:shadow-ugham-card group">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 text-[#c0047e] flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Practical Workshops
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hands-on coding labs, project development, and skill certification for students.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-100 hover:border-emerald-500/30 transition-all hover:shadow-ugham-card group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Campus Symposiums
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inter-college technical festivals, paper presentations, and department competitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PAST EVENTS GALLERY ================= */}
      <section id="gallery" className="py-16 md:py-24 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-[#c0047e] uppercase tracking-wider">
                Event Moments & Memories
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
                Past Events Highlights
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 max-w-xl">
                Real moments captured from our student hackathons, campus seminars, workshops, and awards ceremonies.
              </p>
            </div>

            <div className="text-xs font-bold text-[#0020d8] flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm w-fit">
              <Award className="w-4 h-4 text-[#7928ca]" />
              <span>10 Event Showcase Pictures</span>
            </div>
          </div>

          {/* Pictures Grid (Using public/images/) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {pastEventImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img.src)}
                className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-200 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <span className="self-end p-1.5 rounded-full bg-white/30 backdrop-blur-md text-white text-xs">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#0020d8] text-white text-[10px] font-bold">
                      {img.tag}
                    </span>
                    <p className="text-xs font-bold text-white mt-1 line-clamp-1">{img.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Gallery Images */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Past Event Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ================= UPCOMING EVENTS SECTION ================= */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-[#0020d8] uppercase tracking-wider">
                What&apos;s Ahead
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
                Latest Scheduled Events
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0020d8] hover:text-[#7928ca] transition-colors"
            >
              <span>View All Events Directory</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredEvents.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 max-w-2xl mx-auto">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">
                New Events Coming Soon
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6 max-w-md mx-auto">
                No active events are currently scheduled. Check back soon as new campus competitions, hackathons, and seminars are announced.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/events"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-ugham-gradient text-white shadow-ugham"
                >
                  Explore Events Page
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-ugham-card hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-100">
                      {ev.poster_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.poster_url}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-ugham-gradient flex items-center justify-center text-white font-bold text-xl">
                          {ev.category_name}
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-[#0020d8] shadow-sm">
                        {ev.category_name}
                      </span>
                    </div>

                    <div className="p-6 space-y-3">
                      <span className="text-xs font-semibold text-[#7928ca] block">
                        {new Date(ev.event_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{ev.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-[#c0047e]" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href={`/events/${ev.slug}`}
                      className="w-full py-2.5 rounded-xl bg-ugham-gradient text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>View & Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= PARTICIPATING COLLEGES ================= */}
      <section className="py-16 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-[#7928ca] uppercase tracking-wider">
              Network of Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Participating Colleges & Universities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
              Students and engineering departments from accredited institutions across the state connect on UGHAM.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {colleges.slice(0, 12).map((col) => (
              <div
                key={col.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0020d8] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{col.name}</p>
                  <p className="text-[10px] text-slate-400">{col.city || 'Tamil Nadu'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-ugham-gradient rounded-3xl p-8 sm:p-14 text-white text-center shadow-ugham relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                Start Today
              </span>
              <h2 className="text-2xl sm:text-4xl font-black">
                Ready to Join Upcoming Campus Events?
              </h2>
              <p className="text-sm sm:text-base text-white/90 font-normal leading-relaxed">
                Create your student account in under 60 seconds, connect with peers, and participate in premier college hackathons.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="px-8 py-3.5 rounded-full bg-white text-[#0020d8] font-extrabold text-sm hover:bg-slate-100 shadow-lg transition-all"
                >
                  Create Student Account
                </Link>
                <Link
                  href="/events"
                  className="px-8 py-3.5 rounded-full bg-white/10 border border-white/30 text-white font-extrabold text-sm hover:bg-white/20 transition-all"
                >
                  Explore All Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
