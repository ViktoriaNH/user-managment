import { supabase } from "../supabaseClient";
import { getCurrentUserId } from "../services/auth";

// note: get the current user's status from the DB, return status, error, userId
export const getCurrentUserStatus = async () => {
  let currentUserId = null;

  try {
    currentUserId = await getCurrentUserId();
  } catch (e) {
    const msg = (e?.message || "").toLowerCase();

    if (msg.includes("pending") || msg.includes("no-session")) {
      return { status: null, error: "pending", userId: null };
    }

    if (msg.includes("user from sub claim") || msg.includes("not exist")) {
      return { status: null, error: "no-user", userId: null };
    }

    return { status: null, error: "other", userId: null };
  }

  // important: its not err if the supabase session not restore
  // this "pending" / "waiting" state prevents redirect before auth is ready
  if (!currentUserId) {
    return { status: null, error: "pending", userId: null };
  }

  const { data, error } = await supabase
    .from("users")
    .select("status")
    .eq("id", currentUserId)
    .single();

  // note: process the errors from supabase
  if (error) {
    const code = error?.code ?? error?.status ?? error?.statusCode ?? null;
    if (code === "user_not_found" || code === 403 || code === 401) {
      return { status: null, error: "no-user", userId: currentUserId };
    }
    return { status: null, error: "other", userId: currentUserId };
  }

  if (!data) {
    return { status: null, error: "no-user", userId: currentUserId };
  }

  return { status: data.status, error: null, userId: currentUserId };
};
