import { Loader2, UtensilsCrossed } from 'lucide-react';
import { COMPANY_NAME } from '../../config/env';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  fullPage = true,
  message = "Preparing your gourmet culinary experience..."
}: LoadingSpinnerProps) {
  return (
    <div
      id="centralized-loading-spinner"
      className={`flex flex-col items-center justify-center bg-cream transition-all duration-300 ${
        fullPage 
          ? 'fixed inset-0 z-50 w-screen h-screen' 
          : 'w-full min-h-[400px] py-12'
      }`}
    >
      {/* Decorative ambient background glows */}
      {fullPage && (
        <>
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />
        </>
      )}

      <div className="relative flex flex-col items-center gap-6 max-w-sm px-6 text-center z-10">
        {/* Animated outer ring and inner icon */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* External decorative rotating culinary ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '1.2s' }} />
          
          {/* Secondary pulsing ring */}
          <div className="absolute inset-2 rounded-full border border-accent/20 border-b-accent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          
          {/* Inner themed icon */}
          <div className="w-10 h-10 rounded-full bg-linen flex items-center justify-center text-primary shadow-sm animate-pulse">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        {/* Informative elegant text */}
        <div className="flex flex-col gap-2">
          <span className="font-serif text-lg font-bold text-secondary tracking-wide">
            {COMPANY_NAME}
          </span>
          {message && (
            <p className="font-sans text-xs text-slate-500 uppercase tracking-[0.15em] font-medium animate-pulse">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
