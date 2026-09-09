import type { ReactNode } from 'react';

/**
 * Original flat-style scenes drawn to the eucalyptus/oat palette — the three
 * views of a single working day the product actually produces: an employee's
 * private check-in, a confidential therapy call, and the aggregate-only report
 * that reaches HR. Hand-authored rather than a licensed illustration pack, so
 * the characters and the palette belong to this product.
 *
 * `HeroCollage` stacks them as overlapping cards for the hero; the scenes are
 * exported individually so they can be reused at other sizes.
 */

const TONE_BG = {
  mint: '#EAF2EB',
  clay: '#F4EBE2',
  deep: '#E8F0EA',
} as const;

export function IllustrationCard({
  tone,
  label,
  children,
  className = '',
}: {
  tone: keyof typeof TONE_BG;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] bg-white border border-[#EAE4D9] shadow-[0_25px_60px_-20px_rgba(35,50,38,0.25)] p-2 transition-transform duration-500 hover:-translate-y-1.5 ${className}`}
    >
      <div className="rounded-2xl overflow-hidden" style={{ background: TONE_BG[tone] }}>
        <svg viewBox="0 0 280 200" className="w-full h-auto block" role="img" aria-label={label}>
          {children}
        </svg>
      </div>
      <p className="mt-1.5 px-1 pb-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#78897B]">{label}</p>
    </div>
  );
}

/**
 * The hero visual: three overlapping cards plus the two accent shapes,
 * sized to sit in a hero column. Cards drift in on load rather than on
 * scroll, since the hero is above the fold.
 */
export function HeroCollage() {
  return (
    <div className="relative w-full max-w-[520px] mx-auto aspect-[10/9]">
      {/* Accent shapes — one warm, one cool, behind the cards */}
      <div
        aria-hidden
        className="ms-float-slow absolute left-[2%] bottom-[6%] h-16 w-16 sm:h-20 sm:w-20"
        style={{ background: '#E8B84B', borderRadius: '0 100% 0 0' }}
      />
      <div
        aria-hidden
        className="ms-float absolute left-[26%] bottom-0 h-8 w-8 sm:h-11 sm:w-11 rounded-full"
        style={{ background: '#C3D0C6' }}
      />

      {/* Employee check-in — largest, top-left */}
      <div className="ms-fade-up absolute left-0 top-[4%] w-[62%] z-10" style={{ animationDelay: '80ms' }}>
        <IllustrationCard tone="mint" label="Employee · private">
          <CheckInScene />
        </IllustrationCard>
      </div>

      {/* Therapy call — top-right, smallest */}
      <div className="ms-fade-up absolute right-0 top-0 w-[42%] z-20" style={{ animationDelay: '220ms' }}>
        <IllustrationCard tone="clay" label="Therapist · confidential">
          <TherapyScene />
        </IllustrationCard>
      </div>

      {/* Executive report — bottom-right, overlapping */}
      <div className="ms-fade-up absolute right-[4%] bottom-0 w-[54%] z-30" style={{ animationDelay: '360ms' }}>
        <IllustrationCard tone="deep" label="HR · aggregate only">
          <ReportScene />
        </IllustrationCard>
      </div>
    </div>
  );
}

/** Employee, phone in hand, tapping a one-tap mood picker. */
export function CheckInScene() {
  return (
    <>
      <rect x="0" y="0" width="280" height="200" fill="#EAF2EB" />
      <circle cx="235" cy="30" r="34" fill="#C3D0C6" opacity="0.5" />
      {/* window */}
      <rect x="24" y="24" width="46" height="40" rx="4" fill="#DCE8DD" stroke="#B9CDBC" strokeWidth="1.5" />
      <line x1="47" y1="24" x2="47" y2="64" stroke="#B9CDBC" strokeWidth="1.5" />
      <line x1="24" y1="44" x2="70" y2="44" stroke="#B9CDBC" strokeWidth="1.5" />
      {/* seated figure */}
      <ellipse cx="120" cy="176" rx="60" ry="8" fill="#B9CDBC" opacity="0.35" />
      <path d="M78 176 L78 132 Q78 108 120 108 Q162 108 162 132 L162 176 Z" fill="#3D5C5F" />
      <circle cx="120" cy="86" r="26" fill="#EFC9A0" />
      <path d="M96 76 Q98 54 120 54 Q142 54 144 76 L144 66 Q142 50 120 50 Q98 50 96 66 Z" fill="#2C2320" />
      {/* phone */}
      <rect x="103" y="120" width="34" height="54" rx="7" fill="#233226" />
      <rect x="107" y="126" width="26" height="38" rx="2" fill="#FAF7F2" />
      <text x="120" y="141" textAnchor="middle" fontSize="9" fill="#3E4F42" fontFamily="Inter, sans-serif" fontWeight="600">
        How are
      </text>
      <text x="120" y="151" textAnchor="middle" fontSize="9" fill="#3E4F42" fontFamily="Inter, sans-serif" fontWeight="600">
        you today?
      </text>
      <circle cx="112" cy="159" r="4" fill="#2D6A4F" />
      <circle cx="120" cy="159" r="4" fill="#E8B84B" />
      <circle cx="128" cy="159" r="4" fill="#D9D2C5" />
      {/* confirmation bubble */}
      <rect x="150" y="96" width="70" height="30" rx="10" fill="#FFFFFF" stroke="#D9D2C5" strokeWidth="1.25" />
      <path d="M158 126 L150 138 L166 126 Z" fill="#FFFFFF" stroke="#D9D2C5" strokeWidth="1.25" />
      <text x="185" y="115" textAnchor="middle" fontSize="9.5" fill="#233226" fontFamily="Inter, sans-serif" fontWeight="600">
        Logged. Just
      </text>
      <text x="185" y="126" textAnchor="middle" fontSize="9.5" fill="#233226" fontFamily="Inter, sans-serif" fontWeight="600">
        for you.
      </text>
    </>
  );
}

