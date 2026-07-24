import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface PageBannerProps {
  title: string;
  breadcrumbs: { name: string; path?: string }[];
  backgroundImage?: string;
}

export default function PageBanner({ 
  title, 
  breadcrumbs, 
  backgroundImage = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80' 
}: PageBannerProps) {
  return (
    <div className="relative h-[320px] sm:h-[380px] flex items-center justify-center overflow-hidden">
      {/* Background Image with luxury dark gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#102417]/85 to-secondary/95" />

      {/* Decorative Golden Graphic Overlay */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />

      <div className="relative text-center px-4 max-w-4xl mx-auto z-10 animate-fade-in">
        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide mb-4 capitalize">
          {title}
        </h1>

        {/* Breadcrumb Navigation */}
        <nav className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 text-xs sm:text-sm font-sans font-medium text-white/95">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5 text-white/75">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-primary" />
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-primary transition-colors text-white/75">
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-primary font-semibold">{crumb.name}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Elegant Curved Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-cream" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />
    </div>
  );
}
