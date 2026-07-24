import { useState, useEffect } from 'react';
import { Facebook, Instagram, Linkedin, Star } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { getTeam } from '../data/getAsyncData';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';

export default function Team() {
  const { language, t } = useLanguage();
  const { data: teamMembers } = useAsyncData(() => getTeam(language), [], [language]);

  return (
    <div>
      <SEO 
        title={t('teamTitle')} 
        description={t('teamSubtitle')}
        urlPath="/team"
      />
      <PageBanner 
        title={t('teamTitle')} 
        breadcrumbs={[{ name: t('ourTeam') }]} 
        backgroundImage="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Main Team Showcase Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('teamTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              {t('teamSubtitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-white rounded-2xl overflow-hidden border border-slate-50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group text-left flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square relative overflow-hidden bg-slate-100">
                    <img
                      src={member.image}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <div className="flex items-center gap-2.5">
                        {member.socials.instagram && (
                          <a href={member.socials.instagram} className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary text-white hover:text-secondary transition-all flex items-center justify-center border border-white/15" aria-label="Instagram">
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {member.socials.facebook && (
                          <a href={member.socials.facebook} className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary text-white hover:text-secondary transition-all flex items-center justify-center border border-white/15" aria-label="Facebook">
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                        {member.socials.linkedin && (
                          <a href={member.socials.linkedin} className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary text-white hover:text-secondary transition-all flex items-center justify-center border border-white/15" aria-label="LinkedIn">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-2">
                    <span className="text-primary font-sans text-xs uppercase tracking-wider font-bold">
                      {member.role}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-secondary">
                      {member.name}
                    </h3>
                    <p className="font-sans text-slate-500 text-xs sm:text-sm leading-relaxed mt-1 font-medium">
                      {member.bio}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <div className="border-t border-slate-100 pt-3 flex items-center gap-1.5 text-xs text-slate-400 font-sans">
                    <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                    <span>Highly Praised by Clients</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
