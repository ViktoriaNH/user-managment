import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  useEffect(() => {
    const verify = async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/verify-email?token=${token}`,
        );

        navigate("/login", { replace: true });
      } catch (err) {
        navigate("/login", { replace: true });
      }
    };

    verify();
  }, [token, navigate]);

  return null;
};

export default VerifyEmail;


