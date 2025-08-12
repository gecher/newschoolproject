import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  Megaphone, 
  Award, 
  MessageSquare, 
  Plus, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  BarChart3,
  UserCheck,
  UserX
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Club, Event, Membership, Announcement, User } from '../../types';

interface TeacherDashboardProps {
  onNavigate: (page: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [pendingMemberships, setPendingMemberships] = useState<Membership[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        const currentUser = dataService.getCurrentUser();
        if (currentUser && currentUser.role === 'TEACHER') {
          // Get clubs where the teacher is an advisor
          const allClubs = await dataService.getClubs();
          const teacherClubs = allClubs.filter(club => club.advisorId === currentUser.id);
          setMyClubs(teacherClubs);

          // Get pending memberships for teacher's clubs
          const allMemberships = await dataService.getMemberships();
          const pendingMemberships = allMemberships.filter(
            membership => teacherClubs.some(club => club.id === membership.clubId) && 
                         membership.status === 'PENDING'
          );
          setPendingMemberships(pendingMemberships);

          // Get upcoming events for teacher's clubs
          const allEvents = await dataService.getEvents();
          const teacherEvents = allEvents.filter(
            event => teacherClubs.some(club => club.id === event.clubId) &&
                     new Date(event.date) > new Date()
          );
          setUpcomingEvents(teacherEvents);

          // Get recent announcements
          const allAnnouncements = await dataService.getAnnouncements();
          const clubAnnouncements = allAnnouncements.filter(
            announcement => teacherClubs.some(club => club.id === announcement.clubId)
          );
          setRecentAnnouncements(clubAnnouncements.slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading teacher data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeacherData();
  }, []);

  const handleApproveMembership = async (membershipId: string, approved: boolean) => {
    try {
      // In a real app, you would call an API to update the membership status
      setPendingMemberships(prev => 
        prev.filter(membership => membership.id !== membershipId)
      );
      alert(`Membership ${approved ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership');
    }
  };

  const stats = {
    totalClubs: myClubs.length,
    totalMembers: myClubs.reduce((sum, club) => sum + club.memberCount, 0),
    pendingApprovals: pendingMemberships.length,
    upcomingEvents: upcomingEvents.length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your clubs and student engagement</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Clubs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClubs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Clubs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">My Clubs</h3>
                <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {myClubs.map((club) => (
                    <div key={club.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{club.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          club.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {club.isApproved ? 'Active' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{club.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{club.memberCount} members</span>
                        <span>{club.category}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setSelectedClub(club)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Manage
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Megaphone className="w-4 h-4 mr-1" />
                          Announce
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Memberships */}
            {pendingMemberships.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Membership Requests</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {pendingMemberships.map((membership) => (
                      <div key={membership.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {membership.userName} wants to join {myClubs.find(c => c.id === membership.clubId)?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Requested on {new Date(membership.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveMembership(membership.id, true)}
                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveMembership(membership.id, false)}
                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500">{event.clubName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No upcoming events</p>
                  )}
                </div>
                {upcomingEvents.length > 3 && (
                  <button className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                    View all events →
                  </button>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentAnnouncements.length > 0 ? (
                    recentAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="border-l-4 border-green-500 pl-4">
                        <h4 className="text-sm font-medium text-gray-900">{announcement.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{announcement.content}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent announcements</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </button>
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Megaphone className="w-4 h-4 mr-2" />
                    Send Announcement
                  </button>
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Award className="w-4 h-4 mr-2" />
                    Award Badge
                  </button>
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
