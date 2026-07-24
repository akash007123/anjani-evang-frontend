import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  Eye, EyeOff, User as UserIcon, Mail, Phone, Lock, Camera, 
  ShieldCheck, ArrowRight, ShieldAlert, Check, X 
} from 'lucide-react';
import SEO from '../../components/SEO';

export default function Signup() {
  const { signup } = useAdminAuth();
  const navigate = useNavigate();

  // Basic Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  // Passwords
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Live Password Checklist Requirements
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const notSameName = firstName ? (password.toLowerCase() !== firstName.toLowerCase() && 
                      password.toLowerCase() !== lastName.toLowerCase()) : true;
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial && notSameName && passwordsMatch;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Only image files are permitted.');
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

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    
    // Email regex
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email address format is required.';
    }

    // Mobile regex
    if (!mobile.trim()) {
      errors.mobile = 'Mobile phone number is required.';
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(mobile)) {
      errors.mobile = 'Valid phone format (e.g. +1 (555) 019-2834) is required.';
    }

    if (!profilePicture) {
      errors.profilePicture = 'An admin profile picture is required for secure authentication logging.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!isPasswordValid) {
      setErrorMessage('Please ensure your password meets all standard safety metrics.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await signup({
      firstName,
      lastName,
      email,
      mobile,
      profilePicture
    }, password);

    setIsLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMessage(res.error || 'Registration failed. Try again with unique details.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative font-sans">
      <SEO 
        title="Create Admin Account" 
        description="Register a new coordinator or lead kitchen manager account on Anjani Catering & Events's control panel."
        urlPath="/admin-signup"
      />
      <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
        {/* Brand Banner */}
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-md">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-secondary tracking-tight">
              Create Admin Account
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Register details as a lead culinary organizer or managing partner.
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <label className="relative cursor-pointer shrink-0 group">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile upload"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/25 shadow-sm brightness-95"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-secondary transition-all">
                  <Camera className="w-5.5 h-5.5" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Profile Photo * (Max 5MB)
            </span>
            {validationErrors.profilePicture && (
              <p className="text-[11px] text-rose-500 font-bold mt-1 text-center">{validationErrors.profilePicture}</p>
            )}
          </div>

          {/* First & Last Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alexander"
                className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-2xl focus:outline-none text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm ${
                  validationErrors.firstName ? 'border-rose-400' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {validationErrors.firstName && (
                <p className="text-[11px] text-rose-500 font-bold mt-1">{validationErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Vance"
                className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-2xl focus:outline-none text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm ${
                  validationErrors.lastName ? 'border-rose-400' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {validationErrors.lastName && (
                <p className="text-[11px] text-rose-500 font-bold mt-1">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Address & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eveng.com"
                className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-2xl focus:outline-none text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm ${
                  validationErrors.email ? 'border-rose-400' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {validationErrors.email && (
                <p className="text-[11px] text-rose-500 font-bold mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500">Mobile Number *</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-2xl focus:outline-none text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm ${
                  validationErrors.mobile ? 'border-rose-400' : 'border-slate-200 focus:border-primary'
                }`}
              />
              {validationErrors.mobile && (
                <p className="text-[11px] text-rose-500 font-bold mt-1">{validationErrors.mobile}</p>
              )}
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left relative">
              <label className="text-xs font-bold text-slate-500">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1 text-left relative">
              <label className="text-xs font-bold text-slate-500">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Verify password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm"
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
          {password && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-500 text-left space-y-1.5 font-sans">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Safety Strength Compliance Check</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span className={hasMinLen ? 'text-emerald-600' : 'text-slate-400'}>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span className={hasUpper ? 'text-emerald-600' : 'text-slate-400'}>At least 1 uppercase letter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasLower ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span className={hasLower ? 'text-emerald-600' : 'text-slate-400'}>At least 1 lowercase letter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span className={hasNumber ? 'text-emerald-600' : 'text-slate-400'}>At least 1 numerical digit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span className={hasSpecial ? 'text-emerald-600' : 'text-slate-400'}>At least 1 special symbol</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {notSameName ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span className={notSameName ? 'text-emerald-600' : 'text-slate-400'}>Not match First or Last name</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  {passwordsMatch ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span className={passwordsMatch ? 'text-emerald-600' : 'text-slate-400'}>Passwords match precisely</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid}
            className={`w-full py-3.5 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
              isLoading || !isPasswordValid
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-secondary hover:bg-slate-850 hover:shadow-lg cursor-pointer'
            }`}
          >
            {isLoading ? (
              <span>Registering...</span>
            ) : (
              <>
                <span>Register Console Account</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Redirect to login footer */}
        <div className="border-t border-slate-100 pt-5 mt-6 text-center text-xs font-semibold text-slate-500">
          <span>Already registered as a partner? </span>
          <Link to="/admin-login" className="text-secondary font-bold hover:underline cursor-pointer">
            Sign In Console
          </Link>
        </div>
      </div>
    </div>
  );
}
