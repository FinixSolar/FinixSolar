import { createClient } from '@supabase/supabase-js';

const client = createClient(process.env.local.NEXT_PUBLIC_SUPABASE_URL, process.env.local.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export default client;