import { supabase } from "../supabaseClient";

// note: log out current user and redirect to login 
let redirectCalled = false;

export const redirectToLogin = async (navigate, delay = 2000) => {
  if (redirectCalled) return;
  redirectCalled = true;

  setTimeout(() => {
    redirectCalled = false;
  }, delay);

  try {
    if (supabase?.auth?.signOut) {
      await supabase.auth.signOut();
    }
  } catch (e) {}

  // important: wait delay before redirect to give time for alerts
  await new Promise((res) => setTimeout(res, delay));

  try {
    navigate("/login", { replace: true });
    return;
  } catch (e) {}

  // nota bene: fallback if navigate fails
  window.location.replace("/login");
};
