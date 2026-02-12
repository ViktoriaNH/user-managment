export const redirectToLogin = (navigate, delay = 2000) => {
  setTimeout(() => {
    navigate("/login", { replace: true });
  }, delay);
};