/** Confidential 1:1 video therapy session. */
export function TherapyScene() {
  return (
    <>
      <rect x="0" y="0" width="280" height="200" fill="#F4EBE2" />
      <circle cx="40" cy="170" r="46" fill="#EAD6BF" opacity="0.5" />
      <rect x="30" y="150" width="220" height="10" rx="3" fill="#C79A6B" />
      <rect x="30" y="160" width="220" height="6" fill="#A97C4F" />
      {/* laptop */}
      <rect x="86" y="86" width="108" height="70" rx="6" fill="#233226" />
      <rect x="93" y="93" width="94" height="56" rx="2" fill="#3D5C5F" />
      <circle cx="140" cy="112" r="16" fill="#D9A574" />
      <path d="M124 106 Q126 92 140 92 Q154 92 156 106" fill="#2C2320" />
      <rect x="118" y="128" width="44" height="16" rx="6" fill="#EFEAE0" />
      <rect x="86" y="150" width="108" height="10" rx="2" fill="#1A2320" />
      {/* employee with headset */}
      <ellipse cx="216" cy="176" rx="34" ry="7" fill="#C79A6B" opacity="0.3" />
      <path d="M198 176 L198 140 Q198 120 216 120 Q234 120 234 140 L234 176 Z" fill="#2D6A4F" />
      <circle cx="216" cy="104" r="20" fill="#EFC9A0" />
      <path d="M198 98 Q200 82 216 82 Q232 82 234 98 L234 92 Q232 78 216 78 Q200 78 198 92 Z" fill="#4A3626" />
      <path d="M195 92 Q195 108 200 112" fill="none" stroke="#233226" strokeWidth="3" strokeLinecap="round" />
      <path d="M237 92 Q237 108 232 112" fill="none" stroke="#233226" strokeWidth="3" strokeLinecap="round" />
      {/* privacy badge */}
      <rect x="20" y="24" width="94" height="24" rx="12" fill="#FFFFFF" stroke="#E4C9A6" strokeWidth="1.25" />
      <rect x="30" y="32" width="9" height="8" rx="1.5" fill="#9E6B38" />
      <path d="M32 32 L32 29 Q32 25 34.5 25 Q37 25 37 29 L37 32" fill="none" stroke="#9E6B38" strokeWidth="1.6" />
      <text x="72" y="40" textAnchor="middle" fontSize="8.5" fill="#835A2E" fontFamily="Inter, sans-serif" fontWeight="700">
        Notes stay private
      </text>
    </>
  );
}

/** HR reading the aggregate-only executive report. */
export function ReportScene() {
  return (
    <>
      <rect x="0" y="0" width="280" height="200" fill="#E8F0EA" />
      <circle cx="250" cy="20" r="30" fill="#C3D0C6" opacity="0.45" />
      <rect x="46" y="30" width="188" height="118" rx="8" fill="#233226" />
      <rect x="54" y="38" width="172" height="94" rx="3" fill="#FAF7F2" />
      <rect x="134" y="148" width="12" height="16" fill="#3E4F42" />
      <rect x="112" y="164" width="56" height="7" rx="3" fill="#3E4F42" />
      <rect x="62" y="46" width="70" height="7" rx="3" fill="#233226" />
      <rect x="62" y="57" width="46" height="5" rx="2.5" fill="#9AA79C" />
      <rect x="196" y="46" width="22" height="14" rx="7" fill="#E8F0EA" />
      {[
        { x: 62, h: 26 },
        { x: 78, h: 40 },
        { x: 94, h: 32 },
        { x: 110, h: 50 },
        { x: 126, h: 36 },
        { x: 142, h: 56 },
        { x: 158, h: 28 },
      ].map((bar, i) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={112 - bar.h}
          width="10"
          height={bar.h}
          rx="2"
          fill={i === 5 ? '#2D6A4F' : '#C3D0C6'}
        />
      ))}
      <rect x="178" y="66" width="40" height="52" rx="6" fill="#2D6A4F" />
      <circle cx="198" cy="78" r="6" fill="#FFFFFF" opacity="0.25" />
      <rect x="184" y="90" width="28" height="4" rx="2" fill="#FFFFFF" opacity="0.85" />
      <rect x="184" y="98" width="22" height="4" rx="2" fill="#FFFFFF" opacity="0.6" />
      <rect x="184" y="106" width="25" height="4" rx="2" fill="#FFFFFF" opacity="0.6" />
      <ellipse cx="140" cy="192" rx="52" ry="6" fill="#B9CDBC" opacity="0.3" />
      <path d="M104 192 L104 176 Q104 158 140 158 Q176 158 176 176 L176 192 Z" fill="#9E6B38" />
      <circle cx="140" cy="150" r="17" fill="#C98A5E" />
      <path d="M123 145 Q125 130 140 130 Q155 130 157 145 L157 138 Q155 126 140 126 Q125 126 123 138 Z" fill="#1F1712" />
    </>
  );
}
