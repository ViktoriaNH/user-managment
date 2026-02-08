import { useEffect, useState } from "react";
import { AUTH_MODE_CONFIG } from "../../data/auth-mode";
import Input from "../Input/Input";
import Button from "../Button/Button";
import Alert from "../Alert";
import { useNavigate } from "react-router-dom";
import { resetFormText } from '../../helpers/resetFormText'

const AuthForm = ({ mode }) => {
  const config = AUTH_MODE_CONFIG[mode];
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (name) => (e) =>
    setForm((s) => ({ ...s, [name]: e.target.value }));

  const resetForm = () => setForm({ email: "", password: "", name: "" });

  const handleSuccessRegister = (delay = 2000) => {
    setMessage(config.successText);
    resetForm();
    setTimeout(() => navigate(config.redirectTo), delay);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetFormText(setMessage, setError);

    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const name = form.name?.trim();

    const result = await config.action(email, password, name);

    if (result?.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "register") {
      handleSuccessRegister();
      return;
    }

    navigate(config.redirectTo);
  };

  useEffect(() => {
    resetFormText(setMessage, setError);
    resetForm();
  }, [mode]);

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 shadow-sm ">
      <h5 className="mb-3">{config.title}</h5>

      <Alert type="success" text={message} />
      <Alert type="danger" text={error} />

      {config.fields.map(({ name, label, type }) => (
        <Input
          key={name}
          label={label}
          type={type}
          value={form[name]}
          onChange={handleChange(name)}
        />
      ))}
      <div className="text-center">
        <Button text={config.buttonText} type="submit" fullWidth />
      </div>
    </form>
  );
};

export default AuthForm;
