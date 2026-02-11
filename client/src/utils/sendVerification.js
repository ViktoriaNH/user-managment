export const sendVerification = async (userId, email) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // note: requests backend to send email verification to a user
  const res = await fetch(`${BACKEND_URL}/send-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email }),
    credentials: 'include',
  });

  // note: return response data on success
  const data = await res.json();

  console.log("[sendVerification] status:", res.status);
  console.log("[sendVerification] response:", data);

  // note: throw error if backend response is not ok

  if (!res.ok) {
    console.error("[sendVerification] failed");
    throw new Error(data.message || "sendVerification failed");
  }

  return data;
};
