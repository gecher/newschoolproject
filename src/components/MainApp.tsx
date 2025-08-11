import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './Auth/LoginForm';
import Navbar from './Layout/Navbar';
import StudentDashboard from './Dashboard/StudentDashboard';
import ClubsPage from './Clubs/ClubsPage';

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
    switch (currentPage) {
      case 'dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'clubs':
        return <ClubsPage onNavigate={handleNavigate} />;
      case 'events':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Events page coming soon...</p>
          </div>
        );
      case 'forums':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forums</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Forums page coming soon...</p>
          </div>
        );
      case 'badges':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Badges</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Badges page coming soon...</p>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Profile page coming soon...</p>
          </div>
        );
      case 'admin':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Admin panel coming soon...</p>
          </div>
        );
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