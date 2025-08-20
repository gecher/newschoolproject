import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './Auth/LoginForm';
import Navbar from './Layout/Navbar';
import StudentDashboard from './Dashboard/StudentDashboard';
import TeacherDashboard from './Dashboard/TeacherDashboard';
import ClubsPage from './Clubs/ClubsPage';
import EventsPage from './Events/EventsPage';
import ProfilePage from './Profile/ProfilePage';
import AdminPanel from './Admin/AdminPanel';
import LandingPage from './Landing/LandingPage';
import ClubDetailPage from './Clubs/ClubDetailPage';
import EventDetailPage from './Events/EventDetailPage';
import AnnouncementsPage from './Announcements/AnnouncementsPage';
import AboutPage from './About/AboutPage';
import ContactPage from './Contact/ContactPage';

const MainApp: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data);
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"
        ></motion.div>
      </motion.div>
    );
  }

  // Show public pages (with navbar) if no user is logged in
  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
      >
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {currentPage === 'login' ? (
                <LoginForm />
              ) : currentPage === 'about' ? (
                <AboutPage onNavigate={handleNavigate} />
              ) : currentPage === 'contact' ? (
                <ContactPage onNavigate={handleNavigate} />
              ) : currentPage === 'landing' ? (
                <LandingPage onNavigate={handleNavigate} />
              ) : (
                <LandingPage onNavigate={handleNavigate} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    );
  }

  const renderPage = () => {
    // Role-based routing for Admin
    if (currentUser.role === 'ADMIN') {
      // Admin can access all these pages, and they all render AdminPanel
      if (['dashboard', 'clubs', 'events', 'users', 'memberships'].includes(currentPage)) {
        return <AdminPanel onNavigate={handleNavigate} currentPage={currentPage} />;
      }
    }

    // Role-based routing for Teacher
    if (currentUser.role === 'TEACHER') {
      if (['dashboard', 'clubs', 'events', 'memberships'].includes(currentPage)) {
        return <TeacherDashboard onNavigate={handleNavigate} currentPage={currentPage} />;
      }
    }

    // Role-based routing for Student
    if (currentUser.role === 'STUDENT') {
      if (['dashboard', 'clubs', 'events'].includes(currentPage)) {
        return <StudentDashboard onNavigate={handleNavigate} currentPage={currentPage} />;
      }
    }

    // General page routing
    switch (currentPage) {
      case 'dashboard':
        if (currentUser.role === 'STUDENT') {
          return <StudentDashboard onNavigate={handleNavigate} />;
        }
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'clubs':
        return <ClubsPage onNavigate={handleNavigate} />;
      case 'club-detail':
        return <ClubDetailPage onNavigate={handleNavigate} clubId={pageData?.clubId} />;
      case 'events':
        return <EventsPage onNavigate={handleNavigate} />;
      case 'event-detail':
        return <EventDetailPage onNavigate={handleNavigate} eventId={pageData?.eventId} />;
      case 'announcements':
        return <AnnouncementsPage onNavigate={handleNavigate} />;
      case 'about':
        // Redirect unauthenticated users to landing page
        if (!currentUser) {
          return <AboutPage onNavigate={handleNavigate} />;
        }
        // For authenticated users, redirect to landing page
        return <LandingPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      default:
        if (currentUser.role === 'STUDENT') {
          return <StudentDashboard onNavigate={handleNavigate} />;
        } else if (currentUser.role === 'TEACHER') {
          return <TeacherDashboard onNavigate={handleNavigate} />;
        } else if (currentUser.role === 'ADMIN') {
          return <AdminPanel onNavigate={handleNavigate} currentPage={currentPage} />;
        }
        return <StudentDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default MainApp;