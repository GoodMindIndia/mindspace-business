import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  Compass,
  ShieldCheck,
  PhoneCall,
  Wind,
  Eye,
  Feather,
  Volume2,
  X,
} from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { DoodleCanvas } from './components/DoodleCanvas';
import { GroundingExercise } from './components/GroundingExercise';
import { BreathingCalmer } from './components/BreathingCalmer';
import { WorryDissolver } from './components/WorryDissolver';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import {
  analyzeFeelingWithLLM,
  type LLMSuggestionResponse,
} from '@/services/self-help-llm-service';

type RecommendableTool = 'grounding' | 'breathing' | 'dissolve' | 'sounds';

const TOOL_META: Record<RecommendableTool, { label: string; icon: typeof Eye }> = {
  grounding: { label: '5-4-3-2-1 Grounding', icon: Eye },
  breathing: { label: 'Paced Breathing', icon: Wind },
  dissolve: { label: 'Thought Dissolver', icon: Feather },
  sounds: { label: 'Ambient Soundscapes', icon: Volume2 },
};

const QUICK_FEELINGS = [
  { label: 'Panic & Fast Heartbeat', query: 'I am having a panic attack, my heart is beating fast and I feel breathless.' },
  { label: 'Severe Anxiety & Dread', query: 'I feel intense anxiety and dread about my work and deadlines.' },
  { label: 'Depressed & Low Energy', query: 'I feel sad, empty, unmotivated, and exhausted.' },
  { label: 'Burnt Out & Overwhelmed', query: 'I am overwhelmed by constant work pressure and mental fatigue.' },
  { label: 'Racing Thoughts & Insomnia', query: 'My brain won’t stop spinning with 100 thoughts and I cannot concentrate.' },
  { label: 'Anger & Frustration', query: 'I feel irritated, tense, and angry with everything around me.' },
];

