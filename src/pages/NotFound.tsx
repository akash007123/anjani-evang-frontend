import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="py-24 sm:py-32 text-center bg-cream min-h-screen flex items-center justify-center relative overflow-hidden">
      <SEO 
        title="Page Not Found" 
        description="The culinary pathway you requested does not exist. Let us guide you back to our exquisite catering selections and menus."
        urlPath="/404"
      />
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.03]" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80')` }} />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center px-4 max-w-xl mx-auto z-10 flex flex-col gap-6 items-center">
        <span className="font-serif text-7xl sm:text-8xl font-extrabold text-primary tracking-widest leading-none block">
          404
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
          Culinary Pathway Not Found
        </h1>
        <p className="font-sans text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
          The page or gastronomic pathway you are trying to visit is not configured or has moved. Let's return you back to our main dining selections.
        </p>
        <div className="pt-2 flex items-center gap-4">
          <Link
            to="/"
            className="bg-secondary hover:bg-secondary-hover text-white font-sans font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md flex items-center gap-1.5 transition-transform hover:scale-[1.01]"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
          <Link
            to="/menu"
            className="bg-transparent border border-slate-200 hover:border-primary hover:bg-white text-secondary font-sans font-semibold text-xs sm:text-sm px-6 py-3 rounded-full transition-colors"
          >
            Explore Menu Book
          </Link>
        </div>
      </div>
    </div>
  );
}
