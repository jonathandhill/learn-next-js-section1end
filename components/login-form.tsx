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

      // Wait for the auth state change to confirm session is ready
      const sessionReady = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Session establishment timeout'));
        }, 5000); // 5 second timeout

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          console.log(
            '🔄 Login form auth state change:',
            event,
            session ? 'session exists' : 'no session'
          );

          if (event === 'SIGNED_IN' && session) {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve(session);
          }
        });
      });

      try {
        await sessionReady;
        console.log('✅ Session confirmed ready via auth state change');

        // Wait a moment for cookies to sync (StackBlitz issue)
        console.log('⏳ Waiting for cookies to sync...');
        await new Promise((resolve) => setTimeout(resolve, 3000));

        window.location.href = '/protected';
      } catch (sessionError) {
        console.log('❌ Session establishment failed:', sessionError);

        // Final fallback: just try to redirect anyway
        console.log('🚀 Final fallback: attempting redirect anyway');
        window.location.href = '/protected';
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