export function SelfHelpPage() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<LLMSuggestionResponse | null>(null);
  const [toolDismissed, setToolDismissed] = useState(false);

  const recommendedTool: RecommendableTool | null =
    !toolDismissed && suggestion?.matchedToolId && suggestion.matchedToolId !== 'doodle'
      ? suggestion.matchedToolId
      : null;

  const recommendedDoodleId =
    suggestion?.matchedToolId === 'doodle' ? suggestion.recommendedDoodleId : undefined;

  // Handle Feeling Submission
  const handleAnalyze = async (queryToUse?: string) => {
    const query = (queryToUse ?? inputText).trim();
    if (!query) return;

    setIsLoading(true);
    try {
      const res = await analyzeFeelingWithLLM(query);
      setSuggestion(res);
      setToolDismissed(false);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuickFeeling = (item: typeof QUICK_FEELINGS[0]) => {
    setInputText(item.query);
    handleAnalyze(item.query);
  };

  return (
    <div className="flex flex-col gap-6 pb-16 font-sans">
      <PageHero
        eyebrow="Self-help sanctuary"
        icon={Feather}
        tone="green"
        badge="Private & confidential"
        title="How are you feeling right now?"
        sub="Say it in your own words and we'll match you to a grounding, breathing or doodling exercise, or build one for you on the spot."
      />

      {/* SECTION 1: Top Direct Feeling Check-in */}
      <section className="rounded-2xl bg-white p-5 sm:p-7 border border-[#EAE4D9] flex flex-col gap-4">
        {/* Quick Situation Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_FEELINGS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSelectQuickFeeling(item)}
              className="rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE8] text-[#243327] border border-[#EAE4D9] hover:border-[#2D6A4F]/40 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Text Input & Submit */}
        <div className="flex flex-col gap-3 pt-1">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe what is on your mind or how your body feels (e.g. 'I feel a sudden panic attack...', 'I'm exhausted and hopeless...', 'Everything is moving too fast...')"
            className="w-full rounded-2xl border border-[#D9D2C5] bg-[#FAF7F2]/40 p-3.5 text-xs sm:text-sm text-[#243327] placeholder:text-[#9AA79C] focus:border-[#2D6A4F] focus:bg-white focus:outline-none transition-all"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#78897B] hidden sm:inline">
              Powered by mental wellbeing insights
            </span>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={!inputText.trim() || isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#234F3B] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing feeling...</span>
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4" />
                  <span>Get Activities & Guidance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic LLM Results: Empathy Note & Custom Tailored Activity */}
        {suggestion && !isLoading && (
          <div className="flex flex-col gap-3.5 pt-2 border-t border-[#EAE4D9] animate-fade-in">
            {/* Empathetic Insight Note */}
            <div className="rounded-2xl bg-[#F4F8F5] border border-[#D5E5D8] p-4 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F] text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F]">
                  Guidance Note
                </span>
                <p className="text-xs sm:text-sm text-[#233226] leading-relaxed">
                  {suggestion.empathyVerdict}
                </p>
              </div>
            </div>

            {/* Custom Generated Activity from LLM in Text Format */}
            {suggestion.customActivity && (
              <div className="rounded-2xl bg-white border border-[#D9D2C5] p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#243327] text-white text-xs font-bold">
                      ★
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-[#233226] leading-snug">
                      Recommended Custom Activity: {suggestion.customActivity.title}
                    </h3>
                  </div>
                  <span className="self-start sm:self-center shrink-0 text-[11px] font-semibold text-[#2D6A4F] bg-[#E8F0EA] px-2.5 py-0.5 rounded-full">
                    {suggestion.customActivity.duration}
                  </span>
                </div>

                <p className="text-xs text-[#56685A] leading-relaxed">
                  {suggestion.customActivity.description}
                </p>

                <div className="rounded-xl bg-[#FAF7F2] border border-[#EAE4D9] p-3 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78897B]">
                    Action Steps:
                  </span>
                  <ul className="flex flex-col gap-1 text-xs text-[#243327]">
                    {suggestion.customActivity.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-[10px] font-bold text-white mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: Recommended tool, shown only after a feeling is analyzed */}
      {recommendedTool && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-[#233226]">
                Recommended for you: {TOOL_META[recommendedTool].label}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setToolDismissed(true)}
              className="flex items-center gap-1 self-start sm:self-center shrink-0 text-xs font-medium text-[#78897B] hover:text-[#233226] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Dismiss</span>
            </button>
          </div>

          {recommendedTool === 'grounding' && <GroundingExercise />}
          {recommendedTool === 'breathing' && <BreathingCalmer />}
          {recommendedTool === 'dissolve' && <WorryDissolver />}
          {recommendedTool === 'sounds' && <AmbientSoundPlayer />}
        </section>
      )}

      {/* SECTION 3: Zen Doodling — always available */}
      <section className="flex flex-col gap-4">
        {recommendedTool && (
          <h2 className="text-base sm:text-lg font-semibold text-[#233226]">Zen Doodling</h2>
        )}
        <DoodleCanvas initialDoodleId={recommendedDoodleId} />
      </section>

      {/* SECTION 4: Minimalist Crisis & Support Strip */}
      <section className="rounded-2xl bg-white p-4 border border-[#EAE4D9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#56685A]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#2D6A4F]" />
          <span>Need live human support? 100% confidential assistance is available 24/7.</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:988"
            className="font-semibold text-[#243327] hover:underline flex items-center gap-1"
          >
            <PhoneCall className="h-3.5 w-3.5 text-rose-600" />
            <span>Crisis Line (988)</span>
          </a>
          <span className="text-[#D9D2C5]">|</span>
          <a
            href="mailto:wellbeing@mindspace.example"
            className="font-semibold text-[#2D6A4F] hover:underline"
          >
            EAP Desk
          </a>
        </div>
      </section>
    </div>
  );
}

export default SelfHelpPage;
