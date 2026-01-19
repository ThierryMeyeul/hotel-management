import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import HotelListPage from "../pages/hotels/HotelListPage";
import HotelCreatePage from "../pages/hotels/HotelCreatePage";
import HotelDetailsPage from "../pages/hotels/HotelDetailsPage";
import BookingPage from "../pages/booking/BookingPage";
import AdminReservationsPage from "../pages/reservations/AdminReservationsPage";
import ManagersPage from "../pages/admin/managers/ManagerPage";
import CreateManagerPage from "../pages/admin/managers/CreateManagerPage";
import AssignManagerPage from "../pages/admin/hotels/AssignManager";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="hotels" element={<HotelListPage />} />
        <Route path="hotels/create" element={<HotelCreatePage />} />
        <Route path="/hotels/:id" element={<HotelDetailsPage />} />
        <Route path="booking/create" element={<BookingPage />} />
        <Route path="bookings" element={<AdminReservationsPage />} />
        <Route path="managers" element={<ManagersPage />} />
        <Route path="managers/create" element={<CreateManagerPage />} />
        <Route path="managers/assign" element={<AssignManagerPage />} />
        {/* blocage admin/* inconnu */}
        <Route path="*" element={<Navigate to="/not-authorized" replace />} />
      </Route>
    </Routes>
  );
}
