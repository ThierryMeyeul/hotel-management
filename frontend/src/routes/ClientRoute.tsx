import { Routes, Route, Navigate } from "react-router-dom";
import ClientDashboard from "../pages/client/ClientDashboard";
import ClientLayout from "../layouts/ClientLayout";
import HotelListPage from "../pages/hotels/HotelListPage";
import AdminReservationsPage from "../pages/reservations/AdminReservationsPage";
import HotelDetailPage from "../pages/hotels/HotelDetailsPage";
import BookingPage from "../pages/booking/BookingPage";
import UserFavorites from "../pages/favorite/UserFavorite";

export default function ClientRoutes() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/hotels" element={<HotelListPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route path="/bookings" element={<AdminReservationsPage />} />
        <Route path="/booking/create" element={<BookingPage />} />
        <Route path="/favorites" element={<UserFavorites />} />
      </Route>
      {/* Bloque tout le reste : /client/xxx */}
      <Route path="*" element={<Navigate to="/not-authorized" replace />} />
    </Routes>
  );
}
