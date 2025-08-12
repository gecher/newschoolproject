import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Megaphone, 
  BarChart3, 
  Settings, 
  Plus, 
  Trash2, 
  UserCheck,
  UserX,
  Calendar,
  Award,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { dataService } from '../../services/dataService';
import { User, Club, Event, Badge, Announcement } from '../../types';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

type AdminTab = 'dashboard' | 'users' | 'clubs' | 'analytics' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: 'defaultPassword123',
    role: 'STUDENT' as const,
    isActive: true
  });

  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: '',
    isApproved: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, clubsData, eventsData, badgesData] = await Promise.all([
          dataService.getUsers(),
          dataService.getClubs(),
          dataService.getEvents(),
          dataService.getBadges()
        ]);
        
        setUsers(usersData);
        setClubs(clubsData);
        setEvents(eventsData);
        setBadges(badgesData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const reloadAll = () => {
    setUsers(dataService.getUsers());
    setClubs(dataService.getClubs());
    setEvents(dataService.getEvents());
    setBadges(dataService.getBadges());
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    totalClubs: clubs.length,
    totalEvents: events.length,
    totalBadges: badges.length,
    activeUsers: users.filter(u => u.isActive).length,
    pendingApprovals: clubs.filter(c => !c.isApproved).length,
    upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length
  };

  // Chart data
  const userRoleData = [
    { name: 'Students', value: users.filter(u => u.role === 'STUDENT').length, color: '#3B82F6' },
    { name: 'Teachers', value: users.filter(u => u.role === 'TEACHER').length, color: '#10B981' },
    { name: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: '#EF4444' }
  ];

  const clubCategoryData = clubs.reduce((acc, club) => {
    acc[club.category || 'Other'] = (acc[club.category || 'Other'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clubCategoryChartData = Object.entries(clubCategoryData).map(([category, count]) => ({
    category,
    count
  }));

  const monthlyUserGrowth = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 135 },
    { month: 'Mar', users: 150 },
    { month: 'Apr', users: 165 },
    { month: 'May', users: 180 },
    { month: 'Jun', users: 195 }
  ];

  const eventAttendanceData = events.slice(0, 5).map(event => ({
    name: event.title,
    attendees: Math.floor(Math.random() * 50) + 10
  }));

  const handleAddUser = () => {
    if (newUser.fullName && newUser.email) {
      const user = dataService.createUser(newUser);
      setUsers([...users, user]);
      setNewUser({ fullName: '', email: '', password: 'defaultPassword123', role: 'STUDENT', isActive: true });
      setShowAddUserModal(false);
    }
  };

  const handleAddClub = () => {
    if (newClub.name && newClub.description) {
      const club = dataService.createClub({
        ...newClub,
        memberCount: 0,
        advisorId: users.find(u => u.role === 'TEACHER')?.id || '',
        status: 'ACTIVE'
      });
      setClubs([...clubs, club]);
      setNewClub({ name: '', description: '', category: '', isApproved: false });
      setShowAddClubModal(false);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = dataService.updateUser(userId, { isActive: !user.isActive });
      if (updatedUser) {
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      }
    }
  };

  const handleToggleClubApproval = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    if (club) {
      const updatedClub = dataService.updateClub(clubId, { isApproved: !club.isApproved });
      if (updatedClub) {
        setClubs(clubs.map(c => c.id === clubId ? updatedClub : c));
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dataService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleDeleteClub = (clubId: string) => {
    if (window.confirm('Are you sure you want to delete this club?')) {
      dataService.deleteClub(clubId);
      setClubs(clubs.filter(c => c.id !== clubId));
    }
  };

  // Settings: JSON export/import
  const handleExportJson = () => {
    const json = dataService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-data-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportJson: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ok = dataService.importData(text);
    if (ok) {
      reloadAll();
      alert('Data imported successfully');
    } else {
      alert('Failed to import JSON');
    }
    // reset input value so same file can be selected again if needed
    e.currentTarget.value = '';
  };

  const handleResetSample = () => {
    if (!window.confirm('Reset all data to sample data? This cannot be undone.')) return;
    dataService.resetToSampleData();
    reloadAll();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your school club management system</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'clubs', label: 'Clubs', icon: Building2 },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +12% from last month
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Clubs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalClubs}</p>
                      <div className="flex items-center text-sm text-yellow-600">
                        <span>{stats.pendingApprovals} pending approval</span>
                      </div>
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
                      <div className="flex items-center text-sm text-blue-600">
                        <Activity className="w-4 h-4 mr-1" />
                        {stats.totalEvents} total events
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Badges</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBadges}</p>
                      <div className="flex items-center text-sm text-purple-600">
                        <Award className="w-4 h-4 mr-1" />
                        Available for users
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyUserGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* User Roles Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Roles Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="STUDENT">Student</option>
                  </select>
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {user.fullName.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                              user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleToggleUserStatus(user.id)}
                                className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clubs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Club Management</h3>
                <button 
                  onClick={() => setShowAddClubModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Club
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map((club) => (
                  <div key={club.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{club.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          club.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {club.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{club.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{club.memberCount} members</span>
                        <span>{club.category}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleToggleClubApproval(club.id)}
                          className={`flex-1 inline-flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium ${
                            club.isApproved 
                              ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                              : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {club.isApproved ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                          {club.isApproved ? 'Reject' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleDeleteClub(club.id)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Analytics & Reports</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Club Categories Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Club Categories</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={clubCategoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Event Attendance */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Event Attendance</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendees" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.activeUsers}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                    <div className="text-xs text-green-600 mt-1">
                      {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.totalClubs}</div>
                    <div className="text-sm text-gray-600">Active Clubs</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      {stats.pendingApprovals} pending approval
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.upcomingEvents}</div>
                    <div className="text-sm text-gray-600">Upcoming Events</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {stats.totalEvents} total events
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportJson}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Export JSON
                  </button>
                  <label className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-200">
                    Import JSON
                    <input type="file" accept="application/json" className="hidden" onChange={handleImportJson} />
                  </label>
                  <button
                    onClick={handleResetSample}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reset to Sample Data
                  </button>
                  <button
                    onClick={() => setShowDataPreview(v => !v)}
                    className="px-4 py-2 bg-white text-gray-800 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    {showDataPreview ? 'Hide' : 'Show'} All JSON
                  </button>
                </div>

                {showDataPreview && (
                  <div className="mt-4">
                    <pre className="max-h-96 overflow-auto text-xs bg-gray-50 p-4 rounded border border-gray-200">
{JSON.stringify(dataService.getAllData(), null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 text-sm">
                Changes made through the admin panel are now persisted to your browser localStorage as JSON. Use Export/Import to back up or restore.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.fullName}
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add User
                </button>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddClubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Club</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Club Name"
                value={newClub.name}
                onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                placeholder="Description"
                value={newClub.description}
                onChange={(e) => setNewClub({...newClub, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
              <input
                type="text"
                placeholder="Category"
                value={newClub.category}
                onChange={(e) => setNewClub({...newClub, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleAddClub}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Club
                </button>
                <button
                  onClick={() => setShowAddClubModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
