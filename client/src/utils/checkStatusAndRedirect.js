import { ACTION_EVENTS } from "../data/action-events";
import { ACTION_MESSAGES } from "../data/action-messages";
import { redirectToLogin } from "../helpers/redirectToLogin";
import { supabase } from "../supabaseClient";
import { checkUserStatus } from "./checkUserStatus";

const PROJECT_REF = "kxuqrtxvyyubnsunrcpg";
let redirectCalled = false;

export const resetRedirectFlag = () => {
  redirectCalled = false;
};

export const checkStatusAndRedirect = async (
  navigate,
  setAlert = () => {},
  delay = 2000,
) => {
  const check = await checkUserStatus();

  const doRedirect = () => {
    if (!redirectCalled) {
      redirectCalled = true;
      redirectToLogin(navigate, delay);
    } else {
      console.debug("Redirect already called, skipping duplicate redirect");
    }
  };

  if (check.ok) return;

  if (check.reason === "blocked") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);
    doRedirect();
    return;
  }

  if (check.reason === "no-user" || check.reason === "error") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_DELETED]);

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut failed", e);
    }

    try {
      localStorage.removeItem(`sb-${PROJECT_REF}-auth-token`);
    } catch (e) {
      console.warn("Failed to remove auth token", e);
    }

    doRedirect();
    return;
  }
};
