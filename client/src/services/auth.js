import { ACTION_EVENTS } from "../data/action-events";
import { ACTION_MESSAGES } from "../data/action-messages";
import { supabase } from "../supabaseClient";
import { sendVerification } from "../utils/sendVerification";

export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error };

  const userId = data.user.id;

  // note: update last login timestamp
  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId);

  // note: get current status
  const { data: userData, error: fetchError } = await supabase
    .from("users")
    .select("status")
    .eq("id", userId)
    .single();
  if (fetchError) return { error: fetchError };

  // nota bene: logout if blocked
  if (userData?.status === "blocked") {
    await supabase.auth.signOut();
    return {
      error: {
        event: ACTION_EVENTS.SELF_BLOCKED,
        message: ACTION_MESSAGES[ACTION_EVENTS.SELF_BLOCKED],
      },
    };
  }

  return { success: true };
};

export const registerUser = async (email, password, name) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    const user = data?.user;

    // note: send verification email
    sendVerification(user.id, user.email).catch(() => {});

    return { success: true, userId: user.id };
  } catch (error) {
    
    // important: PostgreSQL + SupabaseAuth already checks that each email is unique, we also handle this case here
    const isUnique = error.code === "23505";

    if (isUnique) {
      return {
        error: {
          code: "23505",
          message: "This email is already in use",
        },
      };
    }

    return { error };
  }
};

// note: return user's id and catch "no-user"
export const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    const msg = (error.message || "").toLowerCase();

    // КРИТИЧНО: пользователь удалён, но JWT ещё есть
    if (
      msg.includes("user from sub claim") ||
      msg.includes("not exist") ||
      msg.includes("user_not_found")
    ) {
      throw new Error("user_not_found");
    }

    throw error;
  }

  return data?.user?.id ?? null;
};



