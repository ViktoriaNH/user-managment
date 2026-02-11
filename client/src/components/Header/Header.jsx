import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import { redirectToLogin } from "../../utils/redirectToLogin";

const Header = () => {
  const navigate = useNavigate();

 const handleLogout = async () => {
  await redirectToLogin(navigate, 0);
};

  return (
    <header className="bg-secondary-subtle d-flex justify-content-between align-items-center px-5 py-3 mb-4 w-100">
      <h1 className="m-0 h3 text-primary fw-bold">
        <i className="bi bi-people-fill me-2"></i>
        User Management
      </h1>

      <Button text="Logout" variant="outline-primary" onClick={handleLogout} />
    </header>
  );
};

export default Header;
