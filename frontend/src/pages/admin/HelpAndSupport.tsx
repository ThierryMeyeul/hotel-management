import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  FileText, 
  Video, 
  BookOpen, 
  Users, 
  Mail, 
  Phone, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  Star,
  Filter,
  Tag,
  Calendar,
  User,
  ThumbsUp,
  MessageCircle,
  Download,
  Printer,
  Share2,
  Bookmark,
  Bell,
  Globe,
  Headphones,
  Award,
  Shield,
  Zap,
  BarChart,
  CreditCard,
  Building,
  UserCog
} from 'lucide-react';
import Loader from '../../components/Loader';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  date: string;
  author: string;
  isNew?: boolean;
  isPopular?: boolean;
}

interface ContactOption {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  responseTime: string;
  actionText: string;
  link: string;
  priority?: boolean;
}

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignee?: string;
  category: string;
}

const HelpAndSupport: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'faq' | 'articles' | 'tickets' | 'contact'>('faq');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium'
  });

  // FAQ Data
  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "Comment ajouter un nouvel hôtel à la plateforme ?",
      answer: "Pour ajouter un nouvel hôtel, accédez à la section 'Hôtels' dans la sidebar, cliquez sur 'Ajouter un hôtel', remplissez le formulaire avec les informations de l'hôtel (nom, adresse, description, photos), configurez les paramètres de gestion et cliquez sur 'Enregistrer'. L'hôtel sera disponible après validation.",
      category: "Hôtels",
      tags: ["ajout", "hôtel", "configuration"],
      likes: 24,
      views: 156
    },
    {
      id: 2,
      question: "Comment assigner un manager à un hôtel ?",
      answer: "Dans la section 'Managers', sélectionnez 'Assigner manager'. Choisissez l'hôtel dans la liste, sélectionnez le manager à assigner, définissez les permissions (gestion des chambres, réservations, paramètres) et validez. Un email de confirmation sera envoyé au manager.",
      category: "Managers",
      tags: ["assignation", "permissions", "équipe"],
      likes: 18,
      views: 98
    },
    {
      id: 3,
      question: "Comment générer des rapports financiers ?",
      answer: "Les rapports financiers sont disponibles dans la section 'Analytics'. Sélectionnez la période (jour, semaine, mois, trimestre), choisissez le type de rapport (revenus, réservations, occupation), personnalisez les filtres et cliquez sur 'Générer'. Vous pouvez exporter en PDF ou Excel.",
      category: "Rapports",
      tags: ["finances", "analytics", "export"],
      likes: 32,
      views: 210
    },
    {
      id: 4,
      question: "Problème d'intégration avec le système de paiement",
      answer: "Vérifiez d'abord les clés API dans les paramètres de paiement. Assurez-vous que le mode test est désactivé pour les transactions réelles. Si le problème persiste, redémarrez l'intégration et vérifiez les logs système. Contactez le support pour les erreurs persistantes.",
      category: "Paiement",
      tags: ["intégration", "paiement", "erreur"],
      likes: 15,
      views: 87
    },
    {
      id: 5,
      question: "Comment configurer les notifications automatiques ?",
      answer: "Allez dans Paramètres > Notifications. Configurez les notifications par email et push pour chaque événement (nouvelle réservation, annulation, paiement). Vous pouvez personnaliser les templates et définir les heures d'envoi.",
      category: "Notifications",
      tags: ["configuration", "alertes", "email"],
      likes: 21,
      views: 134
    },
    {
      id: 6,
      question: "Gestion des remboursements et annulations",
      answer: "Les remboursements sont gérés depuis la section 'Réservations'. Sélectionnez la réservation à annuler, choisissez le type de remboursement (complet/partiel), spécifiez la raison et validez. Le système traitera automatiquement le remboursement via la méthode de paiement originale.",
      category: "Réservations",
      tags: ["remboursement", "annulation", "politique"],
      likes: 29,
      views: 178
    },
    {
      id: 7,
      question: "Comment importer des données en masse ?",
      answer: "Utilisez l'outil d'import CSV dans la section 'Outils'. Téléchargez le template, remplissez-le avec vos données, puis uploadez-le. Le système validera les données avant import. Vous pouvez planifier les imports récurrents.",
      category: "Données",
      tags: ["import", "csv", "masse"],
      likes: 14,
      views: 76
    },
    {
      id: 8,
      question: "Sécurité et permissions utilisateur",
      answer: "Configurez les rôles et permissions dans Paramètres > Utilisateurs. Créez des rôles personnalisés (admin, manager, support) avec des permissions spécifiques. Activez l'authentification à deux facteurs pour une sécurité renforcée.",
      category: "Sécurité",
      tags: ["sécurité", "permissions", "2fa"],
      likes: 36,
      views: 245
    }
  ];

  // Articles Data
  const articles: Article[] = [
    {
      id: 1,
      title: "Guide complet d'optimisation des réservations",
      excerpt: "Découvrez les meilleures pratiques pour maximiser votre taux d'occupation et augmenter vos revenus.",
      category: "Optimisation",
      readTime: 8,
      date: "2024-01-15",
      author: "Marie Dubois",
      isNew: true,
      isPopular: true
    },
    {
      id: 2,
      title: "Intégration API avancée avec les systèmes tiers",
      excerpt: "Apprenez à connecter votre plateforme avec les principaux systèmes de gestion hôtelière.",
      category: "Intégration",
      readTime: 12,
      date: "2024-01-10",
      author: "Pierre Martin",
      isPopular: true
    },
    {
      id: 3,
      title: "Sécurité des données et conformité RGPD",
      excerpt: "Guide détaillé sur la protection des données clients et la conformité réglementaire.",
      category: "Sécurité",
      readTime: 10,
      date: "2024-01-05",
      author: "Sophie Bernard"
    },
    {
      id: 4,
      title: "Analytics avancées : comprendre vos données",
      excerpt: "Utilisez les tableaux de bord pour prendre des décisions basées sur les données.",
      category: "Analytics",
      readTime: 6,
      date: "2023-12-20",
      author: "Thomas Leroy"
    },
    {
      id: 5,
      title: "Gestion efficace des équipes multi-hôtels",
      excerpt: "Stratégies pour manager plusieurs établissements et équipes efficacement.",
      category: "Management",
      readTime: 9,
      date: "2023-12-15",
      author: "Julie Petit"
    },
    {
      id: 6,
      title: "Automatisation des tâches récurrentes",
      excerpt: "Configurer des workflows automatisés pour gagner du temps sur les tâches quotidiennes.",
      category: "Automatisation",
      readTime: 7,
      date: "2023-12-10",
      author: "Alexandre Moreau"
    }
  ];

  // Contact Options
  const contactOptions: ContactOption[] = [
    {
      id: 1,
      title: "Chat en direct",
      description: "Discutez en temps réel avec notre équipe de support technique",
      icon: <MessageSquare className="w-6 h-6" />,
      responseTime: "2 minutes",
      actionText: "Lancer le chat",
      link: "#chat",
      priority: true
    },
    {
      id: 2,
      title: "Téléphone",
      description: "Parlez directement avec un expert support",
      icon: <Phone className="w-6 h-6" />,
      responseTime: "5 minutes",
      actionText: "Appeler maintenant",
      link: "tel:+33123456789"
    },
    {
      id: 3,
      title: "Email",
      description: "Envoyez-nous un email détaillé avec votre problème",
      icon: <Mail className="w-6 h-6" />,
      responseTime: "4 heures",
      actionText: "Envoyer un email",
      link: "mailto:support@hotelsphere.com"
    },
    {
      id: 4,
      title: "Créer un ticket",
      description: "Soumettez une demande formelle de support",
      icon: <FileText className="w-6 h-6" />,
      responseTime: "24 heures",
      actionText: "Créer un ticket",
      link: "#ticket"
    }
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'Tous', icon: <Globe className="w-4 h-4" />, count: 42 },
    { id: 'hotels', name: 'Hôtels', icon: <Building className="w-4 h-4" />, count: 12 },
    { id: 'managers', name: 'Managers', icon: <UserCog className="w-4 h-4" />, count: 8 },
    { id: 'payments', name: 'Paiements', icon: <CreditCard className="w-4 h-4" />, count: 7 },
    { id: 'reports', name: 'Rapports', icon: <BarChart className="w-4 h-4" />, count: 6 },
    { id: 'security', name: 'Sécurité', icon: <Shield className="w-4 h-4" />, count: 5 },
    { id: 'integration', name: 'Intégration', icon: <Zap className="w-4 h-4" />, count: 4 }
  ];

  // Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 101,
      title: "Problème de synchronisation des réservations",
      description: "Les réservations ne se synchronisent pas avec le système externe",
      status: 'in-progress',
      priority: 'high',
      createdAt: '2024-01-28',
      updatedAt: '2024-01-28',
      assignee: 'Sophie B.',
      category: 'Intégration'
    },
    {
      id: 102,
      title: "Erreur dans le calcul des commissions",
      description: "Le système ne calcule pas correctement les commissions sur les réservations",
      status: 'open',
      priority: 'urgent',
      createdAt: '2024-01-27',
      updatedAt: '2024-01-27',
      category: 'Paiement'
    },
    {
      id: 103,
      title: "Demande d'ajout de fonctionnalité",
      description: "Ajout d'un nouveau champ dans le formulaire de réservation",
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-25',
      updatedAt: '2024-01-27',
      assignee: 'Pierre M.',
      category: 'Fonctionnalités'
    },
    {
      id: 104,
      title: "Problème d'affichage mobile",
      description: "L'interface ne s'affiche pas correctement sur mobile",
      status: 'closed',
      priority: 'low',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-22',
      assignee: 'Marie D.',
      category: 'Interface'
    }
  ]);

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleCreateTicket = () => {
    if (newTicket.title && newTicket.description) {
      const ticket: SupportTicket = {
        id: tickets.length + 101,
        title: newTicket.title,
        description: newTicket.description,
        status: 'open',
        priority: newTicket.priority as any,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        category: newTicket.category
      };
      setTickets([ticket, ...tickets]);
      setNewTicket({ title: '', description: '', category: 'technical', priority: 'medium' });
      setActiveTab('tickets');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Centre d'Aide & Support
              </h1>
              <p className="text-lg text-indigo-100 mb-6 max-w-2xl">
                Trouvez rapidement des réponses à vos questions, accédez à notre documentation et contactez notre équipe de support.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une question, un article ou un guide..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-medium"
                  >
                    Rechercher
                  </button>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <HelpCircle className="w-32 h-32 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Articles disponibles</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
              </div>
              <FileText className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tickets ouverts</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de résolution</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps moyen de réponse</p>
                <p className="text-2xl font-bold text-gray-900">2h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Catégories
              </h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      {category.name}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-white text-indigo-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Support Premium</h3>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                Accès prioritaire 24/7 avec notre équipe d'experts dédiée.
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                Voir les plans
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'faq'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'articles'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'tickets'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mes Tickets
                  {tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                      {tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length}
                    </span>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'contact'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Nous Contacter
                </div>
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader size="lg" text="Recherche en cours..." />
              </div>
            )}

            {/* FAQ Tab */}
            {!isLoading && activeTab === 'faq' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Questions Fréquentes</h2>
                    <p className="text-gray-600 mb-6">Trouvez rapidement des réponses aux questions les plus courantes</p>
                    
                    <div className="space-y-4">
                      {filteredFaqs.map(faq => (
                        <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                  {faq.category}
                                </span>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />
                                    {faq.likes}
                                  </span>
                                  <span>•</span>
                                  <span>{faq.views} vues</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedFaq === faq.id ? 'rotate-90' : ''
                            }`} />
                          </button>
                          
                          {expandedFaq === faq.id && (
                            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-5">
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-700 mb-4">{faq.answer}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2">
                                    {faq.tags.map(tag => (
                                      <span key={tag} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                      <ThumbsUp className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                      <MessageCircle className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {!isLoading && activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Documentation</h2>
                      <p className="text-gray-600">Guides complets, tutoriels et articles techniques</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Tout télécharger
                      </button>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Tutoriels vidéo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                      <div key={article.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                              {article.category}
                            </span>
                            <div className="flex gap-1">
                              {article.isNew && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Nouveau</span>
                              )}
                              {article.isPopular && (
                                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">Populaire</span>
                              )}
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {article.author}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.readTime} min
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-indigo-600">
                                <Bookmark className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-indigo-600">
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
                          <button className="w-full flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                            Lire l'article
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tickets Tab */}
            {!isLoading && activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Mes Tickets de Support</h2>
                      <p className="text-gray-600">Suivez l'avancement de vos demandes d'assistance</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('contact')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Nouveau Ticket
                    </button>
                  </div>

                  {/* Tickets List */}
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status === 'in-progress' ? 'En cours' : 
                               ticket.status === 'resolved' ? 'Résolu' :
                               ticket.status === 'closed' ? 'Fermé' : 'Ouvert'}
                            </span>
                            <span className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority === 'urgent' ? 'Urgent' :
                               ticket.priority === 'high' ? 'Élevée' :
                               ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {ticket.category}
                            </span>
                            {ticket.assignee && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Assigné à {ticket.assignee}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Créé le {ticket.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {!isLoading && activeTab === 'contact' && (
              <div className="space-y-6">
                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {contactOptions.map(option => (
                    <div key={option.id} className={`bg-white rounded-xl border ${
                      option.priority ? 'border-indigo-200 shadow-md' : 'border-gray-200'
                    } p-6 hover:shadow-lg transition-shadow`}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 rounded-lg ${
                          option.priority ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{option.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            Temps de réponse moyen : {option.responseTime}
                          </div>
                        </div>
                      </div>
                      <a
                        href={option.link}
                        className={`w-full block text-center py-2.5 rounded-lg font-medium ${
                          option.priority 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {option.actionText}
                      </a>
                    </div>
                  ))}
                </div>

                {/* New Ticket Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Créer un nouveau ticket</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du problème
                      </label>
                      <input
                        type="text"
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                        placeholder="Décrivez brièvement votre problème..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description détaillée
                      </label>
                      <textarea
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        placeholder="Décrivez votre problème en détail, incluez les étapes pour le reproduire..."
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie
                        </label>
                        <select
                          value={newTicket.category}
                          onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="technical">Technique</option>
                          <option value="billing">Facturation</option>
                          <option value="account">Compte</option>
                          <option value="feature">Fonctionnalité</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priorité
                        </label>
                        <select
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="low">Basse</option>
                          <option value="medium">Moyenne</option>
                          <option value="high">Élevée</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={handleCreateTicket}
                        disabled={!newTicket.title || !newTicket.description}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Soumettre le ticket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Besoin d'aide personnalisée ?</h3>
              <p className="text-blue-700 max-w-2xl">
                Notre équipe d'experts est disponible 24/7 pour vous accompagner dans la configuration avancée, l'intégration et l'optimisation de votre plateforme.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Appeler un expert
              </button>
              <button className="px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
                Prendre rendez-vous
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpAndSupport;