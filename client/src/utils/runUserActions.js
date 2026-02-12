
import { checkUserStatus } from "./checkUserStatus";
import { userActions } from "./userActions";

// note: wrapper for user actions (block, delete, etc.)
export const runUserAction =
  (context) =>
  async (actionId, selectedUsers = []) => {
    const { navigate, setAlert = () => {} } = context || {};

    // note: check the current user blocked or not, then run the action
    const ok = await checkUserStatus(navigate, setAlert);
    if (!ok) {
      return undefined;
    }

    // note: return the action result or undefined if blocked/error/not found
    const action = userActions[actionId];
    if (!action) {
      return undefined;
    }

    try {
      const result = await action({ ...context, selectedUsers });
      return result;
    } catch (err) {
      return undefined;
    }
  };
