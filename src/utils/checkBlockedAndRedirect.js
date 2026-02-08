import { ACTION_EVENTS } from "../data/action-events";
import { ACTION_MESSAGES } from "../data/action-messages";
import { redirectToLogin } from "./redirectToLogin";

// note: redirect if the proplems there are
export const checkBlockedAndRedirect = async (
  navigate,
  setAlert = () => {},
  delay = 2000
) => {
  const { status, error } = await getCurrentUserStatus();

  if (error) {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);

    await redirectToLogin(navigate, delay);
    return;
  }

  if (status === "blocked") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);
    await redirectToLogin(navigate, delay);
  }
};
