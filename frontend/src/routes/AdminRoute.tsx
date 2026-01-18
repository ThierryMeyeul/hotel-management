import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import HotelListPage from "../pages/hotels/hotelList";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="hotels" element={<HotelListPage />} />

        {/* blocage admin/* inconnu */}
        <Route path="*" element={<Navigate to="/not-authorized" replace />} />
      </Route>
    </Routes>
  );
}
