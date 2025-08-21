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
  const today = new Date();
  const dateDisplay = `${today.toLocaleString('en-US', { month: 'short' })} ${today.getDate()} ${today.getFullYear()}`;
  const monthAbbr = today.toLocaleString('en-US', { month: 'short' });
  const dayNum = today.getDate();
  const yearNum = today.getFullYear();
  const [clubSearch, setClubSearch] = useState('');
  const [clubCategory, setClubCategory] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadStudentData();
    }
  }, [currentUser]);

  const loadStudentData = () => {
    if (currentUser) {
      setAllClubs(dataService.getAllClubs());
      setAllEvents(dataService.getAllEvents());
      setMyMemberships(dataService.getMembershipsByUser(currentUser.id));
      
      // Get clubs that the student is not a member of
      const joinedClubIds = myMemberships.map(m => m.clubId);
      setAvailableClubs(allClubs.filter(club => !joinedClubIds.includes(club.id)));
    }
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
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chartData.overview.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4"
              style={{ borderLeftColor: item.color }}
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${item.color}20` }}>
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
    const uniqueCategories = Array.from(new Set(allClubs.map(c => c.category))).filter(Boolean).sort();
    const membershipMap = new Map(myMemberships.map(m => [m.clubId, m] as const));
    const filtered = allClubs.filter(c => {
      const matchesName = c.name.toLowerCase().includes(clubSearch.toLowerCase());
      const matchesCat = !clubCategory || c.category === clubCategory;
      return matchesName && matchesCat;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Clubs</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Search and request to join any club.</p>
        </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={clubSearch}
              onChange={e => setClubSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full sm:w-64 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 backdrop-blur text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={clubCategory}
              onChange={e => setClubCategory(e.target.value)}
              className="w-full sm:w-56 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 backdrop-blur text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
                  </div>
                </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-2xl blur-2xl" />
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/70 dark:bg-gray-900/40">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Club</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
                  {filtered.map((club) => {
                    const membership = membershipMap.get(club.id);
                    const isPending = membership?.status === 'PENDING';
                    const isApproved = membership?.status === 'APPROVED';
                    return (
                      <tr key={club.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{club.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{club.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{club.category}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{club.memberCount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            club.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            club.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>{club.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                <button
                              disabled={isPending || isApproved}
                  onClick={() => handleJoinClub(club.id)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                isApproved
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 cursor-not-allowed'
                                  : isPending
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 cursor-not-allowed'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {isApproved ? 'Joined' : isPending ? 'Requested' : 'Request to Join'}
                </button>
              </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">No clubs match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* My Memberships */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">My Memberships</h3>
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
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
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

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
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
      case 'joined':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Joined Clubs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myMemberships.filter(m => m.status === 'APPROVED').map((membership) => {
                const club = allClubs.find(c => c.id === membership.clubId);
                if (!club) return null;
                return (
                  <motion.div key={membership.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{club.name}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">APPROVED</span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Tag className="h-4 w-4 mr-2" />{club.category}</div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Users className="h-4 w-4 mr-2" />Role: {membership.role}</div>
                      </div>
                      <button onClick={() => handleLeaveClub(membership.id)} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">Leave Club</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      case 'events':
        return renderAllEvents();
      default:
        return renderStats();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-block mb-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1 rounded-full">
              <div className="bg-white dark:bg-gray-900 px-4 py-1 rounded-full">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Dashboard</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Student Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Welcome back, {currentUser?.fullName}. Discover clubs and events that interest you.</p>
        </motion.div>

        {/* Welcome Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20" />
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Welcome</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser?.fullName}</h2>
                </div>
                <div className="flex items-center">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="bg-indigo-600 text-white text-xs font-semibold tracking-wide text-center px-3 py-1">{monthAbbr}</div>
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-4 py-2 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{dayNum}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{yearNum}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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