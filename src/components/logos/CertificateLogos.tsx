import React from 'react';

export const ECellNKOCETLogo: React.FC<{ className?: string }> = ({ className = "h-14" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Emblem SVG inspired by E-Cell NKOCET logo */}
      <svg className="h-full w-auto aspect-square overflow-visible" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Tech Gear / Circle */}
        <circle cx="50" cy="50" r="46" stroke="#0A192F" strokeWidth="4" fill="white" />
        <circle cx="50" cy="50" r="41" stroke="#0052FF" strokeWidth="1.5" strokeDasharray="3 3" />
        
        {/* Gradient background inside emblem */}
        <defs>
          <linearGradient id="ecell-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="rocket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052FF" />
            <stop offset="100%" stopColor="#0A192F" />
          </linearGradient>
        </defs>
        
        {/* Inner colored arc */}
        <path d="M 20 65 A 35 35 0 1 1 80 65" fill="none" stroke="url(#ecell-grad)" strokeWidth="6" strokeLinecap="round" />
        
        {/* Center Human silhouette with raised arms & Rocket */}
        <path d="M 50 22 L 53 32 L 50 30 L 47 32 Z" fill="#EF4444" />
        <circle cx="50" cy="36" r="4" fill="#F59E0B" />
        <path d="M 50 42 C 43 45, 38 40, 34 33 C 39 46, 44 54, 46 68 L 54 68 C 56 54, 61 46, 66 33 C 62 40, 57 45, 50 42 Z" fill="#10B981" />
        
        {/* Gear and bulb details around bottom */}
        <path d="M 30 75 Q 50 88 70 75" fill="none" stroke="#0A192F" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="74" r="3" fill="#F59E0B" />
      </svg>
      
      {/* Separator Line */}
      <div className="h-10 w-[2px] bg-navy/80 rounded-full"></div>
      
      {/* Typography */}
      <div className="flex flex-col justify-center leading-none">
        <span className="font-extrabold text-navy text-lg tracking-tight font-sans">E-CELL</span>
        <span className="font-bold text-navy text-base tracking-wider font-sans">NKOCET</span>
      </div>
    </div>
  );
};

export const NECIITBLogo: React.FC<{ className?: string }> = ({ className = "h-14" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Lightbulb + Rocket Logo Icon */}
      <svg className="h-full w-auto aspect-square overflow-visible" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bulb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        {/* Lightbulb shape */}
        <path d="M 40 10 C 20 10, 10 26, 10 44 C 10 58, 22 68, 26 78 L 54 78 C 58 68, 70 58, 70 44 C 70 26, 60 10, 40 10 Z" fill="url(#bulb-grad)" />
        {/* Bulb base */}
        <rect x="28" y="80" width="24" height="6" rx="2" fill="#94A3B8" />
        <rect x="32" y="88" width="16" height="4" rx="2" fill="#64748B" />
        {/* Rocket silhouette cut out inside bulb */}
        <path d="M 40 24 C 44 32, 45 42, 45 54 L 48 62 L 40 59 L 32 62 L 35 54 C 35 42, 36 32, 40 24 Z" fill="#0A192F" />
        <circle cx="40" cy="38" r="2.5" fill="#3B82F6" />
      </svg>
      
      {/* Typography Stack */}
      <div className="flex flex-col text-left leading-tight">
        <span className="text-[9px] font-semibold text-navy tracking-wider uppercase">E-CELL IIT BOMBAY'S</span>
        <span className="text-sm font-black text-electric-blue tracking-tight leading-none uppercase font-sans">
          NATIONAL
        </span>
        <span className="text-[13px] font-black text-navy tracking-tight leading-none uppercase font-sans">
          ENTREPRENEURSHIP
        </span>
        <div className="flex items-center justify-between gap-1 mt-[1px]">
          <span className="text-xs font-black text-electric-blue tracking-tight">CHALLENGE</span>
          <span className="text-xs font-black text-navy">2026</span>
        </div>
        <span className="text-[7px] font-bold text-gray-600 tracking-wider uppercase mt-[2px]">
          WE RISE BY LIFTING OTHERS
        </span>
      </div>
    </div>
  );
};
