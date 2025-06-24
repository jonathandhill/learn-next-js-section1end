'use client';

import { getSupabaseClient } from '../lib/supabase/shared-client';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return <Button onClick={logout}>Logout</Button>;
}
