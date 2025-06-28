import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dglwzuxuqszonutlqqaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbHd6dXh1cXN6b251dGxxcWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDEwMDgsImV4cCI6MjA2NjUxNzAwOH0.5WVmChp9OXtJiMYtGgdyn3rMGTKTBL5boL5F-nSoy18';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
