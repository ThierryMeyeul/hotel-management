import { Routes, Route, Navigate } from "react-router-dom";
import ClientDashboard from "../pages/client/ClientDashboard";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ClientDashboard />} />

      {/* Bloque tout le reste : /client/xxx */}
      <Route path="*" element={<Navigate to="/not-authorized" replace />} />
    </Routes>
  );
}
