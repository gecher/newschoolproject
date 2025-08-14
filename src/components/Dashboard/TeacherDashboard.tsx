import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  UserPlus, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
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

interface TeacherDashboardProps {
  onNavigate: (page: string, data?: any) => void;
  currentPage?: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate, currentPage = 'dashboard' }) => {
  const { currentUser } = useAuth();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myMemberships, setMyMemberships] = useState<Membership[]>([]);
  const [pendingMemberships, setPendingMemberships] = useState<Membership[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadTeacherData();
    }
  }, [currentUser]);

  const loadTeacherData = () => {
    if (currentUser) {
      setMyClubs(dataService.getClubsByAdvisor(currentUser.id));
      setMyEvents(dataService.getAllEvents().filter(event => 
        myClubs.some(club => club.id === event.clubId)
      ));
      setMyMemberships(dataService.getAllMemberships().filter(membership => 
        myClubs.some(club => club.id === membership.clubId)
      ));
      setPendingMemberships(dataService.getAllMemberships().filter(membership => 
        membership.status === 'PENDING' && myClubs.some(club => club.id === membership.clubId)
      ));
    }
  };

  const handleApproveMembership = (id: string) => {
    if (dataService.approveMembership(id)) {
      loadTeacherData();
    }
  };

  const handleRejectMembership = (id: string) => {
    if (dataService.rejectMembership(id)) {
      loadTeacherData();
    }
  };

  const getChartData = () => {
    const totalStudents = myMemberships.filter(m => m.status === 'APPROVED').length;
    const totalEvents = myEvents.length;
    const activeClubs = myClubs.filter(c => c.status === 'ACTIVE').length;
    const pendingRequests = pendingMemberships.length;

    return {
      overview: [
        { name: 'Total Students', value: totalStudents, color: '#3B82F6' },
        { name: 'Total Events', value: totalEvents, color: '#10B981' },
        { name: 'Active Clubs', value: activeClubs, color: '#F59E0B' },
        { name: 'Pending Requests', value: pendingRequests, color: '#8B5CF6' }
      ],
      monthlyData: [
        { month: 'Jan', students: Math.floor(Math.random() * 10) + 5, events: Math.floor(Math.random() * 3) + 1 },
        { month: 'Feb', students: Math.floor(Math.random() * 10) + 8, events: Math.floor(Math.random() * 3) + 2 },
        { month: 'Mar', students: Math.floor(Math.random() * 10) + 12, events: Math.floor(Math.random() * 3) + 3 },
        { month: 'Apr', students: Math.floor(Math.random() * 10) + 15, events: Math.floor(Math.random() * 3) + 4 },
        { month: 'May', students: Math.floor(Math.random() * 10) + 18, events: Math.floor(Math.random() * 3) + 5 },
        { month: 'Jun', students: Math.floor(Math.random() * 10) + 20, events: Math.floor(Math.random() * 3) + 6 }
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
              <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} name="New Students" />
              <Line type="monotone" dataKey="events" stroke="#10B981" strokeWidth={2} name="New Events" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    );
  };

  const renderAssignedClubs = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Assigned Clubs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myClubs.map((club) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{club.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    club.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    club.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {club.status}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{club.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Tag className="h-4 w-4 mr-2" />
                    {club.category}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    {club.memberCount} members
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderClubEvents = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Club Events</h2>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map((event) => (
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

                <div className="flex space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderRequests = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Membership Requests</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Club</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Request Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingMemberships.map((membership) => {
                  const student = dataService.getUserById(membership.userId);
                  const club = dataService.getClubById(membership.clubId);
                  
                  return (
                    <tr key={membership.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                              {student?.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{student?.fullName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{student?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{club?.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{club?.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(membership.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleApproveMembership(membership.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectMembership(membership.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderStats();
      case 'clubs':
        return renderAssignedClubs();
      case 'events':
        return renderClubEvents();
      case 'memberships':
        return renderRequests();
      default:
        return renderStats();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {currentUser?.fullName}. Manage your assigned clubs and activities.</p>
        </motion.div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default TeacherDashboard;
