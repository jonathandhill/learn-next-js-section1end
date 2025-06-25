'use client';

import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/shared-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Login form - Starting login process');
      console.log('📧 Login form - Email:', email);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('🔑 Login form - Sign in result:', { error: error?.message });

      if (error) throw error;

      console.log('🎉 Login successful, waiting for session to be ready...');

      // Check current auth state immediately after login
      console.log('🔍 Checking current auth state after login');
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      console.log(
        '👤 Current user after login:',
        currentUser ? currentUser.email : 'none'
      );

      // Wait a moment for session to be established (StackBlitz timing issue)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check for session after delay
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('🔍 Session check after delay:', session ? 'exists' : 'none');

      // Also try getting the session from the browser client directly
      console.log('🔍 Trying direct browser client session check');
      const { createBrowserClient } = await import('@supabase/ssr');
      const directClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const {
        data: { session: directSession },
      } = await directClient.auth.getSession();
      console.log(
        '🔍 Direct client session check:',
        directSession ? 'exists' : 'none'
      );

      if (session || directSession) {
        console.log('✅ Session ready, redirecting to /protected');
        window.location.href = '/protected';
      } else {
        // Fallback: check if user is signed in anyway
        console.log('🔍 Fallback: checking if user is signed in');

        // Try to refresh the session first
        console.log('🔄 Attempting session refresh in fallback');
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();
        console.log('🔄 Session refresh result:', {
          success: !!refreshData.session,
          error: refreshError?.message,
        });

        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log(
          '👤 Fallback user check result:',
          user ? user.email : 'none'
        );
        console.log(
          '🔍 Fallback user details:',
          user
            ? {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
              }
            : 'no user'
        );

        if (user) {
          console.log('👤 User is signed in, proceeding with redirect anyway');
          window.location.href = '/protected';
        } else {
          console.log('❌ No user found in fallback check');
          throw new Error('Failed to establish session after login');
        }
      }
    } catch (error: unknown) {
      console.error('💥 Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
