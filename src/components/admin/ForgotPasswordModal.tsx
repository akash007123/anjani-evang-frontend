import React, { useState, useEffect } from 'react';
import { 
  X, Mail, KeyRound, Lock, CheckCircle2, ShieldCheck, 
  AlertCircle, ArrowRight, Loader2, Eye, EyeOff, Sparkles, Send
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessReset: (email: string, password: string) => void;
}

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordModal({ isOpen, onClose, onSuccessReset }: ForgotPasswordModalProps) {
  const { verifyAccount, resetPassword } = useAdminAuth();

  const [step, setStep] = useState<Step>('email');
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  // Auto-clear message alerts
  useEffect(() => {
    if (otpSentMessage) {
      const timer = setTimeout(() => {
        setOtpSentMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [otpSentMessage]);

  if (!isOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrMobile.trim()) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await verifyAccount(emailOrMobile.trim());
      if (res.success) {
        // Generate a 6-digit random code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setOtpSentMessage(`[Gateway Simulator] Verification OTP code sent to registered channel: ${code}`);
        setStep('otp');
      } else {
        setError(res.error || 'No administrator account matches that input.');
      }
    } catch (err) {
      setError('An error occurred during account verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim() === generatedOtp) {
      setStep('reset');
    } else {
      setError('Invalid verification code. Please check the code in the simulator notification.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Check strength complexity
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setError('Password must contain uppercase, lowercase, numeric, and special characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPassword(emailOrMobile.trim(), newPassword);
      if (res.success) {
        setStep('success');
      } else {
        setError(res.error || 'Failed to update credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during password update.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onSuccessReset(emailOrMobile.trim(), newPassword);
    // Reset component state
    setStep('email');
    setEmailOrMobile('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedOtp('');
    setError('');
    onClose();
  };

  const triggerResendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSentMessage(`[Gateway Simulator] New verification OTP code resent: ${code}`);
    setError('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-slate-900/60 backdrop-blur-sm font-sans">
        {/* Gateway Simulator Pop-up overlay banner */}
        {otpSentMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 max-w-md w-full z-55 px-4"
          >
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl shadow-xl text-left flex gap-3 relative">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
                <Send className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                  Secure SMS & Mailer Relay Sim
                </h4>
                <p className="text-xs font-semibold text-amber-800 leading-normal break-words">
                  {otpSentMessage}
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedOtp);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-2 py-1 rounded-lg cursor-pointer transition-all"
                >
                  Copy OTP Code
                </button>
              </div>
              <button 
                onClick={() => setOtpSentMessage(null)}
                className="text-amber-500 hover:text-amber-700 absolute right-3 top-3 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-secondary tracking-tight">
              {step === 'email' && 'Reset Password'}
              {step === 'otp' && 'Verify Account'}
              {step === 'reset' && 'Create New Password'}
              {step === 'success' && 'Reset Successful'}
            </h3>
            <p className="text-xs text-slate-400 font-semibold font-sans mt-1 max-w-[280px]">
              {step === 'email' && 'Verify your administrative email or mobile contact details.'}
              {step === 'otp' && `Enter the 6-digit verification code sent to ${emailOrMobile}.`}
              {step === 'reset' && 'Enforce a strong unique security key for your login credentials.'}
              {step === 'success' && 'Your credentials have been updated securely in local persistence.'}
            </p>
          </div>

          {/* Form Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Multi-step Form Content */}
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.form 
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOTP}
                className="space-y-4"
              >
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500">Email or Mobile Number</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={emailOrMobile}
                      onChange={(e) => setEmailOrMobile(e.target.value)}
                      placeholder="e.g. admin@anjanievents.in"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-secondary text-white font-bold rounded-2xl shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Verifying account...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Code</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {step === 'otp' && (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleVerifyOTP}
                className="space-y-4"
              >
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500">6-Digit Recovery OTP</label>
                    <button 
                      type="button" 
                      onClick={triggerResendOtp}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit code"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-mono tracking-widest font-bold placeholder-slate-400 text-xs sm:text-sm text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-secondary text-white font-bold rounded-2xl shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <span>Verify Recovery Code</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                  }}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Change Email or Mobile
                </button>
              </motion.form>
            )}

            {step === 'reset' && (
              <motion.form 
                key="reset-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                {/* Password Strength Requirements Helper */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-semibold text-slate-500 space-y-1 text-left">
                  <p className="font-bold text-secondary text-xs mb-1">Password requirements:</p>
                  <p className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>At least 8 characters long</span>
                  </p>
                  <p className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Includes both upper & lowercase letters</span>
                  </p>
                  <p className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Includes numeric & special characters</span>
                  </p>
                </div>

                {/* New Password */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-500">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm"
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

                {/* Confirm Password */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-500">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-secondary font-semibold placeholder-slate-400 text-xs sm:text-sm"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-secondary text-white font-bold rounded-2xl shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Set New Password</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {step === 'success' && (
              <motion.div 
                key="success-step"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5 text-center py-4"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-9 h-9 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-lg font-bold text-secondary">
                    Password Reset Complete
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 px-4 leading-relaxed">
                    Your password has been updated. You can now securely sign in to your Partner Admin dashboard using your new credentials.
                  </p>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-2xl shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <span>Return & Auto-Fill Login</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
