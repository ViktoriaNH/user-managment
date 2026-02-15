import { supabase } from "../supabaseClient";

// note: log out current user and redirect to login
let redirectCalled = false;

export const redirectToLogin = async (navigate, delay = 2000) => {
  if (redirectCalled) return;
  redirectCalled = true;

  try {
    await supabase?.auth?.signOut?.();
  } catch (e) {
    console.warn("Sign out failed", e);
  }

  await new Promise((res) => setTimeout(res, delay));

  try {
    navigate("/login", { replace: true });
  } catch {
    window.location.replace("/login");
  } finally {
    redirectCalled = false;
  }
};
