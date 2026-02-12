import { ACTION_EVENTS } from "../data/action-events";
import { ACTION_MESSAGES } from "../data/action-messages";
import { redirectToLogin } from "../helpers/redirectToLogin";
import { checkUserStatus } from "./checkUserStatus";

export const checkStatusAndRedirect = async (
  navigate,
  setAlert = () => {},
  delay = 2000,
) => {
  const check = await checkUserStatus();

  if (check.ok) return;

  if (check.reason === "blocked") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);
    redirectToLogin(navigate, delay);
    return;
  }

  if (check.reason === "no-user") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_DELETED]);
    // important: clear local supabase session so JWT is removed (otherwise 403 repeats)
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    redirectToLogin(navigate, delay);
    return;
  }

  if (check.reason === "error") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_DELETED] || "Auth error");
    await supabase.auth.signOut().catch(() => {});
    redirectToLogin(navigate, delay);
  }
};
