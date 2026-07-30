import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../lib/api';
import { 
  Check, Eye, EyeOff, Save, Key, User as UserIcon, Shield, Sparkles, AlertCircle 
} from 'lucide-react';

export default function Settings() {
  const { currentUser, updateProfile } = useAdminAuth();

  // Profile forms
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || '');

  useEffect(() => {
    setFirstName(currentUser?.firstName || '');
    setLastName(currentUser?.lastName || '');
    setEmail(currentUser?.email || '');
    setMobile(currentUser?.mobile || '');
    setProfilePicture(currentUser?.profilePicture || '');
  }, [currentUser]);

  // Password forms
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Password Strength Indicators
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const notSameName = newPassword.toLowerCase() !== firstName.toLowerCase() && 
                      newPassword.toLowerCase() !== lastName.toLowerCase();
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial && notSameName && passwordsMatch;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser?.id) {
        await api.updateProfile({ firstName, lastName, email, mobile, profilePicture });
      }
      updateProfile({ firstName, lastName, email, mobile, profilePicture });
    } catch (err) {
      console.error('Failed to save profile', err);
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setPasswordError('Please ensure the new password adheres to all safety rules.');
      return;
    }
    try {
      if (currentUser?.id) {
        await api.resetPassword(currentUser.email, newPassword);
      }
    } catch (err) {
      console.error('Failed to change password', err);
      setPasswordError('Failed to change password. Please try again.');
      return;
    }
    setPasswordSaved(true);
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePicture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Sidebar Details / Preview card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center font-sans space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative group">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={firstName}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-primary/20 shadow-md transition-all group-hover:brightness-90"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-primary text-secondary font-serif text-4xl font-extrabold flex items-center justify-center shadow-md">
                {firstName[0] || 'A'}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[10px] font-bold rounded-3xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <span>Change Photo</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </label>
          </div>

          <h4 className="font-serif text-lg font-bold text-secondary mt-4 leading-snug">
            {firstName} {lastName}
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Anjani Executive Partner
          </p>
        </div>

        <div className="border-t border-slate-50 pt-5 space-y-4 text-xs font-semibold text-left">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block">PARTNER ACCOUNT LEVEL</span>
            <p className="text-secondary mt-0.5 flex items-center gap-1.5 font-bold">
              <Shield className="w-4 h-4 text-primary" />
              <span>Super Administrator Access</span>
            </p>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold block">REGISTERED MOBILE CONTACT</span>
            <p className="text-slate-600 mt-0.5 font-medium">{mobile || 'Not set'}</p>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold block">REGISTERED EMAIL CONTACT</span>
            <p className="text-slate-600 mt-0.5 font-medium truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Main Settings Forms Grid */}
      <div className="lg:col-span-2 space-y-8 text-left">
        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-5 h-5 text-primary" />
              <h4 className="font-serif text-lg font-bold text-secondary">
                Partner Profile Settings
              </h4>
            </div>
            {profileSaved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl">
                <Check className="w-4 h-4" /> Saved Successfully!
              </span>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-secondary font-semibold text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-secondary font-semibold text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-secondary font-semibold text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Mobile Number</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-secondary font-semibold text-xs sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2 border-t border-slate-50 pt-5 mt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-secondary hover:bg-slate-850 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Credentials</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm text-left">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Key className="w-5 h-5 text-primary" />
              <h4 className="font-serif text-lg font-bold text-secondary">
                Change Console Password
              </h4>
            </div>
            {passwordSaved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl">
                <Check className="w-4 h-4" /> Password Reset!
              </span>
            )}
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 font-sans text-xs sm:text-sm">
            {passwordError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-500">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-secondary font-semibold text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New & Confirm Passwords in grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-secondary font-semibold text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify new password"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-secondary font-semibold text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Checklist Requirements */}
            {newPassword && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-500 text-left space-y-2">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5">Password Compliance Scorecard</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasMinLen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={hasMinLen ? 'text-emerald-600' : 'text-slate-400'}>Minimum 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasUpper ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={hasUpper ? 'text-emerald-600' : 'text-slate-400'}>At least 1 uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasLower ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={hasLower ? 'text-emerald-600' : 'text-slate-400'}>At least 1 lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={hasNumber ? 'text-emerald-600' : 'text-slate-400'}>At least 1 numerical digit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={hasSpecial ? 'text-emerald-600' : 'text-slate-400'}>At least 1 special symbol</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${notSameName ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={notSameName ? 'text-emerald-600' : 'text-slate-400'}>Not match First or Last name</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={passwordsMatch ? 'text-emerald-600' : 'text-slate-400'}>Passwords match precisely</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="border-t border-slate-50 pt-5 mt-4 flex justify-end">
              <button
                type="submit"
                disabled={!isPasswordValid}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                  isPasswordValid 
                    ? 'bg-secondary text-white hover:bg-slate-850 cursor-pointer' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Confirm New Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
