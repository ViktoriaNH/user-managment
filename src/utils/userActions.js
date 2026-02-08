import { supabase } from "../supabaseClient";
import { ACTION_EVENTS } from "../data/action-events";
import { getCurrentUserId } from "../services/auth";
import {
  blockUsers,
  unblockUsers,
  deleteUsers,
  deleteUnverifiedUsers,
} from "../services/users";
import { isSelfIncluded } from "../helpers/isSelfIncluded";

export const userActions = {
  block: async ({ selectedUsers, reload }) => {
    // note: get current user id for self-check
    const currentUserId = await getCurrentUserId();

    // note: block selected users
    await blockUsers(selectedUsers);

    // note: update data after action
    await reload();

    // note: check if current user was among blocked users
    const isSelf = isSelfIncluded(currentUserId, selectedUsers);

    // note: return event if self blocked
    if (isSelf) {
      return ACTION_EVENTS.SELF_BLOCKED;
    }

    // note: return general blocked event
    return ACTION_EVENTS.USERS_BLOCKED;
  },

  unblock: async ({ selectedUsers, reload }) => {
    // note: unblock selected users
    await unblockUsers(selectedUsers);

    // note: update data after action
    await reload();

    // note: always return general unblock event
    return ACTION_EVENTS.USERS_UNBLOCKED;
  },

  delete: async ({ selectedUsers, reload }) => {
    // note: get data current user
    const { data: authUser } = await supabase.auth.getUser();
    const currentUserId = authUser?.user?.id;

    // note: check we delete self or another
    const isSelf = selectedUsers.includes(currentUserId);

    let result;
    try {
      result = await deleteUsers(selectedUsers, authUser?.user?.email);
    } catch (err) {
      throw err;
    }

    // note: if deleted self, dtay on the page
    if (!isSelf) {
      await reload();
    }

    return isSelf ? ACTION_EVENTS.SELF_DELETED : ACTION_EVENTS.USERS_DELETED;
  },

  "delete-unverified": async ({ reload }) => {
    // note: get data current user
    const { data: authUser } = await supabase.auth.getUser();
    const currentUserId = authUser?.user?.id;

    let result;
    try {
      result = await deleteUnverifiedUsers();
    } catch (err) {
      throw err;
    }

    //  note: check we delete self or not
    const isSelf = result?.requested?.includes(currentUserId);

    if (!isSelf) {
      await reload();
    }

    return ACTION_EVENTS.UNVERIFIED_DELETED;
  },
};
