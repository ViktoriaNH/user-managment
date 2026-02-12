import { getCurrentUserStatus } from "./getCurrentUserStatus";

export const checkUserStatus = async () => {
  const { status, error } = await getCurrentUserStatus();

  // important: auth state is not resolved yet, session restoring. Don't redirect til SB finishes initialization
  if (error === "pending") {
    return { ok: true };
  }

  if (error === "no-user" || error === "other" || !status) {
    return { ok: false, reason: "no-user" };
  }

  if (status === "blocked") {
    return { ok: false, reason: "blocked" };
  }

  if (error) {
    return { ok: false, reason: "error" };
  }

  return { ok: true };
};
