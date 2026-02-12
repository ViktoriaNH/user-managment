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

  const doRedirect = () => {
    redirectToLogin(navigate, delay);
  };

  const PROJECT_REF = "kxuqrtxvyyubnsunrcpg";

  if (check.ok) return;

  if (check.reason === "blocked") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);
    doRedirect();
    return;
  }

  if (check.reason === "no-user" || check.reason === "error") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_DELETED]);

    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (e) {
      console.log("signOut failed (but expected after deletion)", e);
    }

    localStorage.removeItem(`sb-${PROJECT_REF}-auth-token`);

    supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        redirectToLogin(navigate, 800);
      }
    });

    setTimeout(() => redirectToLogin(navigate, 800), 300);

    return;
  }
};
