export interface Reservation {
  id: number;
  user: number; // user ID
  room: number; // room ID
  check_in: string;
  check_out: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  total_price: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  reservation: number;
  amount: string;
  payment_date: string;
  payment_method: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface Invoice {
  id: number;
  payment: number;
  issued_date: string;
  invoice_number: string;
  total_amount: string;
}

export interface BookingData {
  user: number;
  room: number;
  check_in: string;
  check_out: string;
  total_price: number;
}

export interface PaymentData {
  reservation: number;
  amount: number;
  payment_method: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CONFIRMED';
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardName?: string;
  agreeTerms: boolean;
}

export interface HotelBookingData {
  hotelId: number;
  hotelName: string;
  roomId: number;
  roomType: string;
  roomNumber: string;
  price: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  hotelAddress: string;
  hotelCity: string;
  hotelCountry: string;
  hotelImage?: string;
  userId?: string;
  userName?: string;
  nights?: number;
  totalPrice?: number;
}