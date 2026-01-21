import { Routes, Route, Navigate } from "react-router-dom";
import DirectorLayout from "../layouts/DirectorLayout";
import DirectorDashboard from "../pages/director/DirectorDashboard";
import MyHotelList from "../pages/director/MyHotels.tsx/MyHotelList";
import HotelRooms from "../pages/director/MyHotels.tsx/rooms/HotelRoomPage";
import HotelGallery from "../pages/director/MyHotels.tsx/images/HotelGalleryPage";
import AddEditRoom from "../pages/director/MyHotels.tsx/rooms/AddEditRoom";
import HotelManagement from "../pages/director/MyHotels.tsx/HotelManagement";
import EditHotel from "../pages/director/MyHotels.tsx/EditHotel";
import ReservationList from "../pages/director/reservaions/ReservationList";
import HotelReservations from "../pages/director/MyHotels.tsx/HotelReservations";

export default function DirectorRoutes() {
  return (
    <Routes>
        <Route element={<DirectorLayout />}>
            <Route path="dashboard" element={<DirectorDashboard />} />
            <Route path="hotels" element={<MyHotelList />} />
            <Route path="hotels/:id/rooms" element={<HotelRooms />} />
            <Route path="hotels/:id/images" element={<HotelGallery />} />
            <Route path="hotels/:id/rooms/add" element={<AddEditRoom />} />
            <Route path="hotels/:id/rooms/:roomId/edit" element={<AddEditRoom />} />
            <Route path="hotels/:id" element={<HotelManagement />} />
            <Route path="hotels/:id/edit" element={<EditHotel />} />
            <Route path="bookings" element={<ReservationList />} />
            <Route path="hotels/:id/bookings" element={<HotelReservations />} />
        </Route>    
      <Route path="*" element={<Navigate to="/not-authorized" replace />} />
    </Routes>
  );
}
