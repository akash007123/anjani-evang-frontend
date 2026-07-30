import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  Eye, EyeOff, Mail, Lock, ShieldAlert, Sparkles, Check, ArrowRight, BookOpen 
} from 'lucide-react';
import SEO from '../../components/SEO';
import ForgotPasswordModal from '../../components/admin/ForgotPasswordModal';

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSuccessReset = (email: string, pass: string) => {
    setEmailOrMobile(email);
    setPassword(pass);
    setErrorMessage('');
    setSuccessMessage('Administrator password has been updated successfully. Please click Sign In below.');
    // Dismiss success message after 10s
    setTimeout(() => setSuccessMessage(''), 10000);
  };

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    if (!emailOrMobile.trim()) {
      errors.email = 'Email address or mobile number is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    const res = await login(emailOrMobile, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handlePrefillDemo = () => {
    setEmailOrMobile('akashraikwar763@gmail.com');
    setPassword('Ujjain@9685');
    setErrorMessage('');
    setValidationErrors({});
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative font-sans">
      <SEO 
        title="Admin Login - Control Panel Access" 
        description="Access the Anjani Catering & Events admin portal to manage events, client requests, menu settings, and catering schedules in Mumbai."
        urlPath="/admin-login"
      />
      {/* Decorative ambient blobs */}
      <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
        {/* Brand Banner */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-secondary tracking-tight">
              Sign In Admin Console
            </h3>
            <p className="text-xs text-slate-400 font-semibold font-sans mt-0.5">
              Enter your credentials to manage operations and calendars.
            </p>
          </div>
        </div>

        {/* Demo Prefill Quick Badge */}
        <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-2xl text-left flex items-start gap-3">
          <div className="p-1 rounded-lg bg-white/80 text-secondary shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-xs font-semibold text-secondary space-y-1.5 flex-1">
            <p>Reviewer Demo Credentials:</p>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-slate-600">
              <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">akashraikwar763@gmail.com</span>
              <span>/</span>
              <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">Admin123!</span>
            </div>
            <button
              onClick={handlePrefillDemo}
              className="text-[10px] font-extrabold text-secondary hover:underline cursor-pointer flex items-center gap-1 mt-1"
            >
              <span>Instant Prefill Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-600 flex items-start gap-2.5">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email or Mobile */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-500">Email or Mobile Number</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder="admin@anjanievents.in or +91..."
                className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-2xl focus:outline-none text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm ${
                  validationErrors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-[11px] text-rose-500 font-bold mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-500">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full pl-11 pr-10 py-3 bg-slate-50/50 border rounded-2xl focus:outline-none text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm ${
                  validationErrors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-[11px] text-rose-500 font-bold mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between py-1 font-sans text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="text-primary focus:ring-primary h-4 w-4 rounded-md border-slate-300"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsForgotOpen(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="font-bold text-secondary hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 bg-secondary text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-80 cursor-wait' : 'hover:bg-slate-850 hover:shadow-lg cursor-pointer'
            }`}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In Console</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Signup Redirect Footer */}
        <div className="border-t border-slate-100 pt-5 mt-6 text-center text-xs font-semibold text-slate-500">
          <span>Are you a new partner administrator? </span>
          <Link to="/admin-signup" className="text-secondary font-bold hover:underline cursor-pointer">
            Create Account
          </Link>
        </div>
      </div>

      {/* Interactive Verification & Password Reset Modal */}
      <ForgotPasswordModal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
        onSuccessReset={handleSuccessReset}
      />
    </div>
  );
}
