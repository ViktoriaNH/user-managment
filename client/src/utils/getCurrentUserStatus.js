import { supabase } from "../supabaseClient";
import { getCurrentUserId } from "../services/auth";

// note: get the current user's status from the DB, return status, error, userId
export const getCurrentUserStatus = async () => {
  const currentUserId = await getCurrentUserId();

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

  // nota bene: error set if the user not found or fetch fails
  if (error || !data) {
    return { status: null, error: error || "no-data", userId: currentUserId };
  }

  return { status: data.status, error: null, userId: currentUserId };
};
