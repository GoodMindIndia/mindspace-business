import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TARA_ACCENTS, type TaraAccent } from '@/lib/tara-accent';

interface TaraAccentPickerProps {
  accent: TaraAccent;
  onChange: (accent: TaraAccent) => void;
  /** Hidden during an active call — switching mid-conversation isn't offered. */
  disabled?: boolean;
}

/** Inline trigger plus a "Choose your voice" modal.
 *
 * The modal renders through a portal on purpose: EmployeeLayout wraps every
 * page in `.ms-fade-up`, and that animation's `transform` makes any `fixed`
 * descendant resolve against the wrapper instead of the viewport — so a
 * backdrop rendered in place would dim only part of the screen. */
export function TaraAccentPicker({ accent, onChange, disabled }: TaraAccentPickerProps) {
  const [open, setOpen] = useState(false);
  const current = TARA_ACCENTS.find((a) => a.id === accent) ?? TARA_ACCENTS[0];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (disabled) return null;

  return (
    <>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-[#D9D2C5] bg-white/70 py-1.5 pl-2 pr-3 text-xs font-medium text-[#3E4F42] transition-all hover:-translate-y-0.5 hover:border-[#3D5C5F]/40 hover:bg-white hover:shadow-sm cursor-pointer"
        >
          <AccentBadge option={current} size="sm" selected />
          <span>{current.id === 'auto' ? 'Auto' : current.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#9AA79C] transition-transform group-hover:translate-y-px" />
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1B2A1F]/50 p-0 backdrop-blur-md sm:items-center sm:p-6"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="tara-voice-title"
              onClick={(e) => e.stopPropagation()}
              className="ms-fade-up w-full max-w-[420px] rounded-t-[28px] border border-[#EAE4D9] bg-[#FDFBF7] p-6 shadow-[0_40px_80px_-20px_rgba(20,35,25,0.45)] sm:rounded-[28px] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="tara-voice-title" className="font-serif text-[22px] leading-tight text-[#233226]">
                    Choose your voice
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#78897B]">
                    Pick the accent that feels right for you
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9AA79C] transition-colors hover:bg-[#F1ECE3] hover:text-[#233226] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div role="radiogroup" aria-labelledby="tara-voice-title" className="mt-6 flex flex-col gap-1.5">
                {TARA_ACCENTS.map((option) => {
                  const isSelected = accent === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        onChange(option.id);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex items-center gap-3.5 rounded-2xl border px-3.5 py-3 text-left transition-all cursor-pointer',
                        isSelected
                          ? 'border-[#2D6A4F]/45 bg-[#2D6A4F]/[0.07] shadow-[inset_0_0_0_1px_rgba(45,106,79,0.12)]'
                          : 'border-transparent bg-white hover:border-[#E4DDD1] hover:bg-[#FCFAF6]',
                      )}
                    >
                      <AccentBadge option={option} selected={isSelected} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium leading-snug text-[#233226]">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-snug text-[#8C9A8F]">
                          {option.description}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
                          isSelected ? 'bg-[#2D6A4F] text-white' : 'border border-[#DDD6C9]',
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-center text-[11px] text-[#A3AFA5]">Changes apply from your next call</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function AccentBadge({
  option,
  selected,
  size = 'md',
}: {
  option: (typeof TARA_ACCENTS)[number];
  selected?: boolean;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide',
        size === 'sm' ? 'h-5 w-5 text-[9px]' : 'h-9 w-9 text-[10.5px]',
        selected ? 'bg-[#2D6A4F]/12 text-[#2D6A4F]' : 'bg-[#F1ECE3] text-[#8C9A8F]',
      )}
    >
      {option.badge || <Globe className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />}
    </span>
  );
}
