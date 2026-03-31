'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-white/80 hover:text-white underline underline-offset-2 transition"
    >
      Log out
    </button>
  );
}
