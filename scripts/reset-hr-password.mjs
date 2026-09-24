// Sets a Supabase Auth user's password directly via the admin API — for
// accounts using placeholder emails (e.g. hr@mindspace.example) where the
// normal "send password recovery email" flow has nowhere real to deliver
// to. Requires the project's SERVICE ROLE key — never the anon key, never
// commit it, never run this in the browser.
//
// Usage:
//   SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=xxx \
//   node scripts/reset-hr-password.mjs someone@example.com "new-strong-password"

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [, , email, newPassword] = process.argv;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

if (!email || !newPassword) {
  console.error('Usage: node scripts/reset-hr-password.mjs <email> <new-password>');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await admin.auth.admin.listUsers();
if (listError) {
  console.error('Failed to list users:', listError.message);
  process.exit(1);
}

const user = list.users.find((u) => u.email === email);
if (!user) {
  console.error(`No Supabase Auth user found with email ${email}`);
  process.exit(1);
}

const { error } = await admin.auth.admin.updateUserById(user.id, { password: newPassword });
if (error) {
  console.error(`Failed to update password for ${email}:`, error.message);
  process.exit(1);
}

console.log(`Password updated for ${email}.`);
