// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://glmclxqycvusspsrtpnw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbWNseHF5Y3Z1c3Nwc3J0cG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTc0NTEsImV4cCI6MjA1ODQzMzQ1MX0.SrK2R-0XJzu-50-MzLqFNYDveo8ttklwnvDpVPmvr1A";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);