import React from 'react';
import { User, Building2 } from 'lucide-react';
import { UserRole } from '../../types';

interface NeutralAvatarProps {
  src?: string | null;
  name?: string;
  role?: UserRole | 'institute';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-full';
}

export const NeutralAvatar: React.FC<NeutralAvatarProps> = ({
  src,
  name = 'User',
  role,
  size = 'md',
  className = '',
  rounded = 'rounded-xl',
}) => {
  // Check if valid non-empty, non-fake image URL
  const hasValidImage =
    Boolean(src) &&
    typeof src === 'string' &&
    src.trim() !== '' &&
    !src.includes('unsplash.com') &&
    !src.includes('hod_admin_portrait');

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-2xl',
  }[size];

  const imgSizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  if (hasValidImage) {
    return (
      <img
        src={src!}
        alt={name}
        className={`${imgSizeClasses} ${rounded} object-cover border border-slate-700/80 shadow shrink-0 ${className}`}
      />
    );
  }

  // Neutral Initials / Vector Icon Avatar
  const bgClasses = {
    admin: 'bg-blue-950/90 text-blue-300 border-blue-800/60 shadow-blue-950/40',
    teacher: 'bg-emerald-950/90 text-emerald-300 border-emerald-800/60 shadow-emerald-950/40',
    student: 'bg-amber-950/90 text-amber-300 border-amber-800/60 shadow-amber-950/40',
    institute: 'bg-slate-800 text-slate-300 border-slate-700 shadow-slate-900/40',
  }[role || 'institute'];

  // Clean initials from title/name
  const cleanName = (name || '')
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '')
    .trim();

  let initials = '';
  if (cleanName) {
    const parts = cleanName.split(/[\s-]+/).filter(Boolean);
    if (parts.length >= 2) {
      initials = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0].substring(0, 2).toUpperCase();
    }
  }

  return (
    <div
      className={`${sizeClasses} ${bgClasses} ${rounded} border flex items-center justify-center font-bold font-mono tracking-tight shrink-0 select-none shadow ${className}`}
      title={name}
      aria-label={name}
    >
      {initials ? initials : <User className="w-1/2 h-1/2" />}
    </div>
  );
};
