import { checkUserStatus } from "./checkUserStatus";
import { userActions } from "./userActions";

// note: wrapper for user actions (block, delete, etc.)
export const runUserAction =
  (context) =>
  async (actionId, selectedUsers = []) => {
    // note: check the current user blocked or not, then run the action
    const check = await checkUserStatus();

    if (!check.ok) {
      await checkStatusAndRedirect(context.navigate, context.setAlert);
      return undefined;
    }

    // note: return the action result or undefined if blocked/error/not found
    const action = userActions[actionId];
    if (!action) {
      return undefined;
    }

    try {
      return await action({ ...context, selectedUsers });
    } catch (err) {
      context.setAlert?.("Error while performing action");
      return undefined;
    }
  };
