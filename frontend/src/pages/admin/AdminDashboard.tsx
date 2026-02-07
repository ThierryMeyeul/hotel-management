import React, { useState, useEffect } from 'react';
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
  LineChart,
  Sparkles,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Menu,
  ChevronDown,
  Smartphone,
  Tablet,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { AdminStatService, getAllUsers } from '../../services/auth.service';
import type { User, DashboardStats, ActivityData, RoleDistribution } from '../../types/auth';

// Interfaces pour les hôtels et réservations
interface Hotel {
  id: number;
  name: string;
  city: string;
  status: string;
  bookings_count: number;
  manager_name: string;
  created_at: string;
  is_active: boolean;
  email?: string;
  phone?: string;
}

interface Reservation {
  id: string;
  hotel_name: string;
  user_name: string;
  amount: number;
  status: string;
  created_at: string;
  check_in?: string;
  check_out?: string;
}

const AdminDashboard: React.FC = () => {
  // États pour les données
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [recentHotels, setRecentHotels] = useState<Hotel[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution | null>(null);
  const [loading, setLoading] = useState({
    stats: true,
    users: true,
    hotels: true,
    reservations: true,
    roles: true,
    activity: true
  });
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('7');

  // Charger toutes les données
  const loadData = async () => {
    try {
      setError(null);
      
      // Charger les statistiques
      const statsResponse = await AdminStatService.getDashboardStats();
      setStats(statsResponse);

      // Charger les utilisateurs
      const usersResponse = await getAllUsers();
      if (Array.isArray(usersResponse)) {
        setUsers(usersResponse);
      } else if (usersResponse && usersResponse.results) {
        setUsers(usersResponse.results);
      } else {
        setUsers([]);
      }

      // Charger la distribution des rôles
      const rolesResponse = await AdminStatService.getRoleDistribution();
      setRoleDistribution(rolesResponse);

      // Charger les hôtels récents
      const hotelsResponse = await AdminStatService.getRecentHotels();
      setRecentHotels(hotelsResponse);

      // Charger les réservations récentes
      const reservationsResponse = await AdminStatService.getRecentReservations();
      setRecentReservations(reservationsResponse);

      // Charger les données d'activité
      await loadActivityData(period);

      setLoading({
        stats: false,
        users: false,
        hotels: false,
        reservations: false,
        roles: false,
        activity: false
      });

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
      console.error('Error loading data:', err);
      
      // En cas d'erreur, ne pas utiliser de données simulées
      setLoading({
        stats: false,
        users: false,
        hotels: false,
        reservations: false,
        roles: false,
        activity: false
      });
    }
  };

  // Charger les données d'activité
  const loadActivityData = async (period: string) => {
    try {
      setLoading(prev => ({ ...prev, activity: true }));
      
      const response = await AdminStatService.getActivityData();
      const formattedData = response.map((item: ActivityData) => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString('fr-FR', { 
          weekday: 'short', 
          day: 'numeric' 
        }),
        revenueK: Math.round((item.revenue || 0) / 1000)
      }));
      setActivityData(formattedData);
    } catch (err: any) {
      console.error('Error loading activity data:', err);
      setActivityData([]);
    } finally {
      setLoading(prev => ({ ...prev, activity: false }));
    }
  };

  // Gérer le changement de période
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    loadActivityData(newPeriod);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Formater les statistiques pour l'affichage
  const formatStats = () => {
    if (!stats) return [];

    return [
      {
        title: 'Total Utilisateurs',
        value: stats.total_users?.toLocaleString() || '0',
        change: `${stats.user_change_percentage && stats.user_change_percentage >= 0 ? '+' : ''}${stats.user_change_percentage || 0}%`,
        trend: stats.user_change_percentage && stats.user_change_percentage >= 0 ? 'up' : 'down',
        icon: Users,
        color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Hôtels Actifs',
        value: stats.active_hotels?.toString() || '0',
        change: `${stats.hotel_change_percentage && stats.hotel_change_percentage >= 0 ? '+' : ''}${stats.hotel_change_percentage || 0}%`,
        trend: stats.hotel_change_percentage && stats.hotel_change_percentage >= 0 ? 'up' : 'down',
        icon: Building,
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Réservations',
        value: stats.total_reservations?.toLocaleString() || '0',
        change: `${stats.booking_change_percentage && stats.booking_change_percentage >= 0 ? '+' : ''}${stats.booking_change_percentage || 0}%`,
        trend: stats.booking_change_percentage && stats.booking_change_percentage >= 0 ? 'up' : 'down',
        icon: Calendar,
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Revenus (30j)',
        value: `€${stats.revenue_last_30_days?.toLocaleString() || '0'}`,
        change: `${stats.revenue_change_percentage && stats.revenue_change_percentage >= 0 ? '+' : ''}${stats.revenue_change_percentage || 0}%`,
        trend: stats.revenue_change_percentage && stats.revenue_change_percentage >= 0 ? 'up' : 'down',
        icon: DollarSign,
        color: 'bg-gradient-to-r from-amber-500 to-orange-500',
        bgColor: 'bg-amber-50'
      }
    ];
  };

  // Préparer les données pour le graphique à barres
  const prepareBarChartData = () => {
    if (!activityData || activityData.length === 0) return [];

    return activityData.map(item => ({
      date: item.formattedDate || new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric' }),
      réservations: item.bookings || 0,
      revenus: Math.round((item.revenue || 0) / 100),
      'nouveaux utilisateurs': item.new_users || 0
    })).reverse();
  };

  // Préparer les données pour le graphique circulaire des rôles
  const preparePieChartData = () => {
    if (!roleDistribution) return [];

    return [
      { name: 'Administrateurs', value: roleDistribution.admin || 0, color: '#8B5CF6' },
      { name: 'Directeurs', value: roleDistribution.director || 0, color: '#06B6D4' },
      { name: 'Clients', value: roleDistribution.client || 0, color: '#10B981' }
    ];
  };

  // Fonction pour calculer les totaux de l'activité
  const calculateActivityTotals = () => {
    if (!activityData || activityData.length === 0) {
      return { totalBookings: 0, totalRevenue: 0, totalNewUsers: 0 };
    }

    const totals = activityData.reduce((acc, day) => {
      return {
        totalBookings: acc.totalBookings + (day.bookings || 0),
        totalRevenue: acc.totalRevenue + (day.revenue || 0),
        totalNewUsers: acc.totalNewUsers + (day.new_users || 0)
      };
    }, { totalBookings: 0, totalRevenue: 0, totalNewUsers: 0 });

    return totals;
  };

  // Fonction pour obtenir les badges de statut
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'Actif': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      'Inactif': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
      'Confirmée': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      'Annulée': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
      'Terminée': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="w-3 h-3" /> },
      'En attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      'En maintenance': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <Clock className="w-3 h-3" /> },
      'Bloqué': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      'Inactive': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
    };
    
    const { bg, text, icon } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {icon}
        <span className="hidden xs:inline">{status}</span>
      </span>
    );
  };

  // Fonction pour obtenir les badges de rôle
  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Admin',
      'DIRECTOR': 'Directeur',
      'CLIENT': 'Client'
    };

    const roleText = roleMap[role] || role;
    
    const config: Record<string, { bg: string; text: string }> = {
      'ADMIN': { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white' },
      'DIRECTOR': { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'text-white' },
      'CLIENT': { bg: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'text-white' },
      'Admin': { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white' },
      'Directeur': { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'text-white' },
      'Client': { bg: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'text-white' },
    };
    
    const { bg, text } = config[role] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {roleText}
      </span>
    );
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";

    // Convert "2026-01-21 10:28:45.857 +0100"
    const normalized = dateString
      .replace(' ', 'T')
      .replace(' +', '+');

    const date = new Date(normalized);

    if (isNaN(date.getTime())) return "—";

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Fonction pour formater la date relative
  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Aujourd'hui";
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
      
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    } catch (error) {
      return dateString;
    }
  };

  // Fonction pour obtenir le statut utilisateur
  const getUserStatus = (user: User) => {
    if (user.is_blocked) return 'Bloqué';
    return 'Actif';
  };

  // Fonction pour obtenir le nom complet
  const getFullName = (user: User) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username;
  };

  // Afficher le loading
  if (loading.stats && loading.users && loading.roles) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const activityTotals = calculateActivityTotals();
  const barChartData = prepareBarChartData();
  const pieChartData = preparePieChartData();

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* En-tête du dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Vue d'ensemble et statistiques de la plateforme</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={loadData}
            disabled={Object.values(loading).some(l => l)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition flex items-center gap-2 text-xs sm:text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${Object.values(loading).some(l => l) ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Rafraîchir</span>
          </button>
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

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Statistiques - Mobile: 1 colonne, Tablet: 2 colonnes, Desktop: 4 colonnes */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading.stats ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : formatStats().map((stat) => {
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
        {/* Activité récente - Graphique à barres */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Activité récente</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {activityTotals.totalBookings} réservations • €{activityTotals.totalRevenue.toLocaleString()} • {activityTotals.totalNewUsers} nouveaux utilisateurs
                  </span>
                </div>
              </div>
            </div>
            <select 
              value={period}
              onChange={handlePeriodChange}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
            </select>
          </div>
          
          <div className="h-48 sm:h-64">
            {loading.activity ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                <p className="text-gray-500 text-sm">Chargement des données d'activité...</p>
              </div>
            ) : activityData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <BarChart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-2 sm:mb-4" />
                <p className="text-gray-600 text-sm sm:text-base font-medium">Aucune donnée d'activité</p>
                <p className="text-xs sm:text-sm text-gray-400">Les données apparaîtront ici</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={barChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenus') {
                        return [`€${(Number(value) * 100).toLocaleString()}`, 'Revenus'];
                      }
                      return [value, name];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Bar 
                    dataKey="réservations" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                    name="Réservations"
                  />
                  <Bar 
                    dataKey="revenus" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]}
                    name="Revenus (x100)"
                  />
                  <Bar 
                    dataKey="nouveaux utilisateurs" 
                    fill="#8B5CF6" 
                    radius={[4, 4, 0, 0]}
                    name="Nouveaux utilisateurs"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Répartition des rôles - Graphique circulaire */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Répartition des rôles</h2>
          </div>
          
          <div className="h-48 sm:h-64">
            {loading.roles ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : roleDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      typeof value === 'number' ? value.toLocaleString() : '0'
                    }
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <PieChart className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
              </div>
            )}
          </div>
          
          {/* Statistiques détaillées */}
          <div className="mt-4 space-y-2">
            {roleDistribution && (
              <>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <span className="text-sm font-medium text-gray-700">Administrateurs</span>
                  </div>
                  <span className="font-bold text-gray-900">{roleDistribution.admin || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    <span className="text-sm font-medium text-gray-700">Directeurs</span>
                  </div>
                  <span className="font-bold text-gray-900">{roleDistribution.director || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    <span className="text-sm font-medium text-gray-700">Clients</span>
                  </div>
                  <span className="font-bold text-gray-900">{roleDistribution.client || 0}</span>
                </div>
              </>
            )}
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
                <p className="text-xs sm:text-sm text-gray-500">{recentHotels.length} derniers hôtels ajoutés</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <a href="/admin/hotels" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Voir tous les hôtels →
              </a>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Version mobile/tablette - Cards */}
            <div className="block lg:hidden">
              {loading.hotels ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="p-4 border-b border-gray-200">
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : recentHotels.length > 0 ? (
                recentHotels.map((hotel) => (
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
                            <div className="text-xs text-gray-500">• {hotel.bookings_count} rés.</div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Ajouté {formatRelativeDate(hotel.created_at)}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(hotel.status)}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 text-xs font-medium">
                          {hotel.manager_name.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-700 truncate max-w-[120px]">{hotel.manager_name}</span>
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
                ))
              ) : (
                <div className="p-6 text-center">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun hôtel trouvé</p>
                </div>
              )}
            </div>
            
            {/* Version desktop - Table */}
            <table className="w-full hidden lg:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hôtel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réservations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'ajout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading.hotels ? (
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : recentHotels.length > 0 ? (
                  recentHotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{hotel.name}</div>
                            <div className="text-sm text-gray-500">
                              {hotel.email || "Sans email"}
                            </div>
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
                            {hotel.manager_name.charAt(0)}
                          </div>
                          <span className="text-gray-700">{hotel.manager_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-lg text-gray-900">{hotel.bookings_count}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(hotel.created_at)}
                        </div>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <Building className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun hôtel trouvé</p>
                    </td>
                  </tr>
                )}
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
                  <p className="text-xs sm:text-sm text-gray-500">{users.length} utilisateurs au total</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {users.filter(u => !u.is_blocked).length} actifs
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading.users ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : users.length > 0 ? (
              users.slice(0, 5).map((user) => (
                <div key={user.id} className="p-3 sm:p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate text-sm sm:text-base">
                          {getFullName(user)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Inscrit le {formatDate(user.date_joined)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-3">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(getUserStatus(user))}
                      <button className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition ml-1">
                        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Aucun utilisateur trouvé</p>
              </div>
            )}
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
                  <p className="text-xs sm:text-sm text-gray-500">{recentReservations.length} dernières réservations</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                Total: €{recentReservations.reduce((sum, booking) => sum + booking.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading.reservations ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : recentReservations.length > 0 ? (
              recentReservations.map((booking) => (
                <div key={booking.id} className="p-3 sm:p-4 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{booking.id}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">
                        {booking.hotel_name} • {booking.user_name}
                      </div>
                      {booking.check_in && (
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(booking.check_in)} → {formatDate(booking.check_out || '')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2 sm:gap-0">
                      <div className="font-bold text-gray-900 text-sm sm:text-base">€{booking.amount}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 sm:ml-4">
                        {getStatusBadge(booking.status)}
                        <span className="text-xs text-gray-500">{formatDate(booking.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Aucune réservation trouvée</p>
              </div>
            )}
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
              <h3 className="font-semibold text-amber-900 mb-1 text-sm sm:text-base">Tableau de bord opérationnel</h3>
              <p className="text-amber-800 text-xs sm:text-sm">
                Toutes les données sont maintenant chargées depuis votre base de données en temps réel.
              </p>
            </div>
          </div>
          <button 
            onClick={loadData}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow-sm hover:shadow mt-2 sm:mt-0"
          >
            Rafraîchir les données
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;