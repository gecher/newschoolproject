import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MapPin,
  Tag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import type { Club, Event, User, Membership } from '../../services/dataService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface StudentDashboardProps {
  onNavigate: (page: string, data?: any) => void;
  currentPage?: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, currentPage = 'dashboard' }) => {
  const { currentUser } = useAuth();
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [myMemberships, setMyMemberships] = useState<Membership[]>([]);
  const [availableClubs, setAvailableClubs] = useState<Club[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [clubsSearch, setClubsSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [advisorFilter, setAdvisorFilter] = useState<string>('');
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    if (currentUser) {
      loadStudentData();
    }
  }, [currentUser]);

  const loadStudentData = () => {
    if (!currentUser) return;
    const clubs = dataService.getAllClubs();
    const events = dataService.getAllEvents();
    const memberships = dataService.getMembershipsByUser(currentUser.id);
    const users = dataService.getAllUsers();

    const joinedClubIds = memberships.map(m => m.clubId);
    const available = clubs.filter(club => !joinedClubIds.includes(club.id));

    setAllClubs(clubs);
    setAllEvents(events);
    setMyMemberships(memberships);
    setAvailableClubs(available);
    setAllUsers(users);
  };

  const handleJoinClub = (clubId: string) => {
    if (currentUser) {
      const newMembership = dataService.createMembership({
        userId: currentUser.id,
        clubId,
        role: 'MEMBER',
        status: 'PENDING',
        gradeId: 'grade-1' // Default grade
      });
      
      if (newMembership) {
        loadStudentData();
      }
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMembershipId, setConfirmMembershipId] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const handleLeaveClub = (membershipId: string) => {
    setConfirmMembershipId(membershipId);
    setConfirmMessage('Are you sure you want to leave this club?');
    setShowConfirmModal(true);
  };

  const getChartData = () => {
    const totalJoinedClubs = myMemberships.filter(m => m.status === 'APPROVED').length;
    const totalEvents = allEvents.length;
    const pendingRequests = myMemberships.filter(m => m.status === 'PENDING').length;
    const totalAvailableClubs = availableClubs.length;

    return {
      overview: [
        { name: 'Joined Clubs', value: totalJoinedClubs, color: '#3B82F6' },
        { name: 'Total Events', value: totalEvents, color: '#10B981' },
        { name: 'Pending Requests', value: pendingRequests, color: '#F59E0B' },
        { name: 'Available Clubs', value: totalAvailableClubs, color: '#8B5CF6' }
      ],
      monthlyData: [
        { month: 'Jan', clubs: Math.floor(Math.random() * 3) + 1, events: Math.floor(Math.random() * 5) + 2 },
        { month: 'Feb', clubs: Math.floor(Math.random() * 3) + 2, events: Math.floor(Math.random() * 5) + 3 },
        { month: 'Mar', clubs: Math.floor(Math.random() * 3) + 3, events: Math.floor(Math.random() * 5) + 4 },
        { month: 'Apr', clubs: Math.floor(Math.random() * 3) + 4, events: Math.floor(Math.random() * 5) + 5 },
        { month: 'May', clubs: Math.floor(Math.random() * 3) + 5, events: Math.floor(Math.random() * 5) + 6 },
        { month: 'Jun', clubs: Math.floor(Math.random() * 3) + 6, events: Math.floor(Math.random() * 5) + 7 }
      ]
    };
  };

  const renderStats = () => {
    const chartData = getChartData();
    
    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overview</h3>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chartData.overview.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 ring-1 ring-gray-100 dark:ring-gray-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ borderLeftColor: item.color }}
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full shadow-inner" style={{ backgroundColor: `${item.color}20` }}>
                  <BarChart3 className="h-6 w-6" style={{ color: item.color }} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Monthly Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="clubs" stroke="#3B82F6" strokeWidth={2} name="Joined Clubs" />
              <Line type="monotone" dataKey="events" stroke="#10B981" strokeWidth={2} name="Events Attended" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    );
  };

  const renderJoinClubs = () => {
    const advisorNameById = (advisorId?: string) => {
      if (!advisorId) return '';
      const u = allUsers.find(u => u.id === advisorId);
      return u ? u.fullName : '';
    };
    const myMembershipByClub: Record<string, Membership | undefined> = myMemberships.reduce((acc, m) => { acc[m.clubId] = m; return acc; }, {} as Record<string, Membership | undefined>);
    const categories = Array.from(new Set(allClubs.map(c => c.category).filter(Boolean)));
    const advisors = Array.from(new Set(allClubs.map(c => c.advisorId).filter(Boolean))) as string[];

    const filtered = allClubs.filter((club) => {
      const q = clubsSearch.trim().toLowerCase();
      const matchesQuery = !q || club.name.toLowerCase().includes(q) || (club.description || '').toLowerCase().includes(q) || (club.category || '').toLowerCase().includes(q) || advisorNameById(club.advisorId).toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || club.category === categoryFilter;
      const matchesAdvisor = !advisorFilter || club.advisorId === advisorFilter;
      return matchesQuery && matchesCategory && matchesAdvisor;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Clubs</h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={clubsSearch}
            onChange={(e) => setClubsSearch(e.target.value)}
            placeholder="Search by name, category, advisor..."
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={advisorFilter}
            onChange={(e) => setAdvisorFilter(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Advisors</option>
            {advisors.map(id => (
              <option key={id} value={id}>{advisorNameById(id)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((club) => {
            const my = myMembershipByClub[club.id];
            const isApproved = my?.status === 'APPROVED';
            const isPending = my?.status === 'PENDING';
            return (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{club.name}</h3>
                  <div className="flex items-center space-x-2">
                    {isApproved && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Joined</span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      club.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      club.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {club.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{club.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Tag className="h-4 w-4 mr-2" />
                    {club.category}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    Advisor: {advisorNameById(club.advisorId) || 'Unassigned'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    {club.memberCount} members
                  </div>
                </div>

                <button
                  onClick={() => handleJoinClub(club.id)}
                  disabled={isApproved || isPending}
                  className={`w-full py-2 px-4 rounded-lg transition-colors mt-auto ${
                    isApproved ? 'bg-green-600 text-white cursor-not-allowed opacity-90' :
                    isPending ? 'bg-yellow-500 text-white cursor-not-allowed opacity-90' :
                    'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isApproved ? 'Joined' : isPending ? 'Request Sent' : 'Request to Join'}
                </button>
              </div>
            </motion.div>
            );
          })}
        </div>

        {/* My Memberships moved to dedicated page */}
      </div>
    );
  };

  const renderMyMemberships = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Memberships</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myMemberships.map((membership) => {
            const club = allClubs.find(c => c.id === membership.clubId);
            if (!club) return null;

            return (
              <motion.div
                key={membership.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{club.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      membership.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      membership.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {membership.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Tag className="h-4 w-4 mr-2" />
                      {club.category}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      Role: {membership.role}
                    </div>
                  </div>

                  {membership.status === 'APPROVED' && (
                    <button
                      onClick={() => handleLeaveClub(membership.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Leave Club
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAllEvents = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Events</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full"
            >
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{event.title}</h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location || 'No location'}
                  </div>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors mt-auto">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderStats();
      case 'clubs':
        return renderJoinClubs();
      case 'events':
        return renderAllEvents();
      case 'memberships':
        return renderMyMemberships();
      default:
        return renderStats();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Student Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {currentUser?.fullName}. Discover clubs and events that interest you.</p>
        </motion.div>

        {/* Welcome Card - only on Dashboard page */}
        {currentPage === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Welcome to The Student Club</h2>
                <p className="text-indigo-100">Empowering you to discover and join amazing communities.</p>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/10 rounded-xl">
                <Calendar className="h-5 w-5 mr-2 text-white" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {renderContent()}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Confirm</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{confirmMessage}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmMembershipId(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmMembershipId) {
                      if (dataService.deleteMembership(confirmMembershipId)) {
                        loadStudentData();
                      }
                    }
                    setShowConfirmModal(false);
                    setConfirmMembershipId(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Leave Club
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;