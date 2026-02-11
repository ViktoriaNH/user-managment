import { Navigate, Route, Routes } from "react-router-dom";
import { AUTH_MODES } from "./data/auth-data.js";
import Authorization from "./pages/Authorization/Authorization.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import { useEffect } from "react";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={<Authorization mode={AUTH_MODES.LOGIN} />}
      />

      <Route
        path="/register"
        element={<Authorization mode={AUTH_MODES.REGISTER} />}
      />

      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default App;
