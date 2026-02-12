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

  if (check.ok) return;

  if (check.reason === "blocked") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);
    doRedirect();
    return;
  }

  if (check.reason === "no-user" || check.reason === "error") {
    setAlert(
      check.reason === "no-user" ?
        ACTION_MESSAGES[ACTION_EVENTS.SELF_DELETED]
      : ACTION_MESSAGES[ACTION_EVENTS.SELF_DELETED] || "Ошибка авторизации",
    );

    try {
      await supabase.auth.signOut({ scope: "global" }); //
      await supabase.auth.getSession();
    } catch (e) {
      console.warn("Sign out failed:", e);
    }

    setTimeout(doRedirect, 300);
    return;
  }
};
