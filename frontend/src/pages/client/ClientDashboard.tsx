import React from 'react';
import { 
  Building, 
  Calendar, 
  CreditCard, 
  Star, 
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  Hotel,
  CalendarDays,
  Wallet,
  Heart,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  // Données simulées
  const upcomingBookings = [
    {
      id: 1,
      hotel: "Hôtel Plaza Paris",
      location: "Paris, France",
      checkIn: "15 Oct 2024",
      checkOut: "20 Oct 2024",
      guests: 2,
      price: 850,
      status: "confirmée"
    },
    {
      id: 2,
      hotel: "Grand Hotel Nice",
      location: "Nice, France",
      checkIn: "25 Nov 2024",
      checkOut: "30 Nov 2024",
      guests: 1,
      price: 620,
      status: "confirmée"
    }
  ];

  const recentHotels = [
    {
      id: 1,
      name: "Hôtel de Luxe Lyon",
      location: "Lyon",
      rating: 4.8,
      price: 120,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=lyon"
    },
    {
      id: 2,
      name: "Seaside Resort Marseille",
      location: "Marseille",
      rating: 4.5,
      price: 95,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=mars"
    },
    {
      id: 3,
      name: "Mountain View Chamonix",
      location: "Chamonix",
      rating: 4.9,
      price: 150,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=cham"
    }
  ];

  const stats = [
    {
      title: "Réservations actives",
      value: "3",
      icon: CalendarDays,
      color: "bg-blue-500",
      change: "+1 cette semaine"
    },
    {
      title: "Hôtels visités",
      value: "8",
      icon: Hotel,
      color: "bg-green-500",
      change: "+2 ce mois"
    },
    {
      title: "Dépenses totales",
      value: "2,450 €",
      icon: Wallet,
      color: "bg-purple-500",
      change: "+320 € ce mois"
    },
    {
      title: "Favoris",
      value: "5",
      icon: Heart,
      color: "bg-pink-500",
      change: "+2 récemment"
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Bonjour, <span className="text-blue-600">Alexandre</span> 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue dans votre espace client HotelSphere
          </p>
        </div>
        <Link
          to="/client/hotels"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow"
        >
          <Building className="w-5 h-5" />
          <span className="font-medium">Explorer les hôtels</span>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-700 font-medium">{stat.title}</p>
            <p className="text-sm text-green-600 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prochaines réservations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Prochaines réservations
              </h2>
              <Link 
                to="/client/bookings"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">{booking.hotel}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        {booking.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{booking.checkIn} → {booking.checkOut}</span>
                        <span className="text-gray-400">•</span>
                        <span>{booking.guests} personne{booking.guests > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{booking.price}€</div>
                    <button className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition">
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hôtels récents */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-500" />
                Hôtels récemment consultés
              </h2>
              <Link 
                to="/client/hotels"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Voir plus
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentHotels.map((hotel) => (
              <div key={hotel.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{hotel.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900">{hotel.rating}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mt-1">{hotel.price}€</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition flex-1">
                        Voir l'hôtel
                      </button>
                      <button className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 text-sm font-medium transition">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/client/hotels"
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Chercher un hôtel</h3>
                <p className="text-sm text-gray-600">Trouvez votre prochaine destination</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/client/bookings"
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer mes réservations</h3>
                <p className="text-sm text-gray-600">Voir, modifier, annuler</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/client/profile"
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mon profil</h3>
                <p className="text-sm text-gray-600">Informations personnelles</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;