import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Award, TrendingUp, Clock, 
  MapPin, Star, ChevronRight, Bell, BookOpen 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { Club, Event, Membership, UserBadge, Badge, Notification } from '../../types';

interface StudentDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (currentUser) {
      // Load user's memberships
      const userMemberships = dataService.getMembershipsByUser(currentUser.id);
      setMemberships(userMemberships);

      // Load clubs user is member of
      const userClubs = userMemberships.map(membership => 
        dataService.getClubById(membership.clubId)
      ).filter(Boolean) as Club[];
      setClubs(userClubs);

      // Load upcoming events from user's clubs
      const events = userClubs.flatMap(club => 
        dataService.getEventsByClub(club.id)
      ).filter(event => new Date(event.date) > new Date())
       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
       .slice(0, 5);
      setUpcomingEvents(events);

      // Load user badges
      const userBadgesList = dataService.getUserBadges(currentUser.id);
      setUserBadges(userBadgesList);

      // Load all badges for display
      const allBadges = dataService.getBadges();
      setBadges(allBadges);

      // Load notifications
      const userNotifications = dataService.getUserNotifications(currentUser.id)
        .slice(0, 5);
      setNotifications(userNotifications);
    }
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClubById = (clubId: string) => {
    return clubs.find(club => club.id === clubId);
  };

  const getBadgeById = (badgeId: string) => {
    return badges.find(badge => badge.id === badgeId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {currentUser?.fullName}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's what's happening with your clubs and activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Clubs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{clubs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Events</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Badges Earned</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{userBadges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">High</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Clubs */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Clubs</h2>
                <button
                  onClick={() => onNavigate('clubs')}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium flex items-center"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {clubs.length > 0 ? (
                <div className="space-y-4">
                  {clubs.slice(0, 3).map((club) => {
                    const membership = memberships.find(m => m.clubId === club.id);
                    return (
                      <div
                        key={club.id}
                        className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => onNavigate('club-detail', { clubId: club.id })}
                      >
                        <img
                          src={club.logoUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=50&h=50&fit=crop'}
                          alt={club.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{club.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{club.category}</p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              membership?.role === 'PRESIDENT' 
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                : membership?.role === 'CAPTAIN'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                            }`}>
                              {membership?.role}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't joined any clubs yet</p>
                  <button
                    onClick={() => onNavigate('clubs')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Explore Clubs
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
                <button
                  onClick={() => onNavigate('events')}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium flex items-center"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const club = getClubById(event.clubId);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => onNavigate('event-detail', { eventId: event.id })}
                      >
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                          <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{club?.name}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(event.date)}
                            {event.location && (
                              <>
                                <MapPin className="h-3 w-3 ml-3 mr-1" />
                                {event.location}
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Badges */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Badges</h2>
            </div>
            <div className="p-6">
              {userBadges.length > 0 ? (
                <div className="space-y-3">
                  {userBadges.slice(0, 3).map((userBadge) => {
                    const badge = getBadgeById(userBadge.badgeId);
                    return (
                      <div key={userBadge.id} className="flex items-center">
                        <img
                          src={badge?.iconUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=40&h=40&fit=crop'}
                          alt={badge?.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{badge?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{badge?.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No badges earned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <div className="p-6">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start">
                      <div className={`p-1 rounded-full ${notification.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900'}`}>
                        <Bell className={`h-4 w-4 ${notification.isRead ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => onNavigate('clubs')}
                className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Browse Clubs</span>
              </button>
              <button
                onClick={() => onNavigate('events')}
                className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">View Events</span>
              </button>
              <button
                onClick={() => onNavigate('forums')}
                className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Join Discussions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;