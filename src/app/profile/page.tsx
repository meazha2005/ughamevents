'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { uploadImageToPhpBackend } from '@/lib/upload';
import { openRazorpayModal } from '@/lib/razorpay';
import { College } from '@/lib/types';
import {
  User,
  Mail,
  Phone,
  Building,
  Lock,
  Camera,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  ExternalLink,
  XCircle,
  Menu,
  X,
  Compass,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Copy,
  MessageCircle,
  Trash2,
  Trophy,
  Sparkles,
  FileText,
  Upload,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser, logout } = useAuth();

  const [colleges, setColleges] = useState<College[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'security'>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Hack Pick Team State
  const [hackPickTeam, setHackPickTeam] = useState<any>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamActionLoading, setTeamActionLoading] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');
  const [teamError, setTeamError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // PPT and Topic State
  const [editDomain, setEditDomain] = useState('Open Innovation');
  const [editTopic, setEditTopic] = useState('');
  const [pptUrl, setPptUrl] = useState('');
  const [submittingPpt, setSubmittingPpt] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCollegeName(user.college_name || '');
      setProfilePic(user.profile_pic || '');
    }

    async function fetchData() {
      try {
        const [collegesRes, meRes] = await Promise.all([
          fetch('/api/colleges'),
          fetch('/api/auth/me'),
        ]);

        const collegesData = await collegesRes.json();
        if (collegesData.success) {
          setColleges(collegesData.colleges);
        }

        const meData = await meRes.json();
        if (meData.success && meData.registrations) {
          setRegistrations(meData.registrations);
        }
      } catch (e) {
        console.error('Error fetching profile data', e);
      } finally {
        setLoadingData(false);
      }
    }

    if (user) {
      fetchData();
      fetchHackPickTeam();
    }
  }, [user, authLoading, router]);

  const fetchHackPickTeam = async () => {
    setTeamLoading(true);
    try {
      const res = await fetch('/api/hackpick/team');
      const data = await res.json();
      if (data.success && data.in_team && data.team) {
        setHackPickTeam(data.team);
        setEditDomain(data.team.domain || 'Open Innovation');
        setEditTopic(data.team.topic || '');
        setPptUrl(data.team.ppt_url || '');
      } else {
        setHackPickTeam(null);
      }
    } catch (err) {
      console.error('Failed to fetch hackpick team', err);
    } finally {
      setTeamLoading(false);
    }
  };

  const handlePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPic(true);
    setProfileError('');
    setProfileMessage('');

    try {
      const url = await uploadImageToPhpBackend(file, 'profiles');
      setProfilePic(url);

      await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          college_name: collegeName,
          profile_pic: url,
        }),
      });

      await refreshUser();
      setProfileMessage('Profile picture updated successfully!');
    } catch (err: any) {
      setProfileError('Failed to upload picture: ' + err.message);
    } finally {
      setUploadingPic(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    setProfileMessage('');

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          college_name: collegeName,
          profile_pic: profilePic,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      await refreshUser();
      setProfileMessage('Profile information saved successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRemoveMember = async (memberUserId: number, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

    setTeamActionLoading(true);
    setTeamError('');
    setTeamMessage('');

    try {
      const res = await fetch('/api/hackpick/team/remove-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: hackPickTeam.id,
          member_user_id: memberUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove member');
      }

      setTeamMessage(data.message || 'Member removed. You can now invite a replacement.');
      await fetchHackPickTeam();
    } catch (err: any) {
      setTeamError(err.message || 'Failed to remove member');
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handlePayHackPick = async () => {
    if (!hackPickTeam) return;

    setTeamActionLoading(true);
    setTeamError('');
    setTeamMessage('');

    try {
      const orderRes = await fetch('/api/hackpick/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: hackPickTeam.id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      await openRazorpayModal({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'UGHAM Events',
        description: `HACK PICK 2026 Registration Fee (Team: ${hackPickTeam.team_name})`,
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
            setTeamMessage('Verifying payment signature with Razorpay...');
            const verifyRes = await fetch('/api/hackpick/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                team_id: hackPickTeam.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setTeamMessage('Payment verified successfully! Welcome to HACK PICK 2026.');
              await fetchHackPickTeam();
            } else {
              setTeamError(verifyData.error || 'Payment verification failed');
            }
          } catch (e: any) {
            setTeamError('Payment verification error: ' + e.message);
          } finally {
            setTeamActionLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setTeamActionLoading(false);
            fetchHackPickTeam();
          },
        },
      });
    } catch (err: any) {
      setTeamError(err.message || 'Payment initiation error');
      setTeamActionLoading(false);
    }
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackPickTeam) return;

    setTeamActionLoading(true);
    setTeamError('');
    setTeamMessage('');

    try {
      const res = await fetch('/api/hackpick/team/update-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: hackPickTeam.id,
          domain: editDomain,
          topic: editTopic.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update topic');
      }

      setTeamMessage('Domain & topic updated successfully!');
      await fetchHackPickTeam();
    } catch (err: any) {
      setTeamError(err.message || 'Failed to update topic');
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handleSubmitPpt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackPickTeam) return;

    if (!pptUrl.trim()) {
      setTeamError('Please provide a Google Drive presentation link');
      return;
    }

    if (!confirm('Are you sure you want to finalize this PPT submission? Once submitted, your domain, topic, and PPT are locked and finalized.')) {
      return;
    }

    setSubmittingPpt(true);
    setTeamError('');
    setTeamMessage('');

    try {
      const res = await fetch('/api/hackpick/team/submit-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: hackPickTeam.id,
          ppt_url: pptUrl.trim(),
          domain: editDomain,
          topic: editTopic.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit PPT');
      }

      setTeamMessage('Round 1 PPT submitted and finalized successfully!');
      await fetchHackPickTeam();
    } catch (err: any) {
      setTeamError(err.message || 'PPT submission failed');
    } finally {
      setSubmittingPpt(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0020d8] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isLeader = hackPickTeam?.leader_id === user.id;

  return (
    <div className="min-h-screen bg-slate-50/60 flex">
      {/* ================= DESKTOP LEFT SIDEBAR ================= */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/80 p-6 justify-between flex-shrink-0 min-h-screen sticky top-0">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-36 flex items-center">
              <Image
                src="/logo.png"
                alt="UGHAM"
                width={150}
                height={40}
                style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
          </Link>

          {/* Student Profile Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-ugham-gradient p-0.5 flex-shrink-0">
              {user.profile_pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profile_pic}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-ugham-gradient flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">
                {user.college_name || 'UGHAM Student'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-ugham-gradient text-white shadow-ugham'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>My Profile Details</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'events'
                  ? 'bg-ugham-gradient text-white shadow-ugham'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>My Registered Events</span>
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {registrations.length + (hackPickTeam ? 1 : 0)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-ugham-gradient text-white shadow-ugham'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4" />
                <span>Security & Password</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-1">
            <Link
              href="/events"
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#0020d8] hover:bg-blue-50 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Browse All Events</span>
            </Link>
            <Link
              href="/"
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#0020d8] hover:bg-blue-50 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Bottom Sign Out */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE HAMBURGER DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Image
                  src="/logo.png"
                  alt="UGHAM"
                  width={140}
                  height={38}
                  style={{ maxHeight: '36px', width: 'auto', objectFit: 'contain' }}
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student info */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-ugham-gradient p-0.5 flex-shrink-0">
                  {user.profile_pic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profile_pic}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-ugham-gradient text-white shadow-ugham'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile Information</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('events');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'events'
                      ? 'bg-ugham-gradient text-white shadow-ugham'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Registered Events</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('security');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'security'
                      ? 'bg-ugham-gradient text-white shadow-ugham'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Security & Password</span>
                </button>
              </nav>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link
                  href="/events"
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-4 py-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Events</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-4 py-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Home Page</span>
                </Link>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto w-full">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm"
          >
            <Menu className="w-4 h-4 text-[#0020d8]" />
            <span>Menu</span>
          </button>

          <Link href="/" className="relative h-8 w-28 flex items-center">
            <Image
              src="/logo.png"
              alt="UGHAM"
              width={120}
              height={32}
              style={{ maxHeight: '30px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          <div className="w-8 h-8 rounded-full overflow-hidden bg-ugham-gradient p-0.5">
            {user.profile_pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profile_pic}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ================= TAB 1: PROFILE EDIT ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#0020d8] uppercase tracking-wider">
                Personal Information
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Student Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Update your student details, profile photo, and institutional college name.
              </p>
            </div>

            {profileMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{profileMessage}</span>
              </div>
            )}

            {profileError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-ugham-card space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 border-2 border-dashed border-[#0020d8]/40 p-1 flex items-center justify-center shadow-sm">
                    {profilePic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profilePic}
                        alt={name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <label className="absolute bottom-1 right-1 p-2 bg-[#0020d8] text-white rounded-full shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePicUpload}
                      disabled={uploadingPic}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Profile Picture</h4>
                  <p className="text-xs text-slate-400">
                    Upload your face photo. Supported formats: JPG, PNG, WEBP.
                  </p>
                  {uploadingPic && (
                    <span className="text-xs text-[#0020d8] font-semibold block animate-pulse">
                      Uploading image...
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address (Account ID)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs sm:text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    College Name (Select from Dropdown) *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Select Your College --</option>
                      {colleges.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.city ? `(${c.city})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="py-3 px-8 rounded-xl text-white font-bold text-xs sm:text-sm bg-ugham-gradient shadow-ugham hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MY REGISTERED EVENTS ================= */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#7928ca] uppercase tracking-wider">
                  Event Participations
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  My Registered Events
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage your teams, payments, PPT submissions, and event schedules.
                </p>
              </div>

              <Link
                href="/events"
                className="px-4 py-2.5 rounded-xl bg-ugham-gradient text-white font-bold text-xs shadow-ugham flex items-center gap-1.5 w-fit"
              >
                <span>Find More Events</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {teamMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{teamMessage}</span>
              </div>
            )}

            {teamError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{teamError}</span>
              </div>
            )}

            {/* ========== HACK PICK DEDICATED TEAM PORTAL CARD ========== */}
            {hackPickTeam ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-ugham-card space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-ugham-gradient" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#7928ca]">
                      <Trophy className="w-3.5 h-3.5" />
                      HACK PICK 2026 Team Portal
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Team: {hackPickTeam.team_name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        hackPickTeam.payment_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {hackPickTeam.payment_status === 'paid'
                        ? '₹149 Paid (Verified) ✓'
                        : 'Payment Pending (₹149)'}
                    </span>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {isLeader ? '👑 Team Leader' : 'Team Member'}
                    </span>
                  </div>
                </div>

                {/* Team Invite Code Banner */}
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-blue-900 tracking-wider block">
                      Share Invite Code With Teammates (2 to 3 Members)
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Teammates can log in and enter this code on the HACK PICK page to join your team.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-blue-200 shadow-sm">
                    <code className="text-base font-black text-[#0020d8] font-mono tracking-wider">
                      {hackPickTeam.invite_code}
                    </code>
                    <button
                      onClick={() => copyInviteCode(hackPickTeam.invite_code)}
                      className="p-1 text-slate-500 hover:text-[#0020d8] transition-colors"
                      title="Copy Invite Code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copiedCode && (
                      <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                    )}
                  </div>
                </div>

                {/* Team Members List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Team Members ({hackPickTeam.members?.length || 1} / 3)
                    </h3>
                    {isLeader && hackPickTeam.members?.length < 3 && (
                      <span className="text-xs text-[#0020d8] font-semibold">
                        + Can invite {3 - (hackPickTeam.members?.length || 1)} more member(s)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {hackPickTeam.members?.map((m: any) => (
                      <div
                        key={m.user_id}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                m.role === 'leader'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {m.role === 'leader' ? 'Leader 👑' : 'Member'}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 truncate">{m.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                          <p className="text-[11px] text-slate-500 truncate">{m.phone || 'No phone'}</p>
                          <p className="text-[11px] text-slate-600 font-medium truncate mt-1">
                            {m.college_name || 'Institution'}
                          </p>
                        </div>

                        {/* Leader can remove and replace members */}
                        {isLeader && m.role !== 'leader' && (
                          <div className="pt-3 mt-3 border-t border-slate-200 flex justify-end">
                            <button
                              onClick={() => handleRemoveMember(m.user_id, m.name)}
                              disabled={teamActionLoading}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove & Replace</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment & WhatsApp Section */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hackPickTeam.payment_status === 'paid' ? (
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Payment Confirmed (₹149)
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Payment ID: <strong>{hackPickTeam.payment_id}</strong>
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>Registration Verified! Official WhatsApp group invite link has been sent to your registered email.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-amber-800 font-bold text-xs uppercase tracking-wider">
                          Registration Fee Pending: ₹149 / team
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          The team leader must complete the payment to access mentor support and unlock Round 1 PPT submission.
                        </p>
                      </div>

                      {isLeader ? (
                        <button
                          onClick={handlePayHackPick}
                          disabled={teamActionLoading}
                          className="w-full py-2.5 px-4 rounded-xl bg-ugham-gradient text-white font-bold text-xs shadow-ugham hover:opacity-95 transition-all flex items-center justify-center gap-2"
                        >
                          {teamActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <span>Pay ₹149 with Razorpay</span>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          Awaiting Team Leader payment
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pitching Event Milestones Info */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5 text-slate-600">
                    <strong className="text-slate-900 block font-bold mb-1">
                      Pitching Event Timeline & Milestones:
                    </strong>
                    <p>• <strong>Nov 15, 2026:</strong> Domains, Problem Statements & PPT format released.</p>
                    <p>• <strong>Nov 25, 2026:</strong> Registration closes & PPT deadline (Google Drive link).</p>
                    <p>• <strong>Dec 18, 2026:</strong> Round 1 Results will be released!</p>
                    <p>• <strong>Rounds 2, 3 & 4 (Grand Finale):</strong> Dates will be announced soon.</p>
                  </div>
                </div>

                {/* Round 1 PPT Submission Box */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0020d8]" />
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Round 1 Online: PPT Presentation Submission
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        hackPickTeam.is_ppt_submitted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {hackPickTeam.is_ppt_submitted ? 'Finalized ✓' : 'Draft / Not Submitted'}
                    </span>
                  </div>

                  {hackPickTeam.is_ppt_submitted ? (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
                      <p className="text-xs text-emerald-800 font-semibold">
                        Your Round 1 PPT submission has been finalized and submitted for official evaluation.
                      </p>
                      <div className="text-xs text-slate-700 space-y-1">
                        <p><strong>Domain:</strong> {hackPickTeam.domain}</p>
                        <p><strong>Topic / Problem:</strong> {hackPickTeam.topic || 'General'}</p>
                        <p>
                          <strong>Submitted Date:</strong>{' '}
                          {new Date(hackPickTeam.ppt_submitted_at).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <a
                        href={hackPickTeam.ppt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Submitted Google Drive PPT</span>
                      </a>
                    </div>
                  ) : isLeader ? (
                    <form onSubmit={handleSubmitPpt} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Team leaders can select and change their domain and topic anytime prior to submitting the PPT. Once submitted, your submission will be finalized for evaluation.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Domain Category
                          </label>
                          <select
                            value={editDomain}
                            onChange={(e) => setEditDomain(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0020d8]"
                          >
                            <option value="Open Innovation">Open Innovation</option>
                            <option value="AI & Machine Learning">AI & Machine Learning</option>
                            <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                            <option value="Smart Healthcare & MedTech">Smart Healthcare & MedTech</option>
                            <option value="Smart Automation & IoT">Smart Automation & IoT</option>
                            <option value="Fintech & Cybersecurity">Fintech & Cybersecurity</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Problem Statement / Topic Title
                          </label>
                          <input
                            type="text"
                            placeholder="Enter chosen topic title"
                            value={editTopic}
                            onChange={(e) => setEditTopic(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0020d8]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Google Drive PPT Link *
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://drive.google.com/file/d/..."
                          value={pptUrl}
                          onChange={(e) => setPptUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#0020d8]"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Ensure link access is set to &quot;Anyone with the link can view&quot;.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleUpdateTopic}
                          disabled={teamActionLoading}
                          className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all"
                        >
                          Save Domain & Topic Only
                        </button>

                        <button
                          type="submit"
                          disabled={submittingPpt || hackPickTeam.payment_status !== 'paid'}
                          className="py-2.5 px-6 rounded-xl bg-ugham-gradient text-white font-bold text-xs shadow-ugham hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {submittingPpt ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Submit & Finalize PPT</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500">
                      Only the Team Leader can submit and finalize the Round 1 PPT Google Drive link.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Invitation Banner to register for HACK PICK if not yet enrolled */
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-6 sm:p-8 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#0020d8] text-white">
                    Featured Event
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Ready to compete in HACK PICK?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg">
                    Form a team of 2-3 members and compete for ₹37,000 cash prizes across 4 rounds.
                  </p>
                </div>
                <Link
                  href="/events/hack-pick"
                  className="px-6 py-3 rounded-2xl bg-ugham-gradient text-white font-bold text-xs shadow-ugham hover:opacity-95 transition-all whitespace-nowrap"
                >
                  Register Team for HACK PICK →
                </Link>
              </div>
            )}

            {/* Other Registered Events */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                All Event Registrations
              </h3>

              {registrations.length === 0 && !hackPickTeam ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-ugham-card">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">You have no other event registrations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-ugham-card flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0020d8]">
                            {reg.category_name || 'Event'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              reg.status === 'registered'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {reg.status === 'registered' ? 'Registered ✓' : 'Cancelled'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {reg.event_title}
                        </h4>

                        <div className="text-xs text-slate-500 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#7928ca]" />
                            {new Date(reg.event_date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#c0047e]" />
                            {reg.venue}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/events/${reg.event_slug}`}
                          className="text-xs font-bold text-[#0020d8] hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SECURITY & PASSWORD ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <span className="text-xs font-bold text-[#c0047e] uppercase tracking-wider">
                Account Security
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Change Password
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Keep your student account safe with a strong, private password.
              </p>
            </div>

            {passwordMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordMessage}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-ugham-card">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="py-3 px-8 rounded-xl text-white font-bold text-xs sm:text-sm bg-ugham-gradient shadow-ugham hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
