import { supabase } from "../supabaseClient";

// note: universal upsert helper, used for updating user statuses
const upsertUsers = async (updates) => {
  return supabase.from("users").upsert(updates);
};

// note: loads all users, returns [] on error
export const loadUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
};

// note: do the select users as blocked
export const blockUsers = async (ids) => {
  const { data: users } = await supabase
    .from("users")
    .select("id, status")
    .in("id", ids);

  // note: prepare updates to block users, savу previous status to correct restore

  const updates = (users || []).map((u) => ({
    id: u.id,
    prev_status: u.status ?? "active",
    status: "blocked",
  }));

  if (updates.length > 0) {
    await upsertUsers(updates);
  }
};

// note: do the select users as unblocked
export const unblockUsers = async (ids) => {
  const { data: users } = await supabase
    .from("users")
    // importnat: need previous status to restore correctly after unblocking
    .select("id, prev_status")
    .in("id", ids);

  const updates = (users || []).map((u) => ({
    id: u.id,
    status: u.prev_status ?? "active",
    prev_status: null,
  }));

  if (updates.length > 0) {
    await upsertUsers(updates);
  }
};

const BACKEND =
  import.meta.env.VITE_BACKEND_URL;

//note: delete selected users
export const deleteUsers = async (ids, currentEmail) => {
  if (!ids || ids.length === 0) {
    return { success: true, requested: [] };
  }

  const url = `${BACKEND}/delete-users`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids, currentEmail }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.error || payload?.message || `Seever error: ${response.status}`,
    );
  }

  return payload;
};

//note: delete all unverified users
export const deleteUnverifiedUsers = async () => {
  const { data: authUser, error: userErr } = await supabase.auth.getUser();
  if (userErr) {
    throw userErr;
  }

  const currentEmail = authUser?.user?.email;

  const response = await fetch(`${BACKEND}/delete-unverified`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentEmail }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.error || payload?.message || `Server error: ${response.status}`,
    );
  }

  return payload;
};
