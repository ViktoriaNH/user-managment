import { ACTION_EVENTS } from "./action-events";

export const ACTION_MESSAGES = {
  [ACTION_EVENTS.SELF_BLOCKED]: "Your account has been blocked",
  [ACTION_EVENTS.USERS_BLOCKED]: "Users have been blocked",
  [ACTION_EVENTS.USERS_UNBLOCKED]: "Users have been unblocked",
  [ACTION_EVENTS.USERS_DELETED]: "Users have been deleted",
  [ACTION_EVENTS.SELF_DELETED]: "Your account has been deleted",
  [ACTION_EVENTS.UNVERIFIED_DELETED]: "All unverified users have been deleted",
};
