import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { NavItem, isPathActive, isDropdownActive } from '../../data/navigation';
import { useLanguage } from '../../context/LanguageContext';

interface NavDropdownProps {
  item: NavItem;
}

export default function NavDropdown({ item }: NavDropdownProps) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const dropdownItems = item.dropdown || [];
  const isActive = isDropdownActive(pathname, dropdownItems);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation and Escape listener
  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleKeyDownOnTrigger = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => {
        menuItemsRef.current[0]?.focus();
      }, 50);
    }
  };

  const handleKeyDownOnItem = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % dropdownItems.length;
      menuItemsRef.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + dropdownItems.length) % dropdownItems.length;
      menuItemsRef.current[prevIndex]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative py-2 group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDownOnTrigger}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${t(item.nameKey)} menu`}
        className={`flex items-center gap-1.5 font-sans font-medium text-sm transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary rounded-md px-1 py-0.5 cursor-pointer ${
          isActive || isOpen ? 'text-primary font-semibold' : 'text-white/90 hover:text-primary'
        }`}
      >
        <span>{t(item.nameKey)}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-primary' : 'text-white/70 group-hover:text-primary'
          }`}
        />
        {/* Active Underline Indicator */}
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
            isActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </button>

      {/* Floating Dropdown Card */}
      <div
        role="menu"
        aria-orientation="vertical"
        aria-label={`${t(item.nameKey)} sub-menu`}
        className={`absolute left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 px-1.5 border border-slate-100/80 transition-all duration-300 transform origin-top-left z-50 ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 visible'
            : 'opacity-0 -translate-y-2 scale-95 invisible pointer-events-none'
        }`}
      >
        {/* Arrow indicator */}
        <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white rotate-45 border-t border-l border-slate-100/80 rounded-tl-sm pointer-events-none" />

        <div className="flex flex-col gap-0.5 relative z-10">
          {dropdownItems.map((subItem, idx) => {
            const isSubActive = isPathActive(pathname, subItem.path);
            return (
              <Link
                key={subItem.id}
                ref={(el) => {
                  menuItemsRef.current[idx] = el;
                }}
                to={subItem.path}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                onKeyDown={(e) => handleKeyDownOnItem(e, idx)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSubActive
                    ? 'bg-primary/15 text-primary shadow-xs'
                    : 'text-slate-700 hover:bg-cream/80 hover:text-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  <span>{t(subItem.nameKey)}</span>
                </div>
                {isSubActive && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
