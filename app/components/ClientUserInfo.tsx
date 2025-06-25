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
      console.log('🔍 ClientUserInfo - Getting initial session');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        '📋 ClientUserInfo - Initial session:',
        session ? 'exists' : 'none'
      );
      console.log('👤 ClientUserInfo - Initial user:', session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 ClientUserInfo - Auth state change:', event);
      console.log(
        '👤 ClientUserInfo - User in auth change:',
        session?.user?.email
      );
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
