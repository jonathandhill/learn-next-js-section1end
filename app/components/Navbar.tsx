'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/shared-client';
import PFLogoIcon from '@/public/printforge-logo-icon.svg';
import PFLogo from '@/public/printforge-logo.svg';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleProtectedClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Navbar - User attempting to access /protected');
    console.log('Navbar - Current user:', user?.email);

    // Check session before navigation
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('Navbar - Session check:', session ? 'exists' : 'none');

    if (session) {
      console.log('Navbar - Attempting navigation to /protected');
      try {
        router.push('/protected');
      } catch (error) {
        console.log(
          'Navbar - Router push failed, using window.location:',
          error
        );
        window.location.href = '/protected';
      }
    } else {
      console.log('Navbar - No session found, redirecting to login');
      router.push('/login');
    }
  };

  return (
    <header className="w-full bg-white">
      <nav className="flex justify-between px-6 py-4">
        <Link href="/">
          <div className="relative cursor-pointer">
            {/* Desktop Logo */}
            <img
              src={PFLogo.src}
              alt="PrintForge Logo"
              className="w-[200px] h-auto hidden md:block"
            />
            {/* Mobile Logo */}
            <img
              src={PFLogoIcon.src}
              alt="PrintForge Logo"
              className="w-[40px] h-auto block md:hidden"
            />
          </div>
        </Link>
        <ul className="flex items-center gap-2.5">
          <li className="text-sm uppercase cursor-pointer">
            <Link href="/3d-models">3D Models</Link>
          </li>
          <li className="text-sm uppercase cursor-pointer">
            <Link href="/about">About</Link>
          </li>
          {!loading && user && (
            <li className="text-sm uppercase cursor-pointer">
              <button
                onClick={handleProtectedClick}
                className="hover:underline bg-transparent border-none p-0 font-inherit text-sm uppercase cursor-pointer"
              >
                {user.email?.split('@')[0] || 'Dashboard'}
              </button>
            </li>
          )}
          <li className="text-sm uppercase cursor-pointer">
            {!loading &&
              (user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm uppercase cursor-pointer bg-transparent border-none p-0 font-inherit"
                >
                  Logout
                </button>
              ) : (
                <Link href="/login">Login</Link>
              ))}
          </li>
        </ul>
      </nav>
    </header>
  );
}
