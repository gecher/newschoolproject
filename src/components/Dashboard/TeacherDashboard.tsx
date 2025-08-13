import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Plus, Edit, Trash2, CheckCircle, XCircle, 
  Eye, UserPlus, BarChart3, BookOpen, Award 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import dataService from '../../services/dataService';
import type { Club, Event, Membership } from '../../services/dataService';

interface TeacherDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadTeacherData();
    }
  }, [currentUser]);

  const loadTeacherData = () => {
    if (!currentUser) return;
    
    const clubs = dataService.getClubsByAdvisor(currentUser.id);
    setMyClubs(clubs);
    
    const allEvents = dataService.getAllEvents();
    const teacherEvents = allEvents.filter(event => 
      clubs.some(club => club.id === event.clubId)
    );
    setMyEvents(teacherEvents);
    
    const allMemberships = dataService.getAllMemberships();
    const teacherMemberships = allMemberships.filter(membership =>
      clubs.some(club => club.id === membership.clubId)
    );
    setMemberships(teacherMemberships);
  };

  const handleCreateEvent = (clubId: string) => {
    const newEvent = dataService.createEvent({
      clubId,
      title: 'New Event',
      description: 'Event description',
      location: 'School Campus',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop',
      rsvpLimit: 50
    });
    
    if (newEvent) {
      loadTeacherData();
      alert('Event created successfully!');
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const success = dataService.deleteEvent(eventId);
      if (success) {
        loadTeacherData();
        alert('Event deleted successfully!');
      }
    }
  };

  const handleApproveMembership = (membershipId: string) => {
    const updatedMembership = dataService.approveMembership(membershipId);
    if (updatedMembership) {
      loadTeacherData();
      alert('Membership approved successfully!');
    }
  };

  const handleRejectMembership = (membershipId: string) => {
    const updatedMembership = dataService.rejectMembership(membershipId);
    if (updatedMembership) {
      loadTeacherData();
      alert('Membership rejected successfully!');
    }
  };

  const getStats = () => {
    const totalClubs = myClubs.length;
    const totalEvents = myEvents.length;
    const totalMembers = memberships.filter(m => m.status === 'APPROVED').length;
    const pendingMemberships = memberships.filter(m => m.status === 'PENDING').length;
    const upcomingEvents = myEvents.filter(event => new Date(event.date) > new Date()).length;

    return {
      totalClubs,
      totalEvents,
      totalMembers,
      pendingMemberships,
      upcomingEvents
    };
  };

  const stats = getStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'clubs', label: 'Clubs', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'memberships', label: 'Memberships', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {currentUser?.fullName}. Manage your clubs and activities.
          </p>
        </motion.div>

        {/* Stats Overview */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Clubs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClubs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingMemberships}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* My Clubs */}
          {activeTab === 'clubs' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">My Clubs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClubs.map((club) => (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-center mb-4">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={club.logoUrl}
                        alt={club.name}
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {club.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {club.category}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {club.description.substring(0, 100)}...
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {club.memberCount} members
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        club.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {club.status}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onNavigate('club-detail', { clubId: club.id })}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleCreateEvent(club.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {activeTab === 'events' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">My Events</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => {
                  const club = dataService.getClubById(event.clubId);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <img
                        className="w-full h-48 object-cover"
                        src={event.imageUrl}
                        alt={event.title}
                      />
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {event.description.substring(0, 80)}...
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-2" />
                            {club?.name || 'Unknown Club'}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onNavigate('event-detail', { eventId: event.id })}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Memberships */}
          {activeTab === 'memberships' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Membership Requests</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Club
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {memberships.map((membership) => {
                      const user = dataService.getUserById(membership.userId);
                      const club = dataService.getClubById(membership.clubId);
                      
                      return (
                        <tr key={membership.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={user?.profilePhoto || ''}
                                alt={user?.fullName || 'Unknown User'}
                              />
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user?.fullName || 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {club?.name || 'Unknown Club'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {membership.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              membership.status === 'APPROVED' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : membership.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {membership.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {membership.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApproveMembership(membership.id)}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectMembership(membership.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
