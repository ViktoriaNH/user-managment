import { ACTION_EVENTS } from "../data/action-events";
import { ACTION_MESSAGES } from "../data/action-messages";
import { redirectToLogin } from "../helpers/redirectToLogin";

// note: handles the result of a user status check
export const handleCheckResult = (check, navigate, setAlert, delay = 2000) => {
  if (check.ok) return true;

  // note: show alert if blocked and do redirect
  if (check.reason === "blocked") {
    if (setAlert) {
      setAlert(ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED]);
    }
    redirectToLogin(navigate, delay);
  } else if (check.reason === "no-user") {
    redirectToLogin(navigate);
  }

  return false;
};
