import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

// Server Action to handle form submission
async function createModel(formData: FormData) {
  'use server';

  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // Extract form data
  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('image') as string;

  // Validate required fields
  if (!title || !category) {
    throw new Error('Title and category are required');
  }

  try {
    // Insert the new model into the database
    const { data, error } = await supabase
      .from('models')
      .insert([
        {
          name: title,
          description: description || null,
          image: imageUrl || null,
          category: category,
          user_id: user.id,
          dateAdded: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error creating model:', error);
      throw new Error('Failed to create model');
    }

    // Redirect to the protected page after successful creation
    redirect('/protected');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export default async function NewModelPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  // Categories from the models data
  const categories = [
    'toys-games',
    'household',
    'props-cosplay',
    'education',
    'art',
    'tools',
    'miniatures',
    'fashion',
    '3d-printer',
    'hobby-diy',
  ];

  return (
    <div className="container px-4 py-8 mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/protected"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to My Submissions
        </Link>
        <h1 className="text-3xl font-bold mt-4">Add New Model</h1>
        <p className="text-gray-600 mt-2">
          Share your 3D model with the community
        </p>
      </div>

      <form action={createModel} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Model Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter model title..."
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category...</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your model..."
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Image URL
          </label>
          <input
            type="url"
            id="image"
            name="image"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter a direct link to an image of your model
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Model
          </button>
          <Link
            href="/protected"
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
