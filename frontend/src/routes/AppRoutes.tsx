import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import ActivateAccount from "../pages/auth/activeAccount";
import ActivationSent from "../pages/auth/activationSent";
import NotAuthorized from "../pages/NotAuthorized";
import Home from "../pages/Home";

import RoleRoute from "./RoleRoute";
import HotelListPage from "../pages/hotels/hotelList";
import HotelDetailsPage from "../pages/hotels/HotelDetails";

import ClientRoutes from "./ClientRoute";
import AdminRoutes from "./AdminRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<h1>About Page</h1>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/activate/:uidb64/:token" element={<ActivateAccount />} />
      <Route path="/activation-sent" element={<ActivationSent />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminRoutes />
          </RoleRoute>
        }
      />

      {/* Client */}
      <Route
        path="/client/*"
        element={
          <RoleRoute requiredRole="CLIENT">
            <ClientRoutes />
          </RoleRoute>
        }
      />

      {/* Public hotels */}
      <Route path="/hotels" element={<HotelListPage />} />
      <Route path="/hotels/:id" element={<HotelDetailsPage />} />

      {/* Global fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
