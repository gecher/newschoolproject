import React, { useEffect, useState } from 'react';
import { 
  Search, Bell, User, Menu, X, Sun, Moon, 
  Home, Users, Calendar, MessageSquare, Award, BarChart3, UserPlus, Megaphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { dataService } from '../../services/dataService';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const refresh = () => {
      setUnreadCount(dataService.getUnreadNotificationsCount(currentUser.id));
      setNotifications(dataService.getNotificationsByUser(currentUser.id));
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const getNavigationItems = () => {
    if (currentUser?.role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'Stats', icon: BarChart3 },
        { id: 'clubs', label: 'Manage Clubs', icon: Users },
        { id: 'events', label: 'Manage Events', icon: Calendar },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'users', label: 'All Users', icon: Users },
        { id: 'memberships', label: 'Requests', icon: UserPlus },
        { id: 'about', label: 'About', icon: Users },
      ];
    } else if (currentUser?.role === 'TEACHER') {
      return [
        { id: 'dashboard', label: 'Stats', icon: BarChart3 },
        { id: 'clubs', label: 'Assigned Clubs', icon: Users },
        { id: 'events', label: 'Club Events', icon: Calendar },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'memberships', label: 'Requests', icon: UserPlus },
        { id: 'about', label: 'About', icon: Users },
      ];
    } else if (currentUser?.role === 'STUDENT') {
      return [
        { id: 'dashboard', label: 'Stats', icon: BarChart3 },
        { id: 'clubs', label: 'Join Clubs', icon: Users },
        { id: 'events', label: 'All Events', icon: Calendar },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'about', label: 'About', icon: Users },
      ];
    }
    
    return [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'clubs', label: 'Clubs', icon: Users },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'about', label: 'About', icon: Users },
    ];
  };

  const navigationItems = getNavigationItems();

  const isPublic = !currentUser;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img
                src="/logo.png"
                alt="The Student Club"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                The Student Club
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1">
            {isPublic ? (
              <div className="flex justify-end items-center gap-3">
                <button
                  onClick={() => onNavigate('about')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'about'
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${
                          currentPage === item.id
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="hidden md:block flex-1 max-w-md mx-8">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search clubs, events, users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side items */}
          {!isPublic && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                      <button
                        onClick={() => {
                          if (currentUser) {
                            dataService.markAllNotificationsRead(currentUser.id);
                            setUnreadCount(0);
                            setNotifications(dataService.getNotificationsByUser(currentUser.id));
                          }
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`px-4 py-3 text-sm border-b border-gray-100 dark:border-gray-700 ${n.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            <div className="flex items-start justify-between">
                              <p className="pr-2">{n.message}</p>
                              {!n.isRead && (
                                <button
                                  onClick={() => {
                                    dataService.markNotificationRead(n.id);
                                    if (currentUser) {
                                      setUnreadCount(dataService.getUnreadNotificationsCount(currentUser.id));
                                      setNotifications(dataService.getNotificationsByUser(currentUser.id));
                                    }
                                  }}
                                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline ml-2"
                                >
                                  Read
                                </button>
                              )}
                            </div>
                            <div className="mt-1 text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu and Logout */}
              <div className="relative">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {currentUser?.profilePhoto ? (
                    <img
                      src={currentUser.profilePhoto}
                      alt={currentUser.fullName}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{currentUser?.fullName}</span>
                </button>
              </div>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {isPublic ? (
              <>
                <button
                  onClick={() => { onNavigate('about'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  About
                </button>
                <button
                  onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Get Started
                </button>
              </>
            ) : (
              // existing mobile menu for authenticated users
              <>
                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 ${
                        currentPage === item.id
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;