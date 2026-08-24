import { useEffect, useRef, useState } from 'react';
import { useConversation } from '@11labs/react';
import { toast } from 'sonner';
import { Loader2, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/app/TenantContext';
import { startTaraSession, OutOfCreditsError } from '@/services/credit-service';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;

export function TaraPage() {
  const { organization } = useTenant();
  const [muted, setMuted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const permissionGrantedRef = useRef(false);

  const conversation = useConversation({
    micMuted: muted,
    onError: (message) => {
      toast.error(`Tara ran into a problem: ${message || 'The session encountered an error.'}`);
    },
  });

  const callActive = conversation.status === 'connected';

  // End the session if the user navigates away mid-call.
  useEffect(() => {
    return () => {
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCall() {
    setConnecting(true);
    setBlockedMessage(null);
    try {
      await startTaraSession(organization.orgId);
    } catch (err) {
      if (err instanceof OutOfCreditsError) {
        setBlockedMessage(`${err.message} Contact your HR team to top up the plan.`);
        setConnecting(false);
        return;
      }
      // Fail open — a transient credit-check error shouldn't block support access.
    }

    if (!AGENT_ID) {
      toast.error("Tara isn't connected yet. Ask your admin to set up the voice agent.");
      setConnecting(false);
      return;
    }

    try {
      if (!permissionGrantedRef.current) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        permissionGrantedRef.current = true;
      }
      await conversation.startSession({ agentId: AGENT_ID });
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
    }
  }

  return (
    <div className="flex flex-col items-center gap-10 pt-8 sm:pt-16 pb-12 text-center">
      <header className="flex flex-col items-center gap-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#233226]">
          This space is <span className="text-[#2D6A4F]">yours</span> now!
        </h1>
        <p className="text-sm italic text-[#9AA79C]">No judgement. No drama. No noise.</p>
      </header>

      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={callActive ? endCall : startCall}
          disabled={connecting}
          aria-pressed={callActive}
          className={cn(
            'relative flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center rounded-full transition-all',
            connecting ? 'cursor-wait opacity-80' : 'cursor-pointer',
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

        {blockedMessage && (
          <p role="alert" className="max-w-xs rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {blockedMessage}
          </p>
        )}
      </div>

      {callActive && (
        <div className="flex items-center gap-6">
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

      <p className="max-w-sm text-[11px] leading-relaxed text-[#9AA79C]">
        Private. Nothing here is shared with your employer.
      </p>
    </div>
  );
}
