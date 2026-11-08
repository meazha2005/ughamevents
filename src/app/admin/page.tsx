'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { uploadImageToPhpBackend } from '@/lib/upload';
import {
  ShieldCheck,
  Users,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Camera,
  Loader2,
  Lock,
  Mail,
  LogOut,
  ExternalLink,
  Search,
  Menu,
  X,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Trophy,
  CreditCard,
  FileText,
  Copy,
} from 'lucide-react';

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'hackpick' | 'colleges' | 'signups'>('events');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hack Pick Admin State
  const [hackPickTeams, setHackPickTeams] = useState<any[]>([]);
  const [hackPickStats, setHackPickStats] = useState({
    total_teams: 0,
    paid_teams: 0,
    pending_teams: 0,
    total_participants: 0,
    ppt_submitted: 0,
    total_revenue: 0,
  });
  const [loadingHackPick, setLoadingHackPick] = useState(false);
  const [hackPickFilter, setHackPickFilter] = useState<'all' | 'paid' | 'pending' | 'ppt'>('all');
  const [hackPickSearch, setHackPickSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalSignups: 0,
    totalEvents: 0,
    totalColleges: 0,
    totalRegistrations: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [signups, setSignups] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Event Modal & Form State
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    category_name: 'Seminar',
    description: '',
    short_description: '',
    event_date: '',
    end_date: '',
    registration_deadline: '',
    venue: '',
    mode: 'Offline',
    poster_url: '',
    max_participants: 0,
    fee: 0,
    organizer_name: 'UGHAM Tech',
    organizer_contact: 'info@ugham.com',
    status: 'published',
  });
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventActionError, setEventActionError] = useState('');

  // College Modal & Form State
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollegeId, setEditingCollegeId] = useState<number | null>(null);
  const [collegeForm, setCollegeForm] = useState({
    name: '',
    city: '',
    state: 'Tamil Nadu',
  });
  const [savingCollege, setSavingCollege] = useState(false);
  const [collegeActionError, setCollegeActionError] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Check if current user is admin
  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user && data.user.role === 'admin') {
            setAdminUser(data.user);
            fetchDashboardData();
          }
        }
      } catch (err) {
        console.error('Admin auth check failed', err);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAdminAuth();
  }, []);

  const fetchHackPickAdminData = async () => {
    setLoadingHackPick(true);
    try {
      const res = await fetch('/api/admin/hackpick/teams');
      const data = await res.json();
      if (data.success) {
        setHackPickTeams(data.teams || []);
        if (data.stats) setHackPickStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load hackpick teams', err);
    } finally {
      setLoadingHackPick(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, eventsRes, collegesRes, signupsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/events'),
        fetch('/api/admin/colleges'),
        fetch('/api/admin/signups'),
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const eventsData = await eventsRes.json();
      if (eventsData.success) setEvents(eventsData.events);

      const collegesData = await collegesRes.json();
      if (collegesData.success) setColleges(collegesData.colleges);

      const signupsData = await signupsRes.json();
      if (signupsData.success) setSignups(signupsData.students);

      fetchHackPickAdminData();
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password');
      }

      setAdminUser(data.admin);
      fetchDashboardData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAdminUser(null);
  };

  // --- EVENT HANDLERS ---
  const openNewEventModal = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      category_name: 'Seminar',
      description: '',
      short_description: '',
      event_date: '',
      end_date: '',
      registration_deadline: '',
      venue: '',
      mode: 'Offline',
      poster_url: '',
      max_participants: 100,
      fee: 0,
      organizer_name: 'UGHAM Tech',
      organizer_contact: 'info@ugham.com',
      status: 'published',
    });
    setEventActionError('');
    setShowEventModal(true);
  };

  const openEditEventModal = (ev: any) => {
    setEditingEventId(ev.id);
    setEventForm({
      title: ev.title,
      category_name: ev.category_name,
      description: ev.description,
      short_description: ev.short_description || '',
      event_date: ev.event_date ? new Date(ev.event_date).toISOString().slice(0, 16) : '',
      end_date: ev.end_date ? new Date(ev.end_date).toISOString().slice(0, 16) : '',
      registration_deadline: ev.registration_deadline
        ? new Date(ev.registration_deadline).toISOString().slice(0, 16)
        : '',
      venue: ev.venue,
      mode: ev.mode || 'Offline',
      poster_url: ev.poster_url || '',
      max_participants: ev.max_participants || 0,
      fee: ev.fee || 0,
      organizer_name: ev.organizer_name || 'UGHAM Tech',
      organizer_contact: ev.organizer_contact || 'info@ugham.com',
      status: ev.status || 'published',
    });
    setEventActionError('');
    setShowEventModal(true);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPoster(true);
    setEventActionError('');

    try {
      const url = await uploadImageToPhpBackend(file, 'events');
      setEventForm((prev) => ({ ...prev, poster_url: url }));
    } catch (err: any) {
      setEventActionError('Poster upload failed: ' + err.message);
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvent(true);
    setEventActionError('');

    try {
      const url = editingEventId ? `/api/admin/events/${editingEventId}` : '/api/admin/events';
      const method = editingEventId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save event');
      }

      setShowEventModal(false);
      fetchDashboardData();
    } catch (err: any) {
      setEventActionError(err.message || 'Error saving event');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete event "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Delete event error', err);
    }
  };

  // --- COLLEGE HANDLERS ---
  const openNewCollegeModal = () => {
    setEditingCollegeId(null);
    setCollegeForm({ name: '', city: '', state: 'Tamil Nadu' });
    setCollegeActionError('');
    setShowCollegeModal(true);
  };

  const openEditCollegeModal = (c: any) => {
    setEditingCollegeId(c.id);
    setCollegeForm({ name: c.name, city: c.city || '', state: c.state || 'Tamil Nadu' });
    setCollegeActionError('');
    setShowCollegeModal(true);
  };

  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCollege(true);
    setCollegeActionError('');

    try {
      const url = editingCollegeId ? `/api/admin/colleges/${editingCollegeId}` : '/api/admin/colleges';
      const method = editingCollegeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collegeForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save college');
      }

      setShowCollegeModal(false);
      fetchDashboardData();
    } catch (err: any) {
      setCollegeActionError(err.message || 'Error saving college');
    } finally {
      setSavingCollege(false);
    }
  };

  const handleDeleteCollege = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete college "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Delete college error', err);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0020d8] animate-spin" />
      </div>
    );
  }

  // --- ADMIN SIGN IN SCREEN ---
  if (!adminUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-ugham-card">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-ugham-gradient flex items-center justify-center mx-auto text-white shadow-ugham mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              UGHAM <span className="text-ugham-gradient">Admin Portal</span>
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Sign in with administrative privileges to manage events and colleges
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter authorized email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-[#0020d8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-[#0020d8]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-6 rounded-xl text-white font-bold text-xs sm:text-sm bg-ugham-gradient shadow-ugham hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LOGGED-IN ADMIN DASHBOARD WITH LEFT-SIDE PANEL & HAMBURGER ---
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredColleges = colleges.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSignups = signups.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.college_name && s.college_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
      {/* Mobile Top Header with Hamburger & Logo (Only One Navigation) */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <Menu className="w-5 h-5 text-[#0020d8]" />
            <span>Admin Menu</span>
          </button>

          <Link href="/" className="relative h-9 w-28 flex items-center">
            <Image
              src="/logo.png"
              alt="UGHAM"
              width={120}
              height={32}
              style={{ maxHeight: '32px', width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 hidden sm:inline">Admin</span>
        </div>
      </div>

      {/* Mobile Left Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Left-Side Navigation Panel (Sidebar - Single Navigation) */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-20 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl md:shadow-none flex-shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* UGHAM Logo & Admin Title */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <Link href="/" className="relative h-10 w-36 flex items-center mb-1">
                <Image
                  src="/logo.png"
                  alt="UGHAM"
                  width={150}
                  height={38}
                  style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain' }}
                  priority
                />
              </Link>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c0047e]" />
                <span className="text-[10px] font-bold text-[#c0047e] uppercase tracking-wider block">
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">{adminUser.email}</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-ugham-gradient text-white shadow-ugham'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview & Metrics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => {
                setActiveTab('events');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'events'
                  ? 'bg-ugham-gradient text-white shadow-ugham'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>Manage Events</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'events' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {events.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('hackpick');
                setMobileMenuOpen(false);
                fetchHackPickAdminData();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hackpick'
                  ? 'bg-ugham-gradient text-white shadow-ugham'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>HACK PICK Teams</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'hackpick' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {hackPickStats.total_teams}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('colleges');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'colleges'
                  ? 'bg-ugham-gradient text-white shadow-ugham'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4" />
                <span>Colleges Directory</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'colleges' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {colleges.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('signups');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'signups'
                  ? 'bg-ugham-gradient text-white shadow-ugham'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Total Signups</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'signups' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {signups.length}
              </span>
            </button>
          </nav>

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Links
            </span>
            <Link
              href="/events"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-[#0020d8] hover:bg-slate-50 transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#0020d8]" />
              <span>Public Events Page</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-[#0020d8] hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[#7928ca]" />
              <span>View Website Home</span>
            </Link>
          </div>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Logout</span>
          </button>
          <div className="text-[10px] text-slate-400 text-center font-mono truncate">
            DB: 192.169.147.255:le_test
          </div>
        </div>
      </aside>

      {/* Main Content Area (To the right of the sidebar) */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl">
        {/* ================= TAB 0: OVERVIEW & METRICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#0020d8] uppercase tracking-wider">
                  System Health & Metrics
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Dashboard Overview
                </h1>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={loadingData}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors w-fit flex items-center gap-1.5"
              >
                {loadingData ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '↻ Refresh Metrics'}
              </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-ugham-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0020d8] flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Signups
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {stats.totalSignups}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-ugham-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7928ca] flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Events
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {stats.totalEvents}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-ugham-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-50 text-[#c0047e] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Event Attendees
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {stats.totalRegistrations}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-ugham-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Colleges
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {stats.totalColleges}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-ugham-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Quick Administrator Actions</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={openNewEventModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-ugham-gradient shadow-ugham flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add New Event
                </button>
                <button
                  onClick={openNewCollegeModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add College Name
                </button>
                <button
                  onClick={() => setActiveTab('signups')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#0020d8] bg-blue-50 hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  View All Student Signups
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 1: MANAGE EVENTS ================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#0020d8] uppercase tracking-wider">
                  Catalog Management
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Manage Events ({events.length})
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Add, update, or remove seminars, hackathons, and symposiums.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openNewEventModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-ugham-gradient shadow-ugham hover:opacity-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title or venue..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
              />
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-ugham-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-4 px-6">Event</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Venue</th>
                      <th className="py-4 px-4">Registrations</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400">
                          No events found. Click &quot;Add Event&quot; to publish your first seminar or hackathon!
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((ev) => (
                        <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {ev.title}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0020d8]">
                              {ev.category_name}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {new Date(ev.event_date).toLocaleDateString('en-IN', {
                              dateStyle: 'medium',
                            })}
                          </td>
                          <td className="py-4 px-4 max-w-[160px] truncate">{ev.venue}</td>
                          <td className="py-4 px-4 font-bold text-emerald-600">
                            {ev.registered_count || 0} students
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ev.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {ev.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {(ev.slug === 'hack-pick' || ev.title?.toLowerCase().includes('hack pick')) && (
                                <button
                                  onClick={() => {
                                    setActiveTab('hackpick');
                                    fetchHackPickAdminData();
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7928ca] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                                  title="View Teams, Payments & PPT Submissions"
                                >
                                  <Trophy className="w-3.5 h-3.5" />
                                  <span>View Teams ({hackPickStats.total_teams})</span>
                                </button>
                              )}
                              <button
                                onClick={() => openEditEventModal(ev)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#0020d8] hover:bg-slate-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: HACK PICK TEAMS & SUBMISSIONS ================= */}
        {activeTab === 'hackpick' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#7928ca] mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  National Inter-College Pitching Event
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  HACK PICK 2026 Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  View all teams, participant rosters, ₹149 Razorpay payments, and Round 1 PPT submissions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchHackPickAdminData}
                  disabled={loadingHackPick}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Loader2 className={`w-3.5 h-3.5 ${loadingHackPick ? 'animate-spin text-[#0020d8]' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Teams
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {hackPickStats.total_teams}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Paid Teams
                </span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {hackPickStats.paid_teams}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Revenue
                </span>
                <div className="text-2xl font-black text-[#0020d8] mt-1">
                  ₹{hackPickStats.total_revenue.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Participants
                </span>
                <div className="text-2xl font-black text-purple-600 mt-1">
                  {hackPickStats.total_participants}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Round 1 PPTs
                </span>
                <div className="text-2xl font-black text-[#c0047e] mt-1">
                  {hackPickStats.ppt_submitted}
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { key: 'all', label: `All Teams (${hackPickTeams.length})` },
                  { key: 'paid', label: `Paid (${hackPickStats.paid_teams})` },
                  { key: 'pending', label: `Pending (${hackPickStats.pending_teams})` },
                  { key: 'ppt', label: `PPT Submitted (${hackPickStats.ppt_submitted})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setHackPickFilter(f.key as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      hackPickFilter === f.key
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hackPickSearch}
                  onChange={(e) => setHackPickSearch(e.target.value)}
                  placeholder="Search team, leader, code, college..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                />
              </div>
            </div>

            {/* Teams Roster List */}
            {loadingHackPick ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-[#0020d8] animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Loading Hack Pick teams...</p>
              </div>
            ) : (
              (() => {
                const filtered = hackPickTeams.filter((t) => {
                  if (hackPickFilter === 'paid' && t.payment_status !== 'paid') return false;
                  if (hackPickFilter === 'pending' && t.payment_status === 'paid') return false;
                  if (hackPickFilter === 'ppt' && !t.is_ppt_submitted) return false;

                  if (!hackPickSearch.trim()) return true;
                  const q = hackPickSearch.toLowerCase();
                  const teamMatch = t.team_name?.toLowerCase().includes(q);
                  const codeMatch = t.invite_code?.toLowerCase().includes(q);
                  const leaderMatch =
                    t.leader_name?.toLowerCase().includes(q) ||
                    t.leader_email?.toLowerCase().includes(q) ||
                    t.leader_phone?.includes(q) ||
                    t.leader_college?.toLowerCase().includes(q);
                  const topicMatch = t.domain?.toLowerCase().includes(q) || t.topic?.toLowerCase().includes(q);
                  const membersMatch = t.members?.some(
                    (m: any) =>
                      m.name?.toLowerCase().includes(q) ||
                      m.email?.toLowerCase().includes(q) ||
                      m.college_name?.toLowerCase().includes(q)
                  );
                  return teamMatch || codeMatch || leaderMatch || topicMatch || membersMatch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                      <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800">No Teams Found</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                        No teams match your selected filter or search query.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filtered.map((team) => (
                      <div
                        key={team.id}
                        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
                      >
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7928ca] flex items-center justify-center font-bold text-sm">
                              <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-slate-900">
                                  {team.team_name}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                  {team.members_count || 1} / 3 Members
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Registered on{' '}
                                {new Date(team.created_at).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Invite Code */}
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Code:</span>
                              <code className="font-mono font-bold text-[#0020d8]">{team.invite_code}</code>
                              <button
                                onClick={() => copyInviteCode(team.invite_code)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                                title="Copy Code"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Payment Status Badge */}
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                team.payment_status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {team.payment_status === 'paid' ? '₹149 Paid ✓' : 'Payment Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Team Members Grid */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Team Roster ({team.members?.length || 1} members)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {team.members?.map((m: any) => (
                              <div
                                key={m.user_id}
                                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-900 truncate">{m.name}</span>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      m.role === 'leader'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {m.role === 'leader' ? 'Leader 👑' : 'Member'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                                <p className="text-[11px] text-slate-500">{m.phone || 'No phone'}</p>
                                <p className="text-[11px] text-slate-600 font-medium truncate mt-1">
                                  {m.college_name || '—'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment & PPT Details Row */}
                        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Payment Meta */}
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Payment Details (Razorpay)
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Status:</span>
                              <strong className={team.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>
                                {team.payment_status === 'paid' ? 'Verified (₹149)' : 'Pending'}
                              </strong>
                            </div>
                            {team.payment_id && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Payment ID:</span>
                                <span className="font-mono text-[11px] text-slate-800">{team.payment_id}</span>
                              </div>
                            )}
                            {team.order_id && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Order ID:</span>
                                <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px]">
                                  {team.order_id}
                                </span>
                              </div>
                            )}
                            {team.payment_date && (
                              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                                <span>Paid Date:</span>
                                <span>{new Date(team.payment_date).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>

                          {/* Round 1 PPT Submission */}
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Round 1 PPT Submission
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Domain:</span>
                              <strong className="text-slate-800">{team.domain || 'Not selected'}</strong>
                            </div>
                            {team.topic && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Topic:</span>
                                <span className="text-slate-700 truncate max-w-[160px]">{team.topic}</span>
                              </div>
                            )}
                            <div className="pt-1 flex items-center justify-between">
                              <span className="text-slate-500">PPT Link:</span>
                              {team.is_ppt_submitted ? (
                                <a
                                  href={team.ppt_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 border border-emerald-200"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Open Google Drive PPT</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Not submitted</span>
                              )}
                            </div>
                            {team.ppt_submitted_at && (
                              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                                <span>Submitted At:</span>
                                <span>{new Date(team.ppt_submitted_at).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* ================= TAB 2: COLLEGES DIRECTORY ================= */}
        {activeTab === 'colleges' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#7928ca] uppercase tracking-wider">
                  Campus Directory
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Colleges List ({colleges.length})
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Add, update, or delete college names. These appear directly in the student registration dropdown.
                </p>
              </div>

              <button
                onClick={openNewCollegeModal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-ugham-gradient shadow-ugham hover:opacity-95 flex items-center gap-1.5 w-fit"
              >
                <Plus className="w-4 h-4" />
                Add College
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search college by name or city..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
              />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-ugham-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-4 px-6">College Name</th>
                      <th className="py-4 px-4">City</th>
                      <th className="py-4 px-4">State</th>
                      <th className="py-4 px-4">Students</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredColleges.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          No colleges found. Click &quot;Add College&quot; to register a new institution.
                        </td>
                      </tr>
                    ) : (
                      filteredColleges.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">{c.name}</td>
                          <td className="py-4 px-4">{c.city || '—'}</td>
                          <td className="py-4 px-4">{c.state || 'Tamil Nadu'}</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0020d8] font-bold">
                              {c.students_count || 0} students
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditCollegeModal(c)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#0020d8] hover:bg-slate-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCollege(c.id, c.name)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: TOTAL SIGNUPS ================= */}
        {activeTab === 'signups' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#c0047e] uppercase tracking-wider">
                Student Roster
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Total Signups ({signups.length})
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                All student accounts registered across colleges on UGHAM Events portal.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name, email, or college..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
              />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-ugham-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-4 px-6">Student Name</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-4">Phone</th>
                      <th className="py-4 px-4">College</th>
                      <th className="py-4 px-4">Registrations</th>
                      <th className="py-4 px-6">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredSignups.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          No registered students found.
                        </td>
                      </tr>
                    ) : (
                      filteredSignups.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-ugham-gradient text-white flex items-center justify-center font-bold text-[10px] overflow-hidden flex-shrink-0">
                                {s.profile_pic ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={s.profile_pic} alt={s.name} className="w-full h-full object-cover" />
                                ) : (
                                  s.name.charAt(0)
                                )}
                              </div>
                              <span className="truncate">{s.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-600">{s.email}</td>
                          <td className="py-4 px-4 text-slate-600">{s.phone}</td>
                          <td className="py-4 px-4 font-medium text-slate-800">{s.college_name || '—'}</td>
                          <td className="py-4 px-4 font-bold text-[#0020d8]">
                            {s.registrations_count || 0} events
                          </td>
                          <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                            {new Date(s.created_at).toLocaleDateString('en-IN', {
                              dateStyle: 'medium',
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- ADD / EDIT EVENT MODAL --- */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-xl font-extrabold text-slate-900">
                {editingEventId ? 'Edit Event' : 'Add New Event for College Students'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {eventActionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{eventActionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. National Level GenAI Hackathon 2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={eventForm.category_name}
                    onChange={(e) => setEventForm({ ...eventForm, category_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                  >
                    <option value="Seminar">Seminar</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Symposium">Symposium</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Event Mode *
                  </label>
                  <select
                    value={eventForm.mode}
                    onChange={(e) => setEventForm({ ...eventForm, mode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                  >
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Poster Upload (Saved via PHP Backend API) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Event Poster (Upload via PHP Backend)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {eventForm.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={eventForm.poster_url}
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
                      {uploadingPoster ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Uploading to PHP Backend...
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          Choose Poster Image
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterUpload}
                        disabled={uploadingPoster}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      value={eventForm.poster_url}
                      onChange={(e) => setEventForm({ ...eventForm, poster_url: e.target.value })}
                      placeholder="Or paste external image URL..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Event Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    placeholder="Auditorium / Campus Hall"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Event Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Full agenda, rules, prize pool, eligibility, prerequisites..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Capacity (0 = Unlimited)
                  </label>
                  <input
                    type="number"
                    value={eventForm.max_participants}
                    onChange={(e) => setEventForm({ ...eventForm, max_participants: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={eventForm.fee}
                    onChange={(e) => setEventForm({ ...eventForm, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent || uploadingPoster}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-ugham-gradient shadow-ugham hover:opacity-95 flex items-center gap-2"
                >
                  {savingEvent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingEventId ? 'Update Event' : 'Create & Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT COLLEGE MODAL --- */}
      {showCollegeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingCollegeId ? 'Edit College' : 'Add College Name'}
              </h3>
              <button
                onClick={() => setShowCollegeModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {collegeActionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{collegeActionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCollege} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  College Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={collegeForm.name}
                  onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                  placeholder="e.g. Coimbatore Institute of Technology (CIT)"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={collegeForm.city}
                  onChange={(e) => setCollegeForm({ ...collegeForm, city: e.target.value })}
                  placeholder="e.g. Coimbatore"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={collegeForm.state}
                  onChange={(e) => setCollegeForm({ ...collegeForm, state: e.target.value })}
                  placeholder="Tamil Nadu"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0020d8]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCollegeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCollege}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-ugham-gradient shadow-ugham hover:opacity-95 flex items-center gap-2"
                >
                  {savingCollege && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCollegeId ? 'Update College' : 'Add College'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
