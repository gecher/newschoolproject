import React, { useState } from 'react';
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show landing page if no user is logged in
  if (!currentUser) {
    if (currentPage === 'login') {
      return <LoginForm />;
    }
    return <LandingPage onNavigate={handleNavigate} />;
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
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPanel onNavigate={handleNavigate} currentPage={currentPage} />;
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

export default MainApp;