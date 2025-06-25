'use client';

import { LoginForm } from '@/components/login-form';
import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/shared-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in when landing on login page
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log(
          '🔍 Login page - User already logged in, redirecting to /protected'
        );
        router.push('/protected');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
