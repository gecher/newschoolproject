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
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersModalClub, setMembersModalClub] = useState<Club | null>(null);
  const defaultAvatar = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=96&h=96&fit=crop&crop=face';
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(null);

  // Club edit modal
  const [showClubModal, setShowClubModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [clubForm, setClubForm] = useState({ name: '', description: '', category: '' });

  // Event create/edit modal
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

  useEffect(() => {
    if (currentUser) {
      loadTeacherData();
    }
  }, [currentUser]);

  const loadTeacherData = () => {
    if (currentUser) {
      setMyClubs(dataService.getClubsByAdvisor(currentUser.id));
      const advisorClubs = dataService.getClubsByAdvisor(currentUser.id);
      setMyEvents(dataService.getAllEvents().filter(event => 
        advisorClubs.some(club => club.id === event.clubId)
      ));
      setMyMemberships(dataService.getAllMemberships().filter(membership => 
        advisorClubs.some(club => club.id === membership.clubId)
      ));
      setPendingMemberships(dataService.getAllMemberships().filter(membership => 
        membership.status === 'PENDING' && advisorClubs.some(club => club.id === membership.clubId)
      ));
    }
  };

  const handleApproveMembership = (id: string) => {
    if (dataService.approveMembership(id)) {
      loadTeacherData();
    }
  };

  // Club editing
  const openEditClub = (club: Club) => {
    setEditingClub(club);
    setClubForm({ name: club.name, description: club.description, category: club.category });
    setShowClubModal(true);
  };

  const saveClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;
    dataService.updateClub(editingClub.id, {
      name: clubForm.name,
      description: clubForm.description,
      category: clubForm.category
    });
    setShowClubModal(false);
    setEditingClub(null);
    loadTeacherData();
  };

  // Event CRUD
  const openAddEvent = () => {
    const defaultClubId = myClubs[0]?.id || '';
    setEditingEvent(null);
    setEventForm({ title: '', clubId: defaultClubId, description: '', location: '', date: '', rsvpLimit: '' });
    setShowEventModal(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    const dt = new Date(event.date);
    const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEventForm({
      title: event.title,
      clubId: event.clubId,
      description: event.description || '',
      location: event.location || '',
      date: isoLocal,
      rsvpLimit: event.rsvpLimit ?? ''
    });
    setShowEventModal(true);
  };

  const saveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.clubId) return;
    const iso = eventForm.date ? new Date(eventForm.date as string).toISOString() : new Date().toISOString();
    const rsvp = eventForm.rsvpLimit === '' ? 0 : Number(eventForm.rsvpLimit);
    if (editingEvent) {
      dataService.updateEvent(editingEvent.id, {
        title: eventForm.title,
        clubId: eventForm.clubId,
        description: eventForm.description || undefined,
        location: eventForm.location || undefined,
        date: iso,
        rsvpLimit: rsvp
      });
    } else {
      dataService.createEvent({
        title: eventForm.title,
        clubId: eventForm.clubId,
        description: eventForm.description || undefined,
        location: eventForm.location || undefined,
        date: iso,
        imageUrl: '',
        rsvpLimit: rsvp
      });
    }
    setShowEventModal(false);
    setEditingEvent(null);
    loadTeacherData();
  };

  const handleDeleteEvent = (id: string) => {
    setConfirmMessage('Are you sure you want to delete this event? This action cannot be undone.');
    setOnConfirmAction(() => () => {
      if (dataService.deleteEvent(id)) {
        loadTeacherData();
      }
    });
    setShowConfirmModal(true);
  };

  const handleRejectMembership = (id: string) => {
    if (dataService.rejectMembership(id)) {
      loadTeacherData();
    }
  };

  const openMembersModal = (club: Club) => {
    setMembersModalClub(club);
    setShowMembersModal(true);
  };

  const handleChangeRole = (membershipId: string, role: Membership['role']) => {
    if (dataService.updateMembership(membershipId, { role })) {
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
                  <button onClick={() => openEditClub(club)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => openMembersModal(club)} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
                    Manage Members
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
          <button onClick={openAddEvent} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
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
                  <button onClick={() => openEditEvent(event)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteEvent(event.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
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

        {/* Club Modal */}
        {showClubModal && editingClub && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Club</h3>
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

        {/* Members Role Management Modal */}
        {showMembersModal && membersModalClub && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Members – {membersModalClub.name}</h3>
                <button
                  onClick={() => { setShowMembersModal(false); setMembersModalClub(null); }}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dataService.getAllMemberships()
                  .filter(m => m.clubId === membersModalClub.id && m.status === 'APPROVED')
                  .map(m => {
                    const u = dataService.getUserById(m.userId);
                    if (!u) return null;
                    return (
                      <div key={m.id} className="flex items-center space-x-3 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <img
                          src={(u as any).profilePhoto || defaultAvatar}
                          alt={u.fullName}
                          className="h-9 w-9 rounded-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatar; }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{u.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                        </div>
                        <select
                          value={m.role}
                          onChange={(e) => handleChangeRole(m.id, e.target.value as Membership['role'])}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                        >
                          <option value="PRESIDENT">PRESIDENT</option>
                          <option value="VICE_PRESIDENT">VICE_PRESIDENT</option>
                          <option value="SECRETARY">SECRETARY</option>
                          <option value="CAPTAIN">CAPTAIN</option>
                          <option value="MEMBER">MEMBER</option>
                        </select>
                      </div>
                    );
                  })}
                {dataService.getAllMemberships().filter(m => m.clubId === membersModalClub.id && m.status === 'APPROVED').length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No approved members yet.</div>
                )}
              </div>
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
                    {myClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
      </div>
    </div>
  );
};

export default TeacherDashboard;
