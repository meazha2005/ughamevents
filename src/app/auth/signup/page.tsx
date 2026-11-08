'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { uploadImageToPhpBackend } from '@/lib/upload';
import {
  User,
  Mail,
  Phone,
  Building,
  Lock,
  Camera,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [colleges, setColleges] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchColleges() {
      try {
        const res = await fetch('/api/colleges');
        const data = await res.json();
        if (data.success && Array.isArray(data.colleges)) {
          setColleges(data.colleges);
        }
      } catch (e) {
        console.error('Failed to load colleges', e);
      } finally {
        setLoadingColleges(false);
      }
    }
    fetchColleges();
  }, []);

  const handlePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPic(true);
    setError('');

    try {
      const url = await uploadImageToPhpBackend(file, 'profiles');
      setProfilePic(url);
    } catch (err: any) {
      setError('Failed to upload profile picture: ' + (err.message || 'Error'));
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!collegeName) {
      setError('Please select your college from the dropdown');
      return;
    }

    setLoading(true);

    try {
      let res: Response;
      try {
        res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            college_name: collegeName,
            password,
            profile_pic: profilePic,
          }),
        });
      } catch {
        throw new Error('Connection failed. Please check your internet connection or server status.');
      }

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned error status ${res.status}.`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please check your details.');
      }

      await refreshUser();
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-ugham-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#c0047e] bg-fuchsia-50 mb-3">
            Student Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your <span className="text-ugham-gradient">Account</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Join thousands of students competing in national hackathons and tech events
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-[#0020d8]/40 overflow-hidden flex items-center justify-center shadow-inner">
                {profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePic} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>

              <label
                htmlFor="avatar-input"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0020d8] text-white cursor-pointer hover:bg-[#7928ca] transition-colors shadow-md"
                title="Upload Profile Picture (Saved to PHP Backend)"
              >
                {uploadingPic ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePicUpload}
                  disabled={uploadingPic}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-xs text-slate-500 mt-2">
              {uploadingPic
                ? 'Uploading to PHP backend...'
                : profilePic
                ? 'Profile picture uploaded ✓'
                : 'Upload Profile Picture (Optional)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
              />
            </div>
          </div>

          {/* College Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              College Name (Select from Dropdown) *
            </label>
            <div className="relative">
              <Building className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all appearance-none cursor-pointer"
              >
                <option value="">
                  {loadingColleges ? 'Loading college list...' : '-- Select Your College --'}
                </option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Select your institution from the registered colleges list.
            </p>
          </div>

          {/* Password fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0020d8] transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingPic}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-ugham-gradient shadow-ugham hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your account...
              </>
            ) : (
              <>
                Create Student Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already registered?{' '}
            <Link
              href="/auth/signin"
              className="font-bold text-[#0020d8] hover:text-[#c0047e] transition-colors"
            >
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
