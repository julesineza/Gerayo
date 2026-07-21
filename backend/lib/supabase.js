import { createClient } from "@supabase/supabase-js";


// For normal auth actions (signup, login, OTP) — behaves like the client SDK
export const supabaseAuth = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || ""
);

//for privilaged admin actions (create user, delete user, update user) 
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);