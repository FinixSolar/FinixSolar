import { createClient } from "@supabase/supabase-js";

const client = createClient(
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
);

export default client;
