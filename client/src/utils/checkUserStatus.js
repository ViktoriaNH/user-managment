import { getCurrentUserStatus } from "./getCurrentUserStatus";

export const checkUserStatus = async () => {
  const { status, error } = await getCurrentUserStatus();

  // important: auth state is not resolved yet, session restoring. Don't redirect til SB finishes initialization
  if (error === "pending") {
    return { ok: true };
  }

  const errorCode = error?.code;
  const errorStatus = error?.status || error?.statusCode;

  if (
    error === "no-user" ||
    errorCode === "user_not_found" ||
    errorStatus === 401 ||
    errorStatus === 403
  ) {
    return { ok: false, reason: "no-user" };
  }

  if (error) {
    return { ok: false, reason: "error" };
  }

  if (status === "blocked") {
    return { ok: false, reason: "blocked" };
  }

  return { ok: true };
};
