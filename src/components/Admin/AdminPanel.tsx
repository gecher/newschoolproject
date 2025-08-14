import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Plus, Edit, Trash2, CheckCircle, XCircle, 
  Eye, UserPlus, Calendar as EventIcon, BarChart3, UserCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import dataService from '../../services/dataService';
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
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState<'club' | 'event' | 'user'>('club');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClubs(dataService.getAllClubs());
    setEvents(dataService.getAllEvents());
    setUsers(dataService.getAllUsers());
    setMemberships(dataService.getAllMemberships());
    setTeachers(dataService.getTeachers());
  };

  const handleApproveClub = (clubId: string) => {
    const updatedClub = dataService.approveClub(clubId);
    if (updatedClub) {
      loadData();
      alert('Club approved successfully!');
    }
  };

  const handleDeleteClub = (clubId: string) => {
    if (window.confirm('Are you sure you want to delete this club?')) {
      const success = dataService.deleteClub(clubId);
      if (success) {
        loadData();
        alert('Club deleted successfully!');
      }
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const success = dataService.deleteEvent(eventId);
      if (success) {
        loadData();
        alert('Event deleted successfully!');
      }
    }
  };

  const handleApproveMembership = (membershipId: string) => {
    const updatedMembership = dataService.approveMembership(membershipId);
    if (updatedMembership) {
      loadData();
      alert('Membership approved successfully!');
    }
  };

  const handleRejectMembership = (membershipId: string) => {
    const updatedMembership = dataService.rejectMembership(membershipId);
    if (updatedMembership) {
      loadData();
      alert('Membership rejected successfully!');
    }
  };

  const handleAssignAdvisor = (clubId: string, advisorId: string) => {
    const updatedClub = dataService.assignAdvisor(clubId, advisorId);
    if (updatedClub) {
      loadData();
      setShowAdvisorModal(false);
      setSelectedClub(null);
      alert('Advisor assigned successfully!');
    }
  };

  const getStats = () => {
    const totalClubs = clubs.length;
    const activeClubs = clubs.filter(club => club.status === 'ACTIVE').length;
    const pendingClubs = clubs.filter(club => club.status === 'PENDING').length;
    const totalEvents = events.length;
    const totalUsers = users.length;
    const pendingMemberships = memberships.filter(m => m.status === 'PENDING').length;

    return {
      totalClubs,
      activeClubs,
      pendingClubs,
      totalEvents,
      totalUsers,
      pendingMemberships
    };
  };

  const stats = getStats();

  // Chart Data Preparation
  const getChartData = () => {
    // Club Status Distribution
    const clubStatusData = [
      { name: 'Active', value: clubs.filter(c => c.status === 'ACTIVE').length, color: '#10B981' },
      { name: 'Pending', value: clubs.filter(c => c.status === 'PENDING').length, color: '#F59E0B' },
      { name: 'Inactive', value: clubs.filter(c => c.status === 'INACTIVE').length, color: '#EF4444' }
    ];

    // Monthly Events
    const monthlyEvents = events.reduce((acc: any, event) => {
      const month = new Date(event.date).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthlyEventsData = Object.entries(monthlyEvents).map(([month, count]) => ({
      month,
      events: count
    }));

    // User Role Distribution
    const userRoleData = [
      { name: 'Students', value: users.filter(u => u.role === 'STUDENT').length, color: '#3B82F6' },
      { name: 'Teachers', value: users.filter(u => u.role === 'TEACHER').length, color: '#8B5CF6' },
      { name: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: '#EF4444' }
    ];

    // Club Categories
    const categoryData = clubs.reduce((acc: any, club) => {
      acc[club.category] = (acc[club.category] || 0) + 1;
      return acc;
    }, {});

    const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
      category,
      clubs: count
    }));

    return {
      clubStatusData,
      monthlyEventsData,
      userRoleData,
      categoryChartData
    };
  };

  const chartData = getChartData();

  const tabs = [
    { id: 'overview', label: 'Stats', icon: BarChart3 },
    { id: 'clubs', label: 'Manage Clubs', icon: Users },
    { id: 'events', label: 'Manage Events', icon: EventIcon },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'memberships', label: 'Requests', icon: UserPlus },
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {currentUser?.fullName}. Manage your school's clubs and activities.
          </p>
        </motion.div>

                 {/* Stats Overview */}
         {activeTab === 'overview' && (
           <>
             {/* Stats Cards */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
             >
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="flex items-center">
                   <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clubs</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClubs}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="flex items-center">
                   <EventIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="flex items-center">
                   <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="flex items-center">
                   <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clubs</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeClubs}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="flex items-center">
                   <XCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Clubs</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingClubs}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="flex items-center">
                   <UserPlus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Memberships</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingMemberships}</p>
                   </div>
                 </div>
               </div>
             </motion.div>

             {/* Charts Section */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
             >
               {/* Club Status Distribution */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Club Status Distribution</h3>
                   <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                       <Pie
                         data={chartData.clubStatusData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="value"
                       >
                         {chartData.clubStatusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>

               {/* User Role Distribution */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Role Distribution</h3>
                   <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                       <Pie
                         data={chartData.userRoleData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="value"
                       >
                         {chartData.userRoleData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>

               {/* Monthly Events */}
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Events</h3>
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={chartData.monthlyEventsData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="month" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey="events" fill="#3B82F6" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>

               {/* Club Categories */}
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clubs by Category</h3>
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={chartData.categoryChartData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="category" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey="clubs" fill="#10B981" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </motion.div>
           </>
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
          {/* Clubs Management */}
          {activeTab === 'clubs' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Clubs</h2>
                <button
                  onClick={() => {
                    setModalType('club');
                    setShowCreateModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Club</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Club
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                         Members
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                         Advisor
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                         Actions
                       </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {clubs.map((club) => (
                      <tr key={club.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={club.logoUrl}
                              alt={club.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {club.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {club.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {club.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            club.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : club.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {club.status}
                          </span>
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                           {club.memberCount}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                           {(() => {
                             const advisor = dataService.getUserById(club.advisorId);
                             return advisor ? advisor.fullName : 'No Advisor';
                           })()}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => onNavigate('club-detail', { clubId: club.id })}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {club.status === 'PENDING' && (
                            <button
                              onClick={() => handleApproveClub(club.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                                                     <button
                             onClick={() => {
                               setSelectedClub(club);
                               setShowAdvisorModal(true);
                             }}
                             className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                             title="Assign Advisor"
                           >
                             <UserCheck className="h-4 w-4" />
                           </button>
                           <button
                             onClick={() => handleDeleteClub(club.id)}
                             className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Events Management */}
          {activeTab === 'events' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Events</h2>
                <button
                  onClick={() => {
                    setModalType('event');
                    setShowCreateModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Event</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Club
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {events.map((event) => {
                      const club = dataService.getClubById(event.clubId);
                      return (
                        <tr key={event.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={event.imageUrl}
                                alt={event.title}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {event.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {event.description.substring(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {club?.name || 'Unknown Club'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(event.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {event.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => onNavigate('event-detail', { eventId: event.id })}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h2>
                <button
                  onClick={() => {
                    setModalType('user');
                    setShowCreateModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
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
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profilePhoto}
                              alt={user.fullName}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.fullName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : user.role === 'TEACHER'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => onNavigate('profile', { userId: user.id })}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Memberships Management */}
          {activeTab === 'memberships' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Membership Requests</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
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

       {/* Advisor Assignment Modal */}
       {showAdvisorModal && selectedClub && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               Assign Advisor to {selectedClub.name}
             </h3>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Select Teacher
                 </label>
                 <select
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                   onChange={(e) => {
                     if (e.target.value) {
                       handleAssignAdvisor(selectedClub.id, e.target.value);
                     }
                   }}
                 >
                   <option value="">Select a teacher...</option>
                   {teachers.map((teacher) => (
                     <option key={teacher.id} value={teacher.id}>
                       {teacher.fullName}
                     </option>
                   ))}
                 </select>
               </div>
             </div>
             
             <div className="flex justify-end space-x-3 mt-6">
               <button
                 onClick={() => {
                   setShowAdvisorModal(false);
                   setSelectedClub(null);
                 }}
                 className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default AdminPanel;
