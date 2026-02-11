
import { loginUser, registerUser,  } from '../services/auth';
import { AUTH_MODES, LOGIN_FIELDS, REGISTER_FIELDS, SUCCESS_TEXT } from './auth-data';

export const AUTH_MODE_CONFIG = {
  [AUTH_MODES.LOGIN]: {
    title: "Glad to see you again!",
    buttonText: "Login",
    action: loginUser,
    successText: "Login successful",
    redirectTo: "/dashboard",
    fields: LOGIN_FIELDS,
  },

  [AUTH_MODES.REGISTER]: {
    title: "Welcome to the User Managment App!",
    buttonText: "Register",
    action: registerUser,
    successText: "Registration successful. Check your email.",
    redirectTo: "/login",
    fields: REGISTER_FIELDS,
  },
};