import {Routes, Route} from "react-router-dom";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import ActivateAccount from "../pages/auth/activeAccount";
import ActivationSent from "../pages/auth/activationSent";
import AdminDashboard from "../pages/AdminDashboard";
import NotAuthorized from "../pages/NotAuthorized";
import Home from "../pages/Home";
import RoleRoute from "./RoleRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<h1>About Page</h1>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/activate/:uidb64/:token" element={<ActivateAccount />} />
      <Route path="/activation-sent" element={<ActivationSent />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route path="/admin" element={<RoleRoute requiredRole="ADMIN"><AdminDashboard /></RoleRoute>} />
    </Routes>
  );
}