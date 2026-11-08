'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { openRazorpayModal } from '@/lib/razorpay';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Share2,
  Loader2,
  Sparkles,
  Trophy,
  Copy,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  Send,
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Hack Pick specific state
  const isHackPick = slug === 'hack-pick';
  const [hackPickTeam, setHackPickTeam] = useState<any>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [activeRegTab, setActiveRegTab] = useState<'create' | 'join'>('create');

  // Create team form
  const [teamName, setTeamName] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('Open Innovation');
  const [topic, setTopic] = useState('');

  // Join team form
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  // Action status
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${slug}`);
        const data = await res.json();
        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          setError(data.error || 'Event not found');
        }
      } catch (e: any) {
        setError('Failed to fetch event: ' + e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [slug]);

  useEffect(() => {
    if (isHackPick && user) {
      fetchHackPickTeam();
    }
  }, [isHackPick, user]);

  const fetchHackPickTeam = async () => {
    setTeamLoading(true);
    try {
      const res = await fetch('/api/hackpick/team');
      const data = await res.json();
      if (data.success && data.in_team) {
        setHackPickTeam(data.team);
      } else {
        setHackPickTeam(null);
      }
    } catch (e) {
      console.error('Failed to fetch hackpick team', e);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleCreateTeamAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/auth/signin?redirect=/events/${slug}`);
      return;
    }

    if (!teamName.trim()) {
      setError('Please provide a valid team name');
      return;
    }

    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      // 1. Create team
      const createRes = await fetch('/api/hackpick/team/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: teamName.trim(),
          domain: selectedDomain,
          topic: topic.trim(),
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || 'Failed to register team');
      }

      const newTeam = createData.team;
      setMessage('Team created! Launching secure payment gateway...');

      // 2. Initiate Razorpay payment
      await initiateRazorpayPayment(newTeam.id, newTeam.team_name);
    } catch (err: any) {
      setError(err.message || 'Team registration failed');
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/auth/signin?redirect=/events/${slug}`);
      return;
    }

    if (!inviteCodeInput.trim()) {
      setError('Please enter a valid invite code');
      return;
    }

    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/hackpick/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCodeInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to join team');
      }

      setMessage(data.message || 'Successfully joined team!');
      setInviteCodeInput('');
      await fetchHackPickTeam();
    } catch (err: any) {
      setError(err.message || 'Failed to join team');
    } finally {
      setActionLoading(false);
    }
  };

  const initiateRazorpayPayment = async (teamId: number, name: string) => {
    try {
      const orderRes = await fetch('/api/hackpick/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initiate Razorpay order');
      }

      await openRazorpayModal({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'UGHAM Events',
        description: `HACK PICK 2026 Registration Fee (Team: ${name})`,
        order_id: orderData.order_id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#0020d8',
        },
        handler: async (response) => {
          try {
            setMessage('Verifying payment signature with Razorpay...');
            const verifyRes = await fetch('/api/hackpick/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                team_id: teamId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setMessage(
                'Payment verified! Check your inbox for confirmation and WhatsApp invite.'
              );
              await fetchHackPickTeam();
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          } catch (e: any) {
            setError('Payment verification error: ' + e.message);
          } finally {
            setActionLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setActionLoading(false);
            fetchHackPickTeam();
          },
        },
      });
    } catch (err: any) {
      setError(err.message || 'Payment initiation error');
      setActionLoading(false);
    }
  };

  // Standard register for non-hackpick events
  const handleStandardRegister = async () => {
    if (!user) {
      router.push(`/auth/signin?redirect=/events/${slug}`);
      return;
    }

    setRegistering(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/api/events/${slug}/register`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      setMessage(data.message || 'You have successfully registered for this event!');
      setEvent((prev: any) => ({
        ...prev,
        is_registered: true,
        registered_count: Number(prev.registered_count || 0) + 1,
      }));
    } catch (err: any) {
      setError(err.message || 'Registration error');
    } finally {
      setRegistering(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'UGHAM Event',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0020d8] animate-spin" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ugham-gradient text-white font-bold text-xs shadow-ugham"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0020d8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Event Poster & Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poster Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-ugham-card">
            <div className="relative h-64 sm:h-96 w-full bg-slate-100">
              {event.poster_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.poster_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-ugham-gradient flex flex-col items-center justify-center text-white px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h2 className="font-black text-3xl sm:text-5xl tracking-tight">{event.title}</h2>
                  <p className="text-xs sm:text-sm text-white/80 mt-1 uppercase tracking-widest font-semibold">
                    National Inter-College Pitching Competition
                  </p>
                </div>
              )}

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/95 backdrop-blur-md text-[#0020d8] shadow-md">
                  {event.category_name}
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-slate-900/80 backdrop-blur-md text-white shadow-md capitalize">
                  {event.mode} Mode
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  {event.title}
                </h1>
                {event.short_description && (
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-2">
                    {event.short_description}
                  </p>
                )}
              </div>

              {/* Hack Pick 4 Rounds & Prizes Showcase */}
              {isHackPick && (
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  {/* Prize Pool Highlights */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Grand Cash Prize Pool (₹37,000 INR)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-center">
                        <span className="text-2xl">🥇</span>
                        <div className="text-lg font-black text-slate-900 mt-1">₹15,000</div>
                        <div className="text-[11px] font-bold text-amber-700 uppercase">
                          1st Prize
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                        <span className="text-2xl">🥈</span>
                        <div className="text-lg font-black text-slate-900 mt-1">₹12,000</div>
                        <div className="text-[11px] font-bold text-slate-600 uppercase">
                          2nd Prize
                        </div>
                      </div>
                      <div className="bg-orange-50/70 border border-orange-200/70 rounded-2xl p-4 text-center">
                        <span className="text-2xl">🥉</span>
                        <div className="text-lg font-black text-slate-900 mt-1">₹10,000</div>
                        <div className="text-[11px] font-bold text-orange-700 uppercase">
                          3rd Prize
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Rounds Timeline */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                      4 Rigorous Pitching Rounds
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0020d8] text-white">
                            Round 1 • Online
                          </span>
                          <span className="text-xs font-bold text-rose-600">
                            Deadline: Nov 25, 2026
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-2">
                          PPT Presentation Submission (Google Drive Link)
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Domains and problem statements with the official PPT template will be released on
                          <strong> November 15, 2026</strong>. Team leaders can select their domain and topic, and modify them anytime prior to submitting the PPT. Once submitted, selections are finalized.
                        </p>
                        <div className="mt-2.5 p-2 bg-blue-50 rounded-xl text-xs font-bold text-[#0020d8] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Round 1 Result will be released on December 18, 2026.</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#7928ca] text-white">
                            Round 2 • Online
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-2">
                            Online Pitching & Idea Presentation
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 font-semibold">Dates announced soon</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c0047e] text-white">
                            Round 3 • Online
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-2">
                            Detailed Solution & Business Pitch
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 font-semibold">Dates announced soon</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 rounded-2xl border border-blue-200/80">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                            Round 4 • Offline Grand Finale
                          </span>
                          <span className="text-xs font-bold text-[#0020d8]">
                            Dates Announced Soon
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-2">
                          Live On-Stage Pitching & Grand Award Ceremony
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Auditorium offline grand finale with industry jury and ₹37,000 cash prize distribution.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Description */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 mb-4">Event Overview</h3>
                <div className="prose text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>

              {/* Organizer details */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Organized By</span>
                  <p className="text-sm font-bold text-slate-900">
                    {event.organizer_name || 'UGHAM Innovations'}
                  </p>
                </div>
                {event.organizer_contact && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Contact</span>
                    <p className="text-xs font-semibold text-[#0020d8]">
                      {event.organizer_contact}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Registration Action Box */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-ugham-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Registration Fee
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {event.fee > 0 ? `₹${event.fee}` : 'Free Entry'}
                  {isHackPick && (
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      / team (2-3 members)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-[#0020d8] hover:border-[#0020d8] transition-all"
                title="Share Event"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Event Key Stats */}
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#0020d8] flex-shrink-0" />
                <span>
                  <strong>Date:</strong>{' '}
                  {new Date(event.event_date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#7928ca] flex-shrink-0" />
                <span>
                  <strong>Time:</strong>{' '}
                  {new Date(event.event_date).toLocaleTimeString('en-IN', {
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#c0047e] flex-shrink-0" />
                <span>
                  <strong>Venue:</strong> {event.venue}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#0020d8] flex-shrink-0" />
                <span>
                  <strong>Team Size:</strong> {isHackPick ? '2 to 3 Students per Team' : 'Individual'}
                </span>
              </div>
            </div>

            {/* Notification messages */}
            {message && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ================= HACK PICK TEAM REGISTRATION INTERFACE ================= */}
            {isHackPick ? (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                {!user ? (
                  <div className="text-center space-y-3">
                    <p className="text-xs text-slate-500">
                      You must sign in to your student account to register a team or join via invite code.
                    </p>
                    <Link
                      href={`/auth/signin?redirect=/events/${slug}`}
                      className="w-full py-3 px-5 rounded-xl bg-ugham-gradient text-white font-bold text-xs shadow-ugham hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      Sign In to Register
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      Don&apos;t have an account?{' '}
                      <Link href="/auth/signup" className="text-[#0020d8] font-bold underline">
                        Sign up here
                      </Link>
                    </p>
                  </div>
                ) : teamLoading ? (
                  <div className="py-6 text-center">
                    <Loader2 className="w-6 h-6 text-[#0020d8] animate-spin mx-auto mb-2" />
                    <span className="text-xs text-slate-500 font-semibold">
                      Checking your team status...
                    </span>
                  </div>
                ) : hackPickTeam ? (
                  /* User is ALREADY in a team */
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Your Team
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hackPickTeam.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {hackPickTeam.payment_status === 'paid' ? 'Paid ✓' : 'Payment Pending'}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">
                      {hackPickTeam.team_name}
                    </h4>

                    {/* Invite Code Box */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                        Unique Team Invite Code
                      </span>
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-black text-[#0020d8] font-mono">
                          {hackPickTeam.invite_code}
                        </code>
                        <button
                          onClick={() => copyInviteCode(hackPickTeam.invite_code)}
                          className="p-1.5 text-slate-500 hover:text-[#0020d8] rounded transition-colors text-xs flex items-center gap-1 font-bold"
                          title="Copy Invite Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Members List */}
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-800 block mb-1">
                        Team Members ({hackPickTeam.members?.length || 1}/3):
                      </span>
                      <ul className="space-y-1">
                        {hackPickTeam.members?.map((m: any) => (
                          <li key={m.user_id} className="flex items-center justify-between">
                            <span className="truncate">
                              {m.name} {m.role === 'leader' ? '👑 (Leader)' : ''}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[100px]">
                              {m.college_name || 'Student'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pay Button if pending and user is leader */}
                    {hackPickTeam.payment_status !== 'paid' && hackPickTeam.leader_id === user.id && (
                      <button
                        onClick={() =>
                          initiateRazorpayPayment(hackPickTeam.id, hackPickTeam.team_name)
                        }
                        disabled={actionLoading}
                        className="w-full py-2.5 px-4 rounded-xl bg-ugham-gradient text-white font-bold text-xs shadow-ugham hover:opacity-95 transition-all flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>Pay ₹149 Registration Fee</span>
                        )}
                      </button>
                    )}

                    {hackPickTeam.payment_status === 'paid' && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Registration Verified! WhatsApp invite link has been sent to your registered email.</span>
                      </div>
                    )}

                    <Link
                      href="/profile"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-[#0020d8] text-slate-700 hover:text-[#0020d8] text-xs font-bold text-center block transition-all"
                    >
                      Manage Team in Student Profile →
                    </Link>
                  </div>
                ) : (
                  /* User is NOT in a team: Show Create / Join tabs */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                      <button
                        onClick={() => setActiveRegTab('create')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          activeRegTab === 'create'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Create Team (Leader)
                      </button>
                      <button
                        onClick={() => setActiveRegTab('join')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          activeRegTab === 'join'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Join with Invite Code
                      </button>
                    </div>

                    {activeRegTab === 'create' ? (
                      <form onSubmit={handleCreateTeamAndPay} className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Team Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. CyberKnights"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0020d8]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Domain Category
                          </label>
                          <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0020d8]"
                          >
                            <option value="Open Innovation">Open Innovation</option>
                            <option value="AI & Machine Learning">AI & Machine Learning</option>
                            <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                            <option value="Smart Healthcare & MedTech">
                              Smart Healthcare & MedTech
                            </option>
                            <option value="Smart Automation & IoT">Smart Automation & IoT</option>
                            <option value="Fintech & Cybersecurity">Fintech & Cybersecurity</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Proposed Topic (Can change before PPT submission)
                          </label>
                          <input
                            type="text"
                            placeholder="Optional topic title"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0020d8]"
                          />
                        </div>

                        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 space-y-1">
                          <p className="font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0020d8]" />
                            Team Registration: ₹149 per team
                          </p>
                          <p className="text-blue-700">
                            Includes 2-3 members, Round 1 PPT evaluation, mentor access, and WhatsApp group invitation.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="w-full py-3 px-4 rounded-xl bg-ugham-gradient text-white font-bold text-xs shadow-ugham hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing Registration...</span>
                            </>
                          ) : (
                            <>
                              <span>Register Team & Pay ₹149</span>
                              <Sparkles className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleJoinTeam} className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Unique Invite Code *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. HP-X8K2M9"
                            value={inviteCodeInput}
                            onChange={(e) => setInviteCodeInput(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#0020d8]"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Ask your Team Leader for the 6-character team invite code.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Join Team</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Non-HackPick Standard Registration */
              <div>
                <button
                  onClick={handleStandardRegister}
                  disabled={registering || event.is_registered}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-ugham transition-all flex items-center justify-center gap-2 ${
                    event.is_registered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-ugham-gradient text-white hover:opacity-95 active:scale-[0.99]'
                  }`}
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering...
                    </>
                  ) : event.is_registered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Registered for Event
                    </>
                  ) : (
                    'Register for Event'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
