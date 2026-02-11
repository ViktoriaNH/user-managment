import AuthForm from "../../components/AuthForm/AuthForm";
import { AUTH_MODES } from "../../data/auth-data";
import LoginImage from "../../assets/images/login.png";
import RegisterImage from "../../assets/images/register.png";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";

const Authorization = (props) => {
  const { mode } = props;

  const navigate = useNavigate();

  const toggleMode = () => {
    navigate(mode === AUTH_MODES.LOGIN ? "/register" : "/login");
  };
  const imageSrc = mode === AUTH_MODES.LOGIN ? LoginImage : RegisterImage;

  return (
    <section className="container d-flex min-vh-100 ">
      <div className=" d-flex flex-column flex-md-row align-items-center gap-5 w-100 ">
        <div className="flex-shrink-1">
          <img
            className="img-fluid"
            src={imageSrc}
            alt=""
            width={580}
            height={730}
            loading="eager"
          />
        </div>

        <div className="flex-grow-1 w-100" style={{ maxWidth: "600px" }}>
          <AuthForm mode={mode} />

          <div className="text-center mt-2">
            <Button
              variant="link"
              text={
                mode === AUTH_MODES.LOGIN ?
                  "No account? Register"
                : "Already have an account? Login"
              }
              onClick={toggleMode}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Authorization;
