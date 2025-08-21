import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import type { Club, Event, User, Membership } from '../../services/dataService';
import { 
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

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate: _onNavigate, currentPage = 'dashboard' }) => {
  const { currentUser } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersModalClub, setMembersModalClub] = useState<Club | null>(null);

  const defaultAvatar = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=96&h=96&fit=crop&crop=face';
  const defaultClubImage = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=80&h=80&fit=crop';
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(null);

  // Table search/sort state
  const [clubsSearch, setClubsSearch] = useState('');
  const [clubsSort, setClubsSort] = useState<{ key: 'name' | 'category' | 'status' | 'members' | 'advisor'; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });
  const [usersSearch, setUsersSearch] = useState('');
  const [usersSort, setUsersSort] = useState<{ key: 'name' | 'role' | 'email'; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });
  const [requestsSearch, setRequestsSearch] = useState('');
  const [requestsSort, setRequestsSort] = useState<{ key: 'student' | 'club' | 'date' | 'status'; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'desc' });

  // Club modal state
  const [showClubModal, setShowClubModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    category: ''
  });

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    clubId: '',
    description: '',
    location: '',
    date: '',
    rsvpLimit: '' as string | number
  });

  // User modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT' as User['role'],
    phone: ''
  });

  useEffect(() => {
    loadAdminData();
  }, []);
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const loadAdminData = () => {
    setClubs(dataService.getAllClubs());
    setEvents(dataService.getAllEvents());
    setUsers(dataService.getAllUsers());
    setMemberships(dataService.getAllMemberships());
    setTeachers(dataService.getTeachers());
  };

  const handleDeleteClub = (id: string) => {
    setConfirmMessage('Deleting a club will also remove its events and memberships. Continue?');
    setOnConfirmAction(() => () => {
    if (dataService.deleteClub(id)) {
      loadAdminData();
    }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteEvent = (id: string) => {
    setConfirmMessage('Are you sure you want to delete this event? This action cannot be undone.');
    setOnConfirmAction(() => () => {
    if (dataService.deleteEvent(id)) {
      loadAdminData();
    }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteUser = (id: string) => {
    setConfirmMessage('Deleting a user will remove their memberships and event attendance. Continue?');
    setOnConfirmAction(() => () => {
      if (dataService.deleteUser(id)) {
        loadAdminData();
      }
    });
    setShowConfirmModal(true);
  };

  const openAddClub = () => {
    setEditingClub(null);
    setClubForm({ name: '', description: '', category: '' });
    setShowClubModal(true);
  };

  const openEditClub = (club: Club) => {
    setEditingClub(club);
    setClubForm({ name: club.name, description: club.description, category: club.category });
    setShowClubModal(true);
  };

  const saveClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubForm.name) return;
    if (editingClub) {
      dataService.updateClub(editingClub.id, {
        name: clubForm.name,
        description: clubForm.description,
        category: clubForm.category
      });
    } else {
      dataService.createClub({
        name: clubForm.name,
        description: clubForm.description,
        logoUrl: '',
        coverImageUrl: '',
        category: clubForm.category,
        status: 'PENDING',
        advisorId: '',
        isApproved: false,
        memberCount: 0,
        documents: [],
        gallery: []
      });
    }
    setShowClubModal(false);
    setEditingClub(null);
    loadAdminData();
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', clubId: clubs[0]?.id || '', description: '', location: '', date: '', rsvpLimit: '' });
    setShowEventModal(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    const dt = new Date(event.date);
    const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEventForm({
      title: event.title,
      clubId: event.clubId,
      description: event.description,
      location: event.location,
      date: isoLocal,
      rsvpLimit: event.rsvpLimit ?? ''
    });
    setShowEventModal(true);
  };

  const saveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.clubId) return;
    const rsvp = eventForm.rsvpLimit === '' ? 0 : Number(eventForm.rsvpLimit);
    const iso = eventForm.date ? new Date(eventForm.date as string).toISOString() : new Date().toISOString();
    if (editingEvent) {
      dataService.updateEvent(editingEvent.id, {
        title: eventForm.title,
        clubId: eventForm.clubId,
        description: eventForm.description,
        location: eventForm.location,
        date: iso,
        imageUrl: editingEvent.imageUrl || '',
        rsvpLimit: rsvp
      });
    } else {
      dataService.createEvent({
        title: eventForm.title,
        clubId: eventForm.clubId,
        description: eventForm.description,
        location: eventForm.location,
        date: iso,
        imageUrl: '',
        rsvpLimit: rsvp
      });
    }
    setShowEventModal(false);
    setEditingEvent(null);
    loadAdminData();
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ fullName: '', email: '', password: '', role: 'STUDENT', phone: '' });
    setShowUserModal(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ fullName: user.fullName, email: user.email, password: user.password, role: user.role, phone: user.phone || '' });
    setShowUserModal(true);
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName || !userForm.email || !userForm.password) return;
    if (editingUser) {
      dataService.updateUser(editingUser.id, {
        fullName: userForm.fullName,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        phone: userForm.phone
      });
    } else {
      dataService.createUser({
        fullName: userForm.fullName,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        phone: userForm.phone,
        profilePhoto: '',
        coverPhoto: '',
        bio: '',
        isActive: true
      });
    }
    setShowUserModal(false);
    setEditingUser(null);
    loadAdminData();
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

    // Filter out zero values and ensure at least one category exists
    const userStats = [
      { name: 'Students', value: users.filter(u => u.role === 'STUDENT').length, color: '#3B82F6' },
      { name: 'Teachers', value: users.filter(u => u.role === 'TEACHER').length, color: '#10B981' },
      { name: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: '#F59E0B' }
    ].filter(stat => stat.value > 0);

    const clubStats = [
      { name: 'Active', value: clubs.filter(c => c.status === 'ACTIVE').length, color: '#10B981' },
      { name: 'Pending', value: clubs.filter(c => c.status === 'PENDING').length, color: '#F59E0B' },
      { name: 'Inactive', value: clubs.filter(c => c.status === 'INACTIVE').length, color: '#EF4444' }
    ].filter(stat => stat.value > 0);

    // If all values are 0, show a default message
    if (clubStats.length === 0) {
      clubStats.push({ name: 'No Data', value: 1, color: '#9CA3AF' });
    }
    if (userStats.length === 0) {
      userStats.push({ name: 'No Data', value: 1, color: '#9CA3AF' });
    }

    return {
      userStats,
      clubStats,
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
                  label={({ name, percent, value }) => {
                    if (value === 0) return `${name} 0%`;
                    return `${name} ${((percent || 0) * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  labelStyle={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    fill: '#1f2937',
                    textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white'
                  }}
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
                  label={({ name, percent, value }) => {
                    if (value === 0) return `${name} 0%`;
                    return `${name} ${((percent || 0) * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  labelStyle={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    fill: '#1f2937',
                    textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white'
                  }}
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
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    color: '#1f2937',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                />
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
    // derive filtered and sorted clubs
    const rows = clubs.map((club) => {
      const advisorName = club.advisorId ? (users.find(u => u.id === club.advisorId)?.fullName || 'Unknown') : '';
      const membersCount = memberships.filter(m => m.clubId === club.id && m.status === 'APPROVED').length;
      return { club, advisorName, membersCount };
    })
    .filter(({ club, advisorName }) => {
      const q = clubsSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        club.name.toLowerCase().includes(q) ||
        (club.category || '').toLowerCase().includes(q) ||
        (club.status || '').toLowerCase().includes(q) ||
        advisorName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dir = clubsSort.dir === 'asc' ? 1 : -1;
      switch (clubsSort.key) {
        case 'name':
          return a.club.name.localeCompare(b.club.name) * dir;
        case 'category':
          return (a.club.category || '').localeCompare(b.club.category || '') * dir;
        case 'status':
          return (a.club.status || '').localeCompare(b.club.status || '') * dir;
        case 'members':
          return (a.membersCount - b.membersCount) * dir;
        case 'advisor':
          return a.advisorName.localeCompare(b.advisorName) * dir;
      }
    });

    const setSort = (key: 'name' | 'category' | 'status' | 'members' | 'advisor') => {
      setClubsSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Clubs</h2>
          <button onClick={openAddClub} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add Club</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between">
          <input
            value={clubsSearch}
            onChange={(e) => setClubsSearch(e.target.value)}
            placeholder="Search by name, category, status, advisor..."
            className="w-full md:w-96 border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th onClick={() => setSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Club {clubsSort.key==='name' ? (clubsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('category')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Category {clubsSort.key==='category' ? (clubsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Status {clubsSort.key==='status' ? (clubsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('advisor')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Advisor {clubsSort.key==='advisor' ? (clubsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('members')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Members {clubsSort.key==='members' ? (clubsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {rows.map(({ club, advisorName, membersCount }) => (
                  <tr key={club.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={club.logoUrl || club.coverImageUrl || defaultClubImage}
                          alt={club.name}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultClubImage; }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{club.name}</div>
                          <button
                            onClick={() => openEditClub(club)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                          >
                            View Description
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {club.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-semibold ${
                        club.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 shadow-sm' :
                        club.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 shadow-sm' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 shadow-sm'
                      }`}>
                        {club.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {club.advisorId ? (
                        <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {advisorName}
                        </span>
                          <button
                            onClick={() => {
                              setSelectedClub(club);
                              setShowAdvisorModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-medium"
                          >
                            Change
                          </button>
                        </div>
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
                      <button
                        onClick={() => { setMembersModalClub(club); setShowMembersModal(true); }}
                        className="underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                        title="View Members"
                      >
                      {membersCount}
                      </button>
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
                      <button onClick={() => openEditClub(club)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
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
          <button onClick={openAddEvent} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
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
                  <button onClick={() => openEditEvent(event)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
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
    // filter and sort users
    const q = usersSearch.trim().toLowerCase();
    const filtered = users.filter(u => {
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      const dir = usersSort.dir === 'asc' ? 1 : -1;
      switch (usersSort.key) {
        case 'name': return a.fullName.localeCompare(b.fullName) * dir;
        case 'email': return a.email.localeCompare(b.email) * dir;
        case 'role': return (a.role || '').localeCompare(b.role || '') * dir;
      }
    });

    const setSort = (key: 'name' | 'role' | 'email') => {
      setUsersSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Users</h2>
          <button onClick={openAddUser} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between">
          <input
            value={usersSearch}
            onChange={(e) => setUsersSearch(e.target.value)}
            placeholder="Search by name, email, role..."
            className="w-full md:w-96 border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th onClick={() => setSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">User {usersSort.key==='name' ? (usersSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('role')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Role {usersSort.key==='role' ? (usersSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('email')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Email {usersSort.key==='email' ? (usersSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={user.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatar; }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                           <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                           <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-semibold ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 shadow-sm' :
                        user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-sm' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 shadow-sm'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 shadow-sm">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => openEditUser(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
    const reqs = memberships.filter(m => m.status === 'PENDING').map(m => {
      const student = users.find(u => u.id === m.userId);
      const club = clubs.find(c => c.id === m.clubId);
      return { m, student, club };
    }).filter(({ student, club }) => {
      const q = requestsSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        (student?.fullName || '').toLowerCase().includes(q) ||
        (student?.email || '').toLowerCase().includes(q) ||
        (club?.name || '').toLowerCase().includes(q) ||
        (club?.category || '').toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      const dir = requestsSort.dir === 'asc' ? 1 : -1;
      switch (requestsSort.key) {
        case 'student': return (a.student?.fullName || '').localeCompare(b.student?.fullName || '') * dir;
        case 'club': return (a.club?.name || '').localeCompare(b.club?.name || '') * dir;
        case 'status': return 'PENDING'.localeCompare('PENDING') * dir; // same status
        case 'date': return (new Date(a.m.startDate).getTime() - new Date(b.m.startDate).getTime()) * dir;
      }
    });

    const setSort = (key: 'student' | 'club' | 'date' | 'status') => {
      setRequestsSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Membership Requests</h2>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between">
          <input
            value={requestsSearch}
            onChange={(e) => setRequestsSearch(e.target.value)}
            placeholder="Search by student, email, club, category..."
            className="w-full md:w-96 border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th onClick={() => setSort('student')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Student {requestsSort.key==='student' ? (requestsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('club')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Club {requestsSort.key==='club' ? (requestsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Request Date {requestsSort.key==='date' ? (requestsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th onClick={() => setSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Status {requestsSort.key==='status' ? (requestsSort.dir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reqs.map(({ m: membership, student, club }) => (
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
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 shadow-sm">
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
                  ))}
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
                <p className="text-indigo-100">Oversee and elevate all student activities and communities.</p>
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

        {/* Members Modal */}
        {showMembersModal && membersModalClub && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Members of {membersModalClub.name}</h3>
                <button onClick={() => { setShowMembersModal(false); setMembersModalClub(null); }} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {memberships
                  .filter(m => m.clubId === membersModalClub.id && m.status === 'APPROVED')
                  .map(m => {
                    const member = users.find(u => u.id === m.userId);
                    if (!member) return null;
                    return (
                      <div key={m.id} className="flex items-center space-x-3 p-2 rounded border border-gray-200 dark:border-gray-700">
                        <img
                          src={member.profilePhoto || defaultAvatar}
                          alt={member.fullName}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatar; }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{member.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{m.role}</span>
                      </div>
                    );
                  })}
                {memberships.filter(m => m.clubId === membersModalClub.id && m.status === 'APPROVED').length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No approved members</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Confirm Delete</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{confirmMessage}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setOnConfirmAction(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onConfirmAction) onConfirmAction();
                    setShowConfirmModal(false);
                    setOnConfirmAction(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Club Modal */}
        {showClubModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{editingClub ? 'Edit Club' : 'Add Club'}</h3>
              <form onSubmit={saveClub} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Name</label>
                  <input value={clubForm.name} onChange={e => setClubForm({ ...clubForm, name: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={clubForm.description} onChange={e => setClubForm({ ...clubForm, description: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Category</label>
                  <select value={clubForm.category} onChange={e => setClubForm({ ...clubForm, category: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select a category</option>
                    <option value="Technology">Technology</option>
                    <option value="Arts">Arts</option>
                    <option value="Academic">Academic</option>
                    <option value="Sports">Sports</option>
                    <option value="Community Service">Community Service</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => { setShowClubModal(false); setEditingClub(null); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
              <form onSubmit={saveEvent} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
                  <input value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Club</label>
                  <select value={eventForm.clubId} onChange={e => setEventForm({ ...eventForm, clubId: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Location</label>
                    <input value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Date</label>
                    <input type="datetime-local" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">RSVP Limit</label>
                  <input type="number" min="0" value={eventForm.rsvpLimit} onChange={e => setEventForm({ ...eventForm, rsvpLimit: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <form onSubmit={saveUser} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
                  <input value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Password</label>
                    <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Role</label>
                    <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as User['role'] })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <option value="ADMIN">ADMIN</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="STUDENT">STUDENT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Phone</label>
                    <input value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
