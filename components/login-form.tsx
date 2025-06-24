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
import { useState, useEffect } from 'react';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Debug environment variables on component mount
  useEffect(() => {
    console.log('Login form - Environment check:');
    console.log(
      'NEXT_PUBLIC_SUPABASE_URL:',
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    console.log(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY exists:',
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    console.log(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY length:',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
    );

    // Test Supabase connection
    const testConnection = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('models')
          .select('count')
          .limit(1);
        console.log('Supabase connection test:', {
          success: !error,
          error: error?.message,
        });
      } catch (err) {
        console.log('Supabase connection test failed:', err);
      }
    };

    testConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Login form - Starting login process');
      console.log('Login form - Email:', email);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Login form - Sign in result:', { error: error?.message });

      if (error) throw error;

      // Check if we have a session after login
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('Session after login:', session ? 'exists' : 'none');
      console.log('User:', session?.user?.email);
      console.log(
        'Session details:',
        session
          ? {
              access_token: session.access_token ? 'exists' : 'none',
              refresh_token: session.refresh_token ? 'exists' : 'none',
              expires_at: session.expires_at,
            }
          : 'no session'
      );

      if (!session) {
        console.log('No session after login, attempting to refresh');
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();
        console.log('Session refresh after login:', {
          success: !!refreshData.session,
          error: refreshError?.message,
        });

        if (!refreshData.session) {
          console.log('Session refresh failed, checking auth state');
          const {
            data: { user },
          } = await supabase.auth.getUser();
          console.log('Current user after failed refresh:', user?.email);
          throw new Error('Failed to establish session after login');
        }
      }

      // Update this route to redirect to an authenticated route. The user already has an active session.
      console.log('Login successful, attempting redirect to /protected');

      // Try router.push first, fallback to window.location if needed
      try {
        router.push('/protected');
      } catch (routerError) {
        console.log('Router push failed, using window.location:', routerError);
        window.location.href = '/protected';
      }
    } catch (error: unknown) {
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
