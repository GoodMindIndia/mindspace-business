import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface DemoRequestInput {
  companyName: string;
  workEmail: string;
  companySize: string;
  message: string;
  /** Which CTA on the page opened the modal — nav, hero, or the closing band. */
  sourcePage: string;
}

/**
 * Records an inbound "Request a Demo" lead (see schema-demo-requests.sql).
 * Throws when Supabase isn't configured so the caller can fall back to a
 * plain mailto — never silently drop a real prospect's contact info.
 */
export async function submitDemoRequest(input: DemoRequestInput): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('not-configured');
  }

  const { error } = await supabase.from('demo_requests').insert({
    company_name: input.companyName.trim(),
    work_email: input.workEmail.trim(),
    company_size: input.companySize,
    message: input.message.trim(),
    source_page: input.sourcePage,
  });

  if (error) throw error;
}
