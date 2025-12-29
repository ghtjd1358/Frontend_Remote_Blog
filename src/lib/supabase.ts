import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Blog API
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
  category?: BlogCategory;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
}

export interface BlogSeries {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  post_count?: number;
}

// Get blog posts
export const getPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
};

// Get blog categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
};

// Get blog series
export const getSeries = async () => {
  const { data, error } = await supabase
    .from('blog_series')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching series:', error);
    return [];
  }

  return data || [];
};
