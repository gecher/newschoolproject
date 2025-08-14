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
  UserCheck,
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

interface AdminPanelProps {
  onNavigate: (page: string, data?: any) => void;
  currentPage?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate, currentPage = 'dashboard' }) => {
  const { currentUser } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    setClubs(dataService.getAllClubs());
    setEvents(dataService.getAllEvents());
    setUsers(dataService.getAllUsers());
    setMemberships(dataService.getAllMemberships());
    setTeachers(dataService.getTeachers());
  };

  const handleDeleteClub = (id: string) => {
    if (dataService.deleteClub(id)) {
      loadAdminData();
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (dataService.deleteEvent(id)) {
      loadAdminData();
    }
  };



  const handleApproveClub = (id: string) => {
    if (dataService.approveClub(id)) {
      loadAdminData();
    }
  };

  const handleAssignAdvisor = (clubId: string, advisorId: string) => {
    if (dataService.assignAdvisor(clubId, advisorId)) {
      loadAdminData();
      setShowAdvisorModal(false);
      setSelectedClub(null);
    }
  };

  const handleApproveMembership = (id: string) => {
    if (dataService.approveMembership(id)) {
      loadAdminData();
    }
  };

  const handleRejectMembership = (id: string) => {
    if (dataService.rejectMembership(id)) {
      loadAdminData();
    }
  };

  const getChartData = () => {
    const totalUsers = users.length;
    const totalClubs = clubs.length;
    const totalEvents = events.length;
    const activeMemberships = memberships.filter(m => m.status === 'APPROVED').length;

    return {
      userStats: [
        { name: 'Students', value: users.filter(u => u.role === 'STUDENT').length, color: '#3B82F6' },
        { name: 'Teachers', value: users.filter(u => u.role === 'TEACHER').length, color: '#10B981' },
        { name: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: '#F59E0B' }
      ],
      clubStats: [
        { name: 'Active', value: clubs.filter(c => c.status === 'ACTIVE').length, color: '#10B981' },
        { name: 'Pending', value: clubs.filter(c => c.status === 'PENDING').length, color: '#F59E0B' },
        { name: 'Inactive', value: clubs.filter(c => c.status === 'INACTIVE').length, color: '#EF4444' }
      ],
      monthlyData: [
        { month: 'Jan', users: Math.floor(Math.random() * 20) + 10, clubs: Math.floor(Math.random() * 5) + 2 },
        { month: 'Feb', users: Math.floor(Math.random() * 20) + 15, clubs: Math.floor(Math.random() * 5) + 3 },
        { month: 'Mar', users: Math.floor(Math.random() * 20) + 20, clubs: Math.floor(Math.random() * 5) + 4 },
        { month: 'Apr', users: Math.floor(Math.random() * 20) + 25, clubs: Math.floor(Math.random() * 5) + 5 },
        { month: 'May', users: Math.floor(Math.random() * 20) + 30, clubs: Math.floor(Math.random() * 5) + 6 },
        { month: 'Jun', users: Math.floor(Math.random() * 20) + 35, clubs: Math.floor(Math.random() * 5) + 7 }
      ],
      overview: [
        { name: 'Total Users', value: totalUsers, color: '#3B82F6' },
        { name: 'Total Clubs', value: totalClubs, color: '#10B981' },
        { name: 'Total Events', value: totalEvents, color: '#F59E0B' },
        { name: 'Active Memberships', value: activeMemberships, color: '#8B5CF6' }
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.userStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.userStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Club Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Club Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.clubStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.clubStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Monthly Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="New Users" />
                <Line type="monotone" dataKey="clubs" stroke="#10B981" strokeWidth={2} name="New Clubs" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderManageClubs = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Clubs</h2>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add Club</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Club</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Advisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                            {club.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{club.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{club.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {club.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        club.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        club.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {club.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {club.advisorId ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {users.find(u => u.id === club.advisorId)?.fullName || 'Unknown'}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedClub(club);
                            setShowAdvisorModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                          Assign Advisor
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {memberships.filter(m => m.clubId === club.id && m.status === 'APPROVED').length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {club.status === 'PENDING' && (
                        <button
                          onClick={() => handleApproveClub(club.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClub(club.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderManageEvents = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Events</h2>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                     Active
                   </span>
                 </div>
                
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
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  >
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

  const renderAllUsers = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Users</h2>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                                                 <div className="ml-4">
                           <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                           <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        <Edit className="h-5 w-5" />
                      </button>
                                             <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                         <Trash2 className="h-5 w-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                {memberships.filter(m => m.status === 'PENDING').map((membership) => {
                  const student = users.find(u => u.id === membership.userId);
                  const club = clubs.find(c => c.id === membership.clubId);
                  
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
        return renderManageClubs();
      case 'events':
        return renderManageEvents();
      case 'users':
        return renderAllUsers();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {currentUser?.fullName}. Manage your school's clubs and activities.</p>
        </motion.div>

        {/* Content */}
        {renderContent()}

        {/* Advisor Assignment Modal */}
        {showAdvisorModal && selectedClub && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Assign Advisor to {selectedClub.name}
                </h3>
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <button
                      key={teacher.id}
                      onClick={() => handleAssignAdvisor(selectedClub.id, teacher.id)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{teacher.fullName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{teacher.email}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAdvisorModal(false);
                      setSelectedClub(null);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
