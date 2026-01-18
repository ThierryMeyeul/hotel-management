import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Building, 
  Calendar, 
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Search,
  Activity,
  PieChart,
  BarChart,
  Sparkles,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Menu,
  ChevronDown,
  Smartphone,
  Tablet
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Données simulées
  const stats = [
    {
      title: 'Total Utilisateurs',
      value: '1,248',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Hôtels Actifs',
      value: '42',
      change: '+2.5%',
      trend: 'up',
      icon: Building,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Réservations',
      value: '356',
      change: '+18.2%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Revenus (30j)',
      value: '€24,580',
      change: '-3.2%',
      trend: 'down',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50'
    }
  ];

  const recentHotels = [
    { id: 1, name: 'Grand Hôtel Paris', city: 'Paris', status: 'Actif', bookings: 45, manager: 'Jean Dupont' },
    { id: 2, name: 'Hôtel de la Plage', city: 'Nice', status: 'Actif', bookings: 32, manager: 'Marie Curie' },
    { id: 3, name: 'Mountain Resort', city: 'Chamonix', status: 'Inactif', bookings: 12, manager: 'Pierre Martin' },
    { id: 4, name: 'City Business Hotel', city: 'Lyon', status: 'Actif', bookings: 28, manager: 'Sophie Bernard' },
    { id: 5, name: 'Seaside Palace', city: 'Marseille', status: 'En maintenance', bookings: 8, manager: 'Thomas Petit' },
  ];

  const recentUsers = [
    { id: 1, name: 'Alexandre Dubois', email: 'alex@example.com', role: 'Client', status: 'Actif', joinDate: '2024-01-15' },
    { id: 2, name: 'Élodie Moreau', email: 'elodie@example.com', role: 'Manager', status: 'Actif', joinDate: '2024-01-10' },
    { id: 3, name: 'Nicolas Lambert', email: 'nicolas@example.com', role: 'Admin', status: 'Actif', joinDate: '2024-01-05' },
    { id: 4, name: 'Camille Roux', email: 'camille@example.com', role: 'Client', status: 'Inactif', joinDate: '2024-01-01' },
    { id: 5, name: 'Lucas Girard', email: 'lucas@example.com', role: 'Manager', status: 'En attente', joinDate: '2023-12-28' },
  ];

  const recentBookings = [
    { id: 'BK-2024-001', hotel: 'Grand Hôtel Paris', user: 'Alice Martin', amount: '€450', status: 'Confirmée', date: '2024-01-20' },
    { id: 'BK-2024-002', hotel: 'Hôtel de la Plage', user: 'Bob Wilson', amount: '€320', status: 'En attente', date: '2024-01-19' },
    { id: 'BK-2024-003', hotel: 'Mountain Resort', user: 'Charlie Brown', amount: '€580', status: 'Annulée', date: '2024-01-18' },
    { id: 'BK-2024-004', hotel: 'City Business Hotel', user: 'Diana Prince', amount: '€290', status: 'Confirmée', date: '2024-01-17' },
    { id: 'BK-2024-005', hotel: 'Seaside Palace', user: 'Edward Norton', amount: '€410', status: 'Terminée', date: '2024-01-16' },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'Actif': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      'Inactif': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
      'Confirmée': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      'Annulée': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
      'Terminée': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="w-3 h-3" /> },
      'En attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      'En maintenance': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <Clock className="w-3 h-3" /> },
    };
    
    const { bg, text, icon } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {icon}
        <span className="hidden xs:inline">{status}</span>
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      'Admin': { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white' },
      'Manager': { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'text-white' },
      'Client': { bg: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'text-white' },
    };
    
    const { bg, text } = config[role] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* En-tête du dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Vue d'ensemble et statistiques de la plateforme</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button className="px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Filtrer</span>
          </button>
          <button className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg sm:rounded-xl hover:from-indigo-600 hover:to-purple-600 transition shadow-sm hover:shadow flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* Statistiques - Mobile: 1 colonne, Tablet: 2 colonnes, Desktop: 4 colonnes */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.bgColor}`}>
                  <div className={`${stat.color} p-1.5 sm:p-2 rounded-md sm:rounded-lg`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-xs sm:text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Graphiques et métriques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Activité récente */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Activité récente</h2>
            </div>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>3 derniers mois</option>
            </select>
          </div>
          <div className="h-48 sm:h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg sm:rounded-xl border border-gray-200">
            <div className="text-center">
              <BarChart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-2 sm:mb-4" />
              <p className="text-gray-600 text-sm sm:text-base font-medium">Graphique d'activité</p>
              <p className="text-xs sm:text-sm text-gray-400">Données de performance</p>
            </div>
          </div>
        </div>

        {/* Répartition des rôles */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Répartition des rôles</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[
              { label: 'Administrateurs', value: 3, color: 'from-purple-500 to-pink-500' },
              { label: 'Managers', value: 12, color: 'from-blue-500 to-cyan-500' },
              { label: 'Clients', value: 1233, color: 'from-green-500 to-emerald-500' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r ${item.color}`}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="font-bold text-gray-900 text-sm sm:text-base">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 sm:mt-6 h-24 sm:h-32 flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 rounded-lg sm:rounded-xl border border-gray-200">
            <PieChart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Hôtels récents - Tableau responsive */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Hôtels récents</h2>
                <p className="text-xs sm:text-sm text-gray-500">5 hôtels gérés</p>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3">
              <div className="relative w-full xs:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm w-full xs:w-32 sm:w-48"
                />
              </div>
              <button className="px-3 py-2 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition w-full xs:w-auto">
                Voir tout →
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Version mobile/tablette - Cards */}
            <div className="block lg:hidden">
              {recentHotels.map((hotel) => (
                <div key={hotel.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Building className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">{hotel.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {hotel.city}
                          </div>
                          <div className="text-xs text-gray-500">• {hotel.bookings} rés.</div>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(hotel.status)}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 text-xs font-medium">
                        {hotel.manager.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-700 truncate max-w-[120px]">{hotel.manager}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Version desktop - Table */}
            <table className="w-full hidden lg:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hôtel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                  <th className="px 6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réservations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{hotel.name}</div>
                          <div className="text-sm text-gray-500">ID: #{hotel.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {hotel.city}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-medium text-sm">
                          {hotel.manager.charAt(0)}
                        </div>
                        <span className="text-gray-700">{hotel.manager}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg text-gray-900">{hotel.bookings}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(hotel.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Utilisateurs et réservations côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Utilisateurs récents */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Utilisateurs récents</h2>
                  <p className="text-xs sm:text-sm text-gray-500">5 nouveaux utilisateurs</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">+5</span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-3 sm:p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate text-sm sm:text-base">{user.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-3">
                    {getRoleBadge(user.role)}
                    <button className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition ml-1">
                      <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Réservations récentes */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Réservations récentes</h2>
                  <p className="text-xs sm:text-sm text-gray-500">5 réservations ce mois</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">Total: €2,050</span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="p-3 sm:p-4 hover:bg-gray-50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{booking.id}</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">{booking.hotel} • {booking.user}</div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2 sm:gap-0">
                    <div className="font-bold text-gray-900 text-sm sm:text-base">{booking.amount}</div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 sm:ml-4">
                      {getStatusBadge(booking.status)}
                      <span className="text-xs text-gray-500">{booking.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes système */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1 text-sm sm:text-base">Maintenance système planifiée</h3>
              <p className="text-amber-800 text-xs sm:text-sm">
                Une mise à jour est prévue ce soir de 2h à 4h. Le système pourrait être temporairement indisponible.
              </p>
            </div>
          </div>
          <button className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow-sm hover:shadow mt-2 sm:mt-0">
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;