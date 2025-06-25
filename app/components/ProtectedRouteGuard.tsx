'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/shared-client';

interface ProtectedRouteGuardProps {
  children: React.ReactNode;
}

export function ProtectedRouteGuard({ children }: ProtectedRouteGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🛡️ ProtectedRouteGuard - Checking authentication');
      const supabase = getSupabaseClient();

      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        '📋 ProtectedRouteGuard - Initial session:',
        session ? 'exists' : 'none'
      );
      console.log(
        '👤 ProtectedRouteGuard - Initial user:',
        session?.user?.email
      );

      if (session) {
        console.log('✅ ProtectedRouteGuard - User authenticated');
        setAuthenticated(true);
        setLoading(false);
      } else {
        console.log(
          '❌ ProtectedRouteGuard - No session, redirecting to login'
        );
        router.push('/login');
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 ProtectedRouteGuard - Auth state change:', event);
      console.log(
        '👤 ProtectedRouteGuard - User in auth change:',
        session?.user?.email
      );

      if (event === 'SIGNED_IN' && session) {
        console.log('✅ ProtectedRouteGuard - User signed in');
        setAuthenticated(true);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ ProtectedRouteGuard - User signed out, redirecting');
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
