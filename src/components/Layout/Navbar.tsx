import React, { useEffect, useState } from 'react';
import { 
  Bell, User, Menu, X, Sun, Moon, 
  Home, Users, Calendar, MessageSquare, Award, BarChart3, UserPlus, Megaphone
} from 'lucide-react';
import { motion } from 'framer-motion';
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
        { id: 'clubs', label: 'Manage Clubs', icon: Users },
        { id: 'events', label: 'Manage Events', icon: Calendar },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'users', label: 'All Users', icon: Users },
        { id: 'memberships', label: 'Requests', icon: UserPlus },
      ];
    } else if (currentUser?.role === 'TEACHER') {
      return [
        { id: 'clubs', label: 'Assigned Clubs', icon: Users },
        { id: 'events', label: 'Club Events', icon: Calendar },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'memberships', label: 'Requests', icon: UserPlus },
      ];
    } else if (currentUser?.role === 'STUDENT') {
      return [
        { id: 'clubs', label: 'Join Clubs', icon: Users },
        { id: 'joined', label: 'Joined', icon: Award },
        { id: 'events', label: 'All Events', icon: Calendar },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
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
    <nav className="relative sticky top-0 z-50 bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200/60 dark:border-gray-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
              className="flex-shrink-0 flex items-center group hover:opacity-95 transition"
            >
              {/* Sample Logo - SVG Icon */}
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`ml-3 md:ml-4 text-[1.15rem] md:text-[1.25rem] font-bold tracking-tight transition-all duration-300 ${
                isPublic
                  ? 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  : 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
              }`}>
                <span className="md:hidden">Student Club</span>
                <span className="hidden md:inline">The Student Club</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 min-w-0">
            {isPublic ? (
              <div className="flex justify-end items-center gap-3">
                {/* Theme Toggle for Public Users */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>

                <button
                  onClick={() => onNavigate('contact')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    currentPage === 'contact'
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Contact Us
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    currentPage === 'about'
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  About Us
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    currentPage === 'login'
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center min-w-0">
                <div className="ml-6 md:ml-10 flex items-baseline space-x-2 md:space-x-3 pr-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium flex items-center space-x-2 transition-all duration-300 hover:scale-[1.02] ${
                          currentPage === item.id
                            ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-600'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden lg:inline">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search removed as requested */}
              </div>
            )}
          </div>

          {/* Right side items */}
          {!isPublic && (
            <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 relative transition-all duration-300 hover:scale-110">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl shadow-2xl border border-gray-200/70 dark:border-gray-700/70 z-50"
                  >
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
                  </motion.div>
                )}
              </div>

              {/* User Menu and Logout */}
              <div className="relative">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105"
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
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div 
        initial={false}
        animate={{ 
          height: isMobileMenuOpen ? "auto" : 0,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden overflow-hidden"
      >
        {isMobileMenuOpen && (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {isPublic ? (
              <>
                {/* Theme Toggle for Mobile Public Users */}
                <button
                  onClick={toggleTheme}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 flex items-center space-x-2"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                <button
                  onClick={() => { onNavigate('contact'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
                >
                  Contact Us
                </button>
                <button
                  onClick={() => { onNavigate('about'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
                >
                  About Us
                </button>
                <button
                  onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
                >
                  Get Started
                </button>
              </>
            ) : (
              // existing mobile menu for authenticated users
              <>
                {/* Mobile Search removed */}
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-all duration-300 ${
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
        )}
      </motion.div>
      {/* Subtle gradient accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    </nav>
  );
};

export default Navbar;