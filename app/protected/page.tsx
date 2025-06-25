import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';
import { createClient } from '@/lib/supabase/server';
import { getModelsByUserId } from '@/lib/models';
import ModelCard from '@/app/components/ModelCard';
import type { Model } from '@/app/types';

export default async function ProtectedPage() {
  console.log('🏠 Protected page - Starting to load');

  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  console.log('🔍 Protected page - Auth check:', {
    user: data?.user?.email,
    userId: data?.user?.id,
    error: error?.message,
  });

  if (error || !data?.user) {
    console.log(
      '❌ Protected page - No user or error, but allowing access for StackBlitz testing'
    );
    // For StackBlitz: allow access even without server-side session
    // redirect('/login');
  } else {
    console.log('✅ Protected page - User authenticated, loading content');
  }

  // Get the user's models
  const userModels = data?.user ? await getModelsByUserId(data.user.id) : [];

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Submissions</h1>
          <p className="text-gray-600 mt-2">
            Welcome back,{' '}
            <span className="font-semibold">{data?.user?.email || 'User'}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/protected/new-model"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            New Model
          </Link>
          <LogoutButton />
        </div>
      </div>

      {userModels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No submissions yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start sharing your 3D models with the community!
          </p>
          <Link
            href="/3d-models"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Models for Inspiration
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {userModels.map((model: Model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
}
