import { useEffect, useRef, useState } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from 'sonner';
import { Loader2, Mic, MicOff, Phone, PhoneOff, MessageCircleHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/app/TenantContext';
import { startTaraSession, endTaraSession, OutOfCreditsError } from '@/services/credit-service';
import { PageHero } from '@/components/PageHero';
import { TaraAccentPicker } from '@/employee/TaraAccentPicker';
import { type TaraAccent, getAgentIdForAccent, getStoredTaraAccent, setStoredTaraAccent } from '@/lib/tara-accent';

export function TaraPage() {
  const { organization } = useTenant();
  const [muted, setMuted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [accent, setAccent] = useState<TaraAccent>(() => getStoredTaraAccent() ?? 'auto');
  const permissionGrantedRef = useRef(false);
  /** Set once startTaraSession opens a session, cleared once it's billed —
   * null means "nothing to settle" (never opened, or already settled). */
  const sessionIdRef = useRef<string | null>(null);
  /** Wall-clock time the call actually connected (not when startCall was
   * tapped) — duration is billed from real connected time only. */
  const connectedAtRef = useRef<number | null>(null);

  function chooseAccent(next: TaraAccent) {
    setAccent(next);
    setStoredTaraAccent(next);
  }

  /** Bills the open session for however long it was actually connected, then
   * clears the refs so a session is never billed twice. Safe to call even
   * when nothing is open (no-ops via endTaraSession's own sessionId check). */
  async function settleCall() {
    const sessionId = sessionIdRef.current;
    const connectedAt = connectedAtRef.current;
    sessionIdRef.current = null;
    connectedAtRef.current = null;

    const durationSeconds = connectedAt ? (Date.now() - connectedAt) / 1000 : 0;
    await endTaraSession(organization.orgId, sessionId, durationSeconds);
  }

  const conversation = useConversation({
    micMuted: muted,
    onError: (message) => {
      toast.error(`Tara ran into a problem: ${message || 'The session encountered an error.'}`);
    },
  });

  const callActive = conversation.status === 'connected';

  // End (and bill) the session if the user navigates away mid-call.
  useEffect(() => {
    return () => {
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
      if (sessionIdRef.current) {
        void settleCall();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCall() {
    setConnecting(true);
    setBlockedMessage(null);
    try {
      const { sessionId } = await startTaraSession(organization.orgId);
      sessionIdRef.current = sessionId;
    } catch (err) {
      if (err instanceof OutOfCreditsError) {
        setBlockedMessage(`${err.message} Contact your HR team to top up the plan.`);
        setConnecting(false);
        return;
      }
      // Fail open — a transient credit-check error shouldn't block support
      // access. sessionIdRef stays null, so settleCall() later is a no-op
      // rather than trying to bill a session that was never opened.
    }

    const agentId = getAgentIdForAccent(accent);
    if (!agentId) {
      toast.error("Tara isn't connected yet. Ask your admin to set up the voice agent.");
      setConnecting(false);
      return;
    }

    try {
      if (!permissionGrantedRef.current) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        permissionGrantedRef.current = true;
      }
      await conversation.startSession({ agentId });
      connectedAtRef.current = Date.now();
      setMuted(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please allow microphone access to talk to Tara.';
      toast.error(message);
    } finally {
      setConnecting(false);
    }
  }

  async function endCall() {
    setMuted(false);
    try {
      await conversation.endSession();
    } catch (err) {
      console.error('Failed to end Tara session:', err);
    } finally {
      await settleCall();
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHero
        eyebrow="Tara · AI companion"
        icon={MessageCircleHeart}
        tone="green"
        badge="Available 24/7"
        title="This space is yours now"
        sub="No judgement. No drama. No noise. Talk it through out loud. Nothing you say here is recorded, transcribed, or shared with anyone."
      />

      <div className="relative flex flex-col items-center gap-4 text-center pt-6 pb-2">
        {/* Idle breathing rings — makes it obvious the mic is live and
            waiting, not a static icon. Two rings, staggered, so the eye
            reads it as one continuous pulse rather than a blink. */}
        {!callActive && !connecting && (
          <>
            <span className="pointer-events-none absolute top-6 h-36 w-36 sm:h-40 sm:w-40 rounded-full border-2 border-[#4F6B57]/25 animate-[ms-pulse-ring_3.2s_ease-out_infinite]" aria-hidden />
            <span
              className="pointer-events-none absolute top-6 h-36 w-36 sm:h-40 sm:w-40 rounded-full border-2 border-[#4F6B57]/20 animate-[ms-pulse-ring_3.2s_ease-out_infinite]"
              style={{ animationDelay: '1.1s' }}
              aria-hidden
            />
          </>
        )}

        <button
          type="button"
          onClick={callActive ? endCall : startCall}
          disabled={connecting}
          aria-pressed={callActive}
          className={cn(
            'relative flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center rounded-full transition-all',
            connecting ? 'cursor-wait opacity-80' : 'cursor-pointer hover:scale-[1.03]',
            'shadow-[0_0_0_10px_rgba(79,107,87,0.06),0_20px_40px_-16px_rgba(35,50,38,0.35)]',
            callActive
              ? 'bg-gradient-to-b from-[#E05A4E] to-[#B0392E]'
              : 'bg-gradient-to-b from-[#6B8B72] to-[#234F3B] hover:from-[#75957C] hover:to-[#465E4D]',
          )}
        >
          {callActive && <span className="absolute inset-0 rounded-full bg-[#DC2626]/25 animate-ping" aria-hidden />}
          {connecting ? (
            <Loader2 className="h-11 w-11 text-white relative z-10 animate-spin" strokeWidth={1.75} />
          ) : callActive ? (
            <PhoneOff className="h-11 w-11 text-white relative z-10" strokeWidth={1.75} />
          ) : (
            <Phone className="h-11 w-11 text-white relative z-10" strokeWidth={1.75} />
          )}
        </button>

        <p className="text-sm font-semibold text-[#233226]">
          {connecting
            ? 'Connecting…'
            : callActive
              ? conversation.isSpeaking
                ? 'Tara is speaking…'
                : 'Tara is listening…'
              : 'Tap to talk'}
        </p>

        <TaraAccentPicker accent={accent} onChange={chooseAccent} disabled={callActive || connecting} />

        {blockedMessage && (
          <p role="alert" className="max-w-xs rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {blockedMessage}
          </p>
        )}
      </div>

      {callActive && (
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full border shadow-xs transition-colors cursor-pointer',
                muted ? 'bg-[#233226] border-[#233226] text-white' : 'bg-white border-[#D9D2C5] text-[#233226] hover:bg-[#F3EFE8]',
              )}
            >
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <span className="text-xs text-[#78897B]">{muted ? 'Unmute' : 'Mute'}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={endCall}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs transition-colors cursor-pointer"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
            <span className="text-xs text-[#78897B]">End call</span>
          </div>
        </div>
      )}

      <p className="mx-auto max-w-sm text-center text-[11px] leading-relaxed text-[#9AA79C]">
        Private. Nothing here is shared with your employer.
      </p>
    </div>
  );
}
