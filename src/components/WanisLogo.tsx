import { useId } from 'react';

export type WanisLogoVariant = 'mark' | 'full' | 'stacked';

export interface WanisLogoProps {
  /** Icon edge length in pixels */
  size?: number;
  variant?: WanisLogoVariant;
  className?: string;
  /** Subtitle under wordmark (full / stacked) */
  tagline?: string;
  /** Wordmark colors for background */
  theme?: 'dark' | 'light';
  /** Clickable brand button */
  onClick?: () => void;
}

/** Open-book companion mark  emerald cover, gold spine, story lines, gentle voice arcs */
export function WanisLogoMark({
  size = 40,
  className = '',
  idPrefix = 'wanis',
}: {
  size?: number;
  className?: string;
  idPrefix?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const p = `${idPrefix}-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden={true}
    >
      <defs>
        <linearGradient id={`${p}-gold`} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e3c778" />
          <stop offset="1" stopColor="#a08131" />
        </linearGradient>
        <linearGradient id={`${p}-cover`} x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2c523f" />
          <stop offset="0.55" stopColor="#1b382b" />
          <stop offset="1" stopColor="#0d2118" />
        </linearGradient>
        <linearGradient id={`${p}-paper`} x1="20" y1="18" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffaf0" />
          <stop offset="1" stopColor="#e8ddc4" />
        </linearGradient>
        <filter id={`${p}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Badge  protective frame for care homes */}
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="16"
        fill={`url(#${p}-cover)`}
        stroke={`url(#${p}-gold)`}
        strokeWidth="2.5"
      />
      <rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="12"
        stroke="#c9a84c"
        strokeOpacity="0.25"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Voice arcs  oral history / TTS */}
      <path
        d="M12 28c0-4 2.5-7 6-7M12 36c0-6 3.5-10 8-10"
        stroke="#e3c778"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M52 28c0-4-2.5-7-6-7M52 36c0-6-3.5-10-8-10"
        stroke="#e3c778"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Open life-book (RTL spine on the right) */}
      <path
        d="M22 20h18c1.5 0 2.5 1 2.5 2.5v19c0 1.2-1 2-2.2 1.6L32 40l-8.3 3.1c-1.2.4-2.2-.4-2.2-1.6V22.5c0-1.4 1-2.5 2.5-2.5z"
        fill={`url(#${p}-paper)`}
        stroke="#c9a84c"
        strokeWidth="1.2"
      />
      <path
        d="M22 20H16c-1.4 0-2.5 1.1-2.5 2.5v17c0 1.2 1 2 2.2 1.6L22 38V20z"
        fill="#f4ecd8"
        stroke="#c9a84c"
        strokeWidth="1"
        strokeOpacity="0.85"
      />

      {/* Spine & golden bookmark ribbon (و as companion thread) */}
      <path d="M32 20v22" stroke={`url(#${p}-gold)`} strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M32 22c4 2 6 5 6 9s-2 7-6 9"
        stroke="#e3c778"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        filter={`url(#${p}-glow)`}
      />

      {/* Story lines */}
      <path d="M24 26h10M24 30h8M24 34h11" stroke="#a08131" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      <path d="M17 27h5M17 31h4" stroke="#a08131" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

      {/* Heart of companionship  where memories live */}
      <path
        d="M32 44c-2.2-2.8-7-4.2-7-7.8 0-2.2 1.6-3.5 3.4-3.5 1.4 0 2.4.7 3.6 2.1 1.2-1.4 2.2-2.1 3.6-2.1 1.8 0 3.4 1.3 3.4 3.5 0 3.6-4.8 5-7 7.8z"
        fill="#c9a84c"
        fillOpacity="0.95"
      />

      {/* Sparkle  dignity & celebration */}
      <path
        d="M46 14l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4L46 14z"
        fill="#e3c778"
      />
    </svg>
  );
}

export function WanisLogo({
  size = 40,
  variant = 'full',
  className = '',
  tagline,
  theme = 'dark',
  onClick,
}: WanisLogoProps) {
  const defaultTagline = 'كتاب الحياة';
  const sub = tagline ?? defaultTagline;
  const titleClass = theme === 'light' ? 'text-[#2c1e16]' : 'text-[#f4ecd8]';
  const subClass = theme === 'light' ? 'text-[#a08131]' : 'text-[#c9a84c]/90';
  const alignClass = variant === 'stacked' ? 'items-center' : 'items-start';

  const mark = <WanisLogoMark size={size} className="shrink-0 drop-shadow-md" />;

  const wordmark = (
    <span className={`flex flex-col leading-none ${alignClass}`}>
      <span
        className={`font-amiri font-bold tracking-tight ${titleClass}`}
        style={{ fontSize: size * 0.55 }}
      >
        ونيس
      </span>
      {(variant === 'full' || variant === 'stacked') && (
        <span
          className={`font-cairo font-semibold mt-0.5 ${subClass}`}
          style={{ fontSize: Math.max(10, size * 0.22) }}
        >
          {sub}
        </span>
      )}
    </span>
  );

  const inner =
    variant === 'mark' ? (
      mark
    ) : variant === 'stacked' ? (
      <span className="inline-flex flex-col items-center gap-2 text-center">
        {mark}
        {wordmark}
      </span>
    ) : (
      <span className="inline-flex items-center gap-2.5">
        {mark}
        {wordmark}
      </span>
    );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c120a] ${className}`}
        aria-label="ونيس  الصفحة الرئيسية"
      >
        {inner}
      </button>
    );
  }

  return <span className={`inline-flex items-center ${className}`}>{inner}</span>;
}
