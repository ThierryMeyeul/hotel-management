import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Globe, 
  Bell, 
  Shield, 
  User,
  Mail,
  Palette,
  CreditCard,
  Database,
  Key,
  Users,
  BellRing,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Lock,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  RefreshCw,
  Upload,
  Trash2,
  Download,
  History
} from 'lucide-react';
import Switch from '../../components/Switch';
import Loader from '../../components/Loader';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AdminSettings: React.FC = () => {
  // États pour les paramètres généraux
  const [siteName, setSiteName] = useState('HotelSphere');
  const [siteUrl, setSiteUrl] = useState('https://hotelsphere.com');
  const [defaultCurrency, setDefaultCurrency] = useState('EUR');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [language, setLanguage] = useState('fr');
  
  // États pour les paramètres de sécurité
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelist, setIpWhitelist] = useState<string[]>(['192.168.1.1', '10.0.0.1']);
  const [newIp, setNewIp] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // États pour les paramètres de notification
  const [emailNotifications, setEmailNotifications] = useState({
    newBooking: true,
    cancellation: true,
    payment: true,
    systemAlerts: true,
    newsletter: false,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    newMessage: true,
    review: true,
    maintenance: false,
  });
  
  // États pour l'apparence
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  // États pour les paramètres de paiement
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [taxRate, setTaxRate] = useState(20);
  
  // États généraux
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [backupStatus, setBackupStatus] = useState<'idle' | 'creating' | 'restoring'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('sk_live_51Mh2...E4rX9');

  // Sections des paramètres
  const settingsSections: SettingSection[] = [
    {
      id: 'general',
      title: 'Général',
      description: 'Paramètres de base de la plateforme',
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: 'security',
      title: 'Sécurité',
      description: 'Sécurité et authentification',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Alertes et communications',
      icon: <Bell className="w-5 h-5" />
    },
    {
      id: 'appearance',
      title: 'Apparence',
      description: 'Interface utilisateur',
      icon: <Palette className="w-5 h-5" />
    },
    {
      id: 'payment',
      title: 'Paiement',
      description: 'Modes de paiement',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      description: 'Gestion des permissions',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'api',
      title: 'API',
      description: 'Clés et intégrations',
      icon: <Key className="w-5 h-5" />
    },
    {
      id: 'backup',
      title: 'Sauvegarde',
      description: 'Données et système',
      icon: <Database className="w-5 h-5" />
    }
  ];

  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD'];
  const timezones = ['Europe/Paris', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'];
  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' }
  ];
  const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'];

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simuler une sauvegarde API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    // Ici vous feriez l'appel API réel
    console.log('Paramètres sauvegardés');
  };

  const handleAddIp = () => {
    if (newIp && !ipWhitelist.includes(newIp)) {
      setIpWhitelist([...ipWhitelist, newIp]);
      setNewIp('');
    }
  };

  const handleRemoveIp = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter(i => i !== ip));
  };

  const handleCreateBackup = async () => {
    setBackupStatus('creating');
    // Simuler la création de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBackupStatus('idle');
  };

  const handleRestoreBackup = async () => {
    setBackupStatus('restoring');
    // Simuler la restauration
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBackupStatus('idle');
  };

  const handleRegenerateApiKey = async () => {
    // Simuler la régénération de clé API
    setApiKey('sk_live_' + Math.random().toString(36).substr(2, 24));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du site
                </label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise par défaut
                </label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format de date
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {dateFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Langue
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Authentification à deux facteurs</h3>
                  <p className="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                </div>
                <Switch checked={twoFactorAuth} onChange={setTwoFactorAuth} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Délai d'expiration de session</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sessionTimeout} minutes</p>
                    <p className="text-sm text-gray-600">Durée d'inactivité avant déconnexion automatique</p>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                    className="w-48"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liste blanche IP</h3>
              <p className="text-sm text-gray-600 mb-4">Restreindre l'accès admin à des adresses IP spécifiques</p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="192.168.1.1"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleAddIp}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Ajouter
                </button>
              </div>
              
              <div className="space-y-2">
                {ipWhitelist.map(ip => (
                  <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-mono text-sm">{ip}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveIp(ip)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisibility ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisibility(!passwordVisibility)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {passwordVisibility ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Notifications par email
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Nouvelle réservation</p>
                    <p className="text-sm text-gray-600">Recevoir un email pour chaque nouvelle réservation</p>
                  </div>
                  <Switch
                    checked={emailNotifications.newBooking}
                    onChange={(checked) => setEmailNotifications({...emailNotifications, newBooking: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Annulation</p>
                    <p className="text-sm text-gray-600">Recevoir un email pour chaque annulation</p>
                  </div>
                  <Switch
                    checked={emailNotifications.cancellation}
                    onChange={(checked) => setEmailNotifications({...emailNotifications, cancellation: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Paiements</p>
                    <p className="text-sm text-gray-600">Alertes de paiement et de remboursement</p>
                  </div>
                  <Switch
                    checked={emailNotifications.payment}
                    onChange={(checked) => setEmailNotifications({...emailNotifications, payment: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Alertes système</p>
                    <p className="text-sm text-gray-600">Notifications importantes du système</p>
                  </div>
                  <Switch
                    checked={emailNotifications.systemAlerts}
                    onChange={(checked) => setEmailNotifications({...emailNotifications, systemAlerts: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Newsletter</p>
                    <p className="text-sm text-gray-600">Mises à jour produit et astuces</p>
                  </div>
                  <Switch
                    checked={emailNotifications.newsletter}
                    onChange={(checked) => setEmailNotifications({...emailNotifications, newsletter: checked})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BellRing className="w-5 h-5" />
                Notifications push
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Nouveaux messages</p>
                    <p className="text-sm text-gray-600">Notifications sur les nouveaux messages clients</p>
                  </div>
                  <Switch
                    checked={pushNotifications.newMessage}
                    onChange={(checked) => setPushNotifications({...pushNotifications, newMessage: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Avis clients</p>
                    <p className="text-sm text-gray-600">Alertes pour les nouveaux avis</p>
                  </div>
                  <Switch
                    checked={pushNotifications.review}
                    onChange={(checked) => setPushNotifications({...pushNotifications, review: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Maintenance</p>
                    <p className="text-sm text-gray-600">Notifications de maintenance système</p>
                  </div>
                  <Switch
                    checked={pushNotifications.maintenance}
                    onChange={(checked) => setPushNotifications({...pushNotifications, maintenance: checked})}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thème</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 ${
                    theme === 'light' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sun className="w-6 h-6" />
                  <span className="font-medium">Clair</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 ${
                    theme === 'dark' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Moon className="w-6 h-6" />
                  <span className="font-medium">Sombre</span>
                </button>
                
                <button
                  onClick={() => setTheme('auto')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 ${
                    theme === 'auto' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Monitor className="w-6 h-6" />
                  <span className="font-medium">Auto</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Couleur principale</h3>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-16 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sidebar réduite par défaut</p>
                    <p className="text-sm text-gray-600">Afficher la sidebar réduite au chargement</p>
                  </div>
                  <Switch checked={sidebarCollapsed} onChange={setSidebarCollapsed} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Mode compact</p>
                    <p className="text-sm text-gray-600">Réduire l'espacement des éléments d'interface</p>
                  </div>
                  <Switch checked={compactMode} onChange={setCompactMode} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Mode test</h3>
                  <p className="text-sm text-gray-600">Activer/désactiver les paiements de test</p>
                </div>
                <Switch checked={testMode} onChange={setTestMode} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Stripe</p>
                      <p className="text-sm text-gray-600">Paiements par carte</p>
                    </div>
                  </div>
                  <Switch checked={stripeEnabled} onChange={setStripeEnabled} />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-600">Paiements en ligne</p>
                    </div>
                  </div>
                  <Switch checked={paypalEnabled} onChange={setPaypalEnabled} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de TVA</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center">
                  {taxRate}%
                </span>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clé API</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clé API secrète
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono pr-24"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleRegenerateApiKey}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Attention</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Ne partagez jamais votre clé API. Elle donne accès à toutes vos données.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Télécharger la documentation API
                </button>
              </div>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegarde manuelle</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={handleCreateBackup}
                    disabled={backupStatus !== 'idle'}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {backupStatus === 'creating' ? (
                      <>
                        <Loader size="sm" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Database className="w-5 h-5" />
                        Créer une sauvegarde
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleRestoreBackup}
                    disabled={backupStatus !== 'idle'}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {backupStatus === 'restoring' ? (
                      <>
                        <Loader size="sm" />
                        Restauration...
                      </>
                    ) : (
                      <>
                        <History className="w-5 h-5" />
                        Restaurer
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Dernière sauvegarde: 28 Jan 2024, 10:30 AM • Taille: 2.4 GB
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegardes automatiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sauvegardes quotidiennes</p>
                    <p className="text-sm text-gray-600">Exécuter automatiquement à 2:00 AM</p>
                  </div>
                  <Switch checked={true} onChange={() => {}} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sauvegardes hebdomadaires</p>
                    <p className="text-sm text-gray-600">Dimanche à 3:00 AM</p>
                  </div>
                  <Switch checked={true} onChange={() => {}} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de sauvegardes à conserver
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    defaultValue="7"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600 mt-1">Gérez les paramètres de votre plateforme</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader size="sm" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="sticky top-32 space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeSection === section.id 
                      ? 'bg-white shadow-sm' 
                      : 'bg-gray-100'
                  }`}>
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{section.title}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Section header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {settingsSections.find(s => s.id === activeSection)?.icon}
                      {settingsSections.find(s => s.id === activeSection)?.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {settingsSections.find(s => s.id === activeSection)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings content */}
              <div className="p-6">
                {renderSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;