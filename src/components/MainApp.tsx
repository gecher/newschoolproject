import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './Auth/LoginForm';
import Navbar from './Layout/Navbar';
import StudentDashboard from './Dashboard/StudentDashboard';
import TeacherDashboard from './Dashboard/TeacherDashboard';
import ClubsPage from './Clubs/ClubsPage';
import EventsPage from './Events/EventsPage';
import ForumsPage from './Forums/ForumsPage';
import BadgesPage from './Badges/BadgesPage';
import ProfilePage from './Profile/ProfilePage';
import AdminPanel from './Admin/AdminPanel';
import LandingPage from './Landing/LandingPage';

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

  if (!currentUser) {
    return <LoginForm />;
  }

  const renderPage = () => {
    // Role-based routing
    if (currentUser.role === 'ADMIN' && currentPage === 'dashboard') {
      return <AdminPanel onNavigate={handleNavigate} />;
    }

    if (currentUser.role === 'TEACHER' && currentPage === 'dashboard') {
      return <TeacherDashboard onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'clubs':
        return <ClubsPage onNavigate={handleNavigate} />;
      case 'events':
        return <EventsPage onNavigate={handleNavigate} />;
      case 'forums':
        return <ForumsPage onNavigate={handleNavigate} />;
      case 'badges':
        return <BadgesPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPanel onNavigate={handleNavigate} />;
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      default:
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