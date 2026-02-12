import { ACTION_EVENTS } from "../data/action-events";
import { ACTION_MESSAGES } from "../data/action-messages";
import { redirectToLogin } from "./redirectToLogin";

export const checkStatusAndRedirect = async (
  navigate,
  setAlert = () => {},
  delay = 2000,
) => {
  const check = await checkUserStatus();

  if (check.ok) return;

  if (check.reason === "blocked") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);
  }

  if (check.reason === "no-user") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_DELETED]);
  }

  redirectToLogin(navigate, delay);
};
