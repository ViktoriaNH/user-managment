import { ACTION_EVENTS } from "../data/action-events";
import { ACTION_MESSAGES } from "../data/action-messages";
import { redirectToLogin } from "./redirectToLogin";
import { getCurrentUserStatus } from "../utils/getCurrentUserStatus";

// note: check the current user is not blocked and exists.
export const checkNotBlocked = async (
  navigate,
  setAlert = () => {},
  delay = 2000,
) => {
  const { status, error } = await getCurrentUserStatus();

  if (error === "no-user") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_DELETED]);
    await redirectToLogin(navigate, delay);
    return false;
  }

  if (error) {
    setAlert(ACTION_MESSAGEES[ACTION_EVENTS.SELF_DELETED]);
    await redirectToLogin(navigate, delay);
    return false;
  }

  if (status === "blocked") {
    setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);
    await redirectToLogin(navigate, delay);
    return false;
  }

  return true;
};
