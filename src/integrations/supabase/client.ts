// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://whyhnenjflupgwqpvuqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeWhuZW5qZmx1cGd3cXB2dXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNzQyNjYsImV4cCI6MjA1OTc1MDI2Nn0.5kaonp4wcuKPIJFgWSkav7UouoaHrnla5cLbRdmhDXE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);