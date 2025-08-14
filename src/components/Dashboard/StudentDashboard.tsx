import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Plus, Eye, UserPlus, BarChart3, 
  CheckCircle, XCircle, BookOpen, Award, MapPin 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import dataService from '../../services/dataService';
import type { Club, Event, Membership } from '../../services/dataService';

interface StudentDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [myMemberships, setMyMemberships] = useState<Membership[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadStudentData();
    }
  }, [currentUser]);

  const loadStudentData = () => {
    if (!currentUser) return;
    
    const clubs = dataService.getAllClubs();
    setAllClubs(clubs);
    
    const memberships = dataService.getMembershipsByUser(currentUser.id);
    setMyMemberships(memberships);
    
    const events = dataService.getAllEvents();
    setAllEvents(events);
    
    // Get events for clubs the student is a member of
    const myClubIds = memberships
      .filter(m => m.status === 'APPROVED')
      .map(m => m.clubId);
    const studentEvents = events.filter(event => myClubIds.includes(event.clubId));
    setMyEvents(studentEvents);
  };

  const handleJoinClub = (clubId: string) => {
    if (!currentUser) return;
    
    // Check if already a member
    const existingMembership = myMemberships.find(m => m.clubId === clubId);
    if (existingMembership) {
      alert('You are already a member or have a pending request for this club.');
      return;
    }
    
    const newMembership = dataService.createMembership({
      userId: currentUser.id,
      clubId,
      role: 'MEMBER',
      status: 'PENDING',
      gradeId: 'grade-1' // Default grade
    });
    
    if (newMembership) {
      loadStudentData();
      alert('Membership request sent successfully!');
    }
  };

  const handleLeaveClub = (membershipId: string) => {
    if (window.confirm('Are you sure you want to leave this club?')) {
      const success = dataService.deleteMembership(membershipId);
      if (success) {
        loadStudentData();
        alert('Successfully left the club.');
      }
    }
  };

  const handleRSVPToEvent = (eventId: string) => {
    if (!currentUser) return;
    
    const newAttendee = dataService.createEventAttendee({
      eventId,
      userId: currentUser.id,
      rsvpStatus: 'ACCEPTED',
      checkedIn: false
    });
    
    if (newAttendee) {
      alert('Successfully RSVP\'d to the event!');
    }
  };

  const getStats = () => {
    const joinedClubs = myMemberships.filter(m => m.status === 'APPROVED').length;
    const pendingRequests = myMemberships.filter(m => m.status === 'PENDING').length;
    const totalEvents = myEvents.length;
    const upcomingEvents = myEvents.filter(event => new Date(event.date) > new Date()).length;
    const availableClubs = allClubs.filter(club => 
      !myMemberships.some(m => m.clubId === club.id)
    ).length;

    return {
      joinedClubs,
      pendingRequests,
      totalEvents,
      upcomingEvents,
      availableClubs
    };
  };

  const stats = getStats();

  const tabs = [
    { id: 'overview', label: 'Stats', icon: BarChart3 },
    { id: 'clubs', label: 'Join Clubs', icon: Users },
    { id: 'events', label: 'All Events', icon: Calendar },
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
            Student Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {currentUser?.fullName}. Discover clubs and events that interest you.
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
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Joined Clubs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.joinedClubs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Clubs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.availableClubs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</p>
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
          {/* Clubs */}
          {activeTab === 'clubs' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Clubs</h2>
              
              {/* My Clubs Section */}
              {myMemberships.filter(m => m.status === 'APPROVED').length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Clubs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myMemberships
                      .filter(membership => membership.status === 'APPROVED')
                      .map((membership) => {
                        const club = dataService.getClubById(membership.clubId);
                        if (!club) return null;
                        
                        return (
                          <motion.div
                            key={membership.id}
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
                                  {membership.role}
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
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Joined {new Date(membership.joinedAt).toLocaleDateString()}
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
                                onClick={() => handleLeaveClub(membership.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                              >
                                Leave Club
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              )}

                            {/* Available Clubs Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Clubs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allClubs
                    .filter(club => !myMemberships.some(m => m.clubId === club.id))
                    .map((club) => (
                      <motion.div
                        key={club.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                      >
                        <img
                          className="w-full h-48 object-cover"
                          src={club.coverImageUrl}
                          alt={club.name}
                        />
                        <div className="p-6">
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
                              onClick={() => handleJoinClub(club.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Pending Requests */}
              {myMemberships.filter(m => m.status === 'PENDING').length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Requests</h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      You have {myMemberships.filter(m => m.status === 'PENDING').length} pending club membership requests.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}



          {/* Events */}
          {activeTab === 'events' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Events</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allEvents
                  .filter(event => new Date(event.date) > new Date())
                  .map((event) => {
                    const club = dataService.getClubById(event.clubId);
                    const isMyClub = myMemberships.some(m => 
                      m.clubId === event.clubId && m.status === 'APPROVED'
                    );
                    
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
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.location}
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
                            {isMyClub && (
                              <button
                                onClick={() => handleRSVPToEvent(event.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                              >
                                RSVP
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;