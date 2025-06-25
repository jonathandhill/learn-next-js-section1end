'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/shared-client';

export function ClientUserInfo() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <span className="font-semibold">Loading...</span>;
  }

  return <span className="font-semibold">{user?.email || 'User'}</span>;
}
