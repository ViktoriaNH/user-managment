import { supabase } from "../supabaseClient";

// note: log out current user and redirect to login
export const redirectToLogin = async (navigate, delay = 2000) => {
  try {
    await supabase.auth.signOut();
  } catch {}

  await new Promise((res) => setTimeout(res, delay));

  try {
    navigate("/login", { replace: true });
  } catch {
    window.location.replace("/login");
  }
};