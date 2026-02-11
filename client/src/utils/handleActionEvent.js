import { ACTION_MESSAGES } from "../data/action-messages";

// note: show alert message for a given action event
export const handleActionEvent = async (
  event,
  setAlert = () => {},
) => {
  if (!event) return;

  const message = ACTION_MESSAGES[event];

  if (message) {
    setAlert(message);
  }
};
