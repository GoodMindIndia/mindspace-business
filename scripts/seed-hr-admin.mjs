// One-time script to create real Supabase Auth accounts for HR admins and
// register them in `hr_admins`. Requires the project's SERVICE ROLE key —
// never the anon key, never commit it, never run this in the browser.
//
// Usage:
//   SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=xxx \
//   node scripts/seed-hr-admin.mjs
//
// Edit ACCOUNTS below before running — these are placeholders matching the
// old demo credentials in AuthContext.tsx, meant to be replaced with real
// HR emails and strong passwords (or removed once real accounts exist).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Fill this in before each run, then clear it back to [] afterwards — don't
// leave real passwords committed here once an account has been created.
// Each entry: { email, password, orgId, name, title }
const ACCOUNTS = [];

for (const acct of ACCOUNTS) {
  const { data, error } = await admin.auth.admin.createUser({
    email: acct.email,
    password: acct.password,
    email_confirm: true,
  });

  if (error && !error.message.includes('already been registered')) {
    console.error(`Failed to create ${acct.email}:`, error.message);
    continue;
  }

  let userId = data?.user?.id;
  if (!userId) {
    const { data: list } = await admin.auth.admin.listUsers();
    userId = list?.users.find((u) => u.email === acct.email)?.id;
  }
  if (!userId) {
    console.error(`Could not resolve a user id for ${acct.email}`);
    continue;
  }

  const { error: upsertError } = await admin
    .from('hr_admins')
    .upsert({ id: userId, org_id: acct.orgId, name: acct.name, title: acct.title });

  if (upsertError) {
    console.error(`Failed to register ${acct.email} in hr_admins:`, upsertError.message);
  } else {
    console.log(`Ready: ${acct.email} is an HR admin for org "${acct.orgId}".`);
  }
}
