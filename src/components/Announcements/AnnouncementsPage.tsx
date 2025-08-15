import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, Edit, Trash2, Search, 
  Filter, Calendar, Users, Globe, XCircle,
  ChevronRight, Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { Announcement, Club } from '../../types';

interface AnnouncementsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    target: 'GLOBAL' as 'GLOBAL' | 'CLUB',
    clubId: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchQuery, selectedTarget]);

  const loadData = async () => {
    try {
      const allAnnouncements = dataService.getAnnouncements();
      const allClubs = dataService.getClubs();
      setAnnouncements(allAnnouncements);
      setClubs(allClubs);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by target
    if (selectedTarget !== 'all') {
      filtered = filtered.filter(announcement => announcement.target === selectedTarget);
    }

    setFilteredAnnouncements(filtered);
  };

  const canCreateAnnouncement = () => {
    return currentUser?.role === 'ADMIN';
  };

  const canEditAnnouncement = (announcement: Announcement) => {
    return currentUser?.role === 'ADMIN' || 
           (currentUser?.role === 'TEACHER' && announcement.createdBy === currentUser.id);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.content) return;

    const newAnnouncement = dataService.createAnnouncement({
      title: createForm.title,
      content: createForm.content,
      target: createForm.target,
      clubId: createForm.target === 'CLUB' ? createForm.clubId : undefined,
      imageUrl: createForm.imageUrl || undefined,
      createdBy: currentUser!.id
    });

    setAnnouncements([...announcements, newAnnouncement]);
    setShowCreateModal(false);
    setCreateForm({ title: '', content: '', target: 'GLOBAL', clubId: '', imageUrl: '' });
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setCreateForm({
      title: announcement.title,
      content: announcement.content,
      target: announcement.target,
      clubId: announcement.clubId || '',
      imageUrl: announcement.imageUrl || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement || !createForm.title || !createForm.content) return;

    const updatedAnnouncement = dataService.updateAnnouncement(selectedAnnouncement.id, {
      title: createForm.title,
      content: createForm.content,
      target: createForm.target,
      clubId: createForm.target === 'CLUB' ? createForm.clubId : undefined,
      imageUrl: createForm.imageUrl || undefined
    });

    if (updatedAnnouncement) {
      setAnnouncements(announcements.map(a => 
        a.id === selectedAnnouncement.id ? updatedAnnouncement : a
      ));
      setShowEditModal(false);
      setSelectedAnnouncement(null);
      setCreateForm({ title: '', content: '', target: 'GLOBAL', clubId: '', imageUrl: '' });
    }
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      const success = dataService.deleteAnnouncement(announcementId);
      if (success) {
        setAnnouncements(announcements.filter(a => a.id !== announcementId));
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClubName = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club?.name || 'Unknown Club';
  };

  const getCreatorName = (userId: string) => {
    const user = dataService.getUserById(userId);
    return user?.fullName || 'Unknown User';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Stay updated with the latest news and important information
          </p>
        </div>
        {canCreateAnnouncement() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Announcement
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Announcements</option>
            <option value="GLOBAL">Global</option>
            <option value="CLUB">Club Specific</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTarget('all');
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-6">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {announcement.imageUrl && (
                <div className="h-48 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {announcement.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        announcement.target === 'GLOBAL' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {announcement.target === 'GLOBAL' ? (
                          <>
                            <Globe className="h-3 w-3 mr-1" />
                            Global
                          </>
                        ) : (
                          <>
                            <Users className="h-3 w-3 mr-1" />
                            Club
                          </>
                        )}
                      </span>
                    </div>

                    {announcement.target === 'CLUB' && announcement.clubId && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        For: {getClubName(announcement.clubId)}
                      </p>
                    )}

                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      {announcement.content}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(announcement.createdAt)}
                      <span className="mx-2">•</span>
                      <span>By {getCreatorName(announcement.createdBy)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {canEditAnnouncement(announcement) && (
                      <>
                        <button
                          onClick={() => handleEditAnnouncement(announcement)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No announcements found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || selectedTarget !== 'all'
              ? 'Try adjusting your filters to see more announcements.'
              : 'There are no announcements at the moment.'}
          </p>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Announcement</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target</label>
                  <select
                    required
                    value={createForm.target}
                    onChange={(e) => setCreateForm({ ...createForm, target: e.target.value as 'GLOBAL' | 'CLUB' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="GLOBAL">Global (All Users)</option>
                    <option value="CLUB">Club Specific</option>
                  </select>
                </div>

                {createForm.target === 'CLUB' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Club</label>
                    <select
                      required
                      value={createForm.clubId}
                      onChange={(e) => setCreateForm({ ...createForm, clubId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a club</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                  <textarea
                    rows={4}
                    required
                    value={createForm.content}
                    onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={createForm.imageUrl}
                    onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                    Create Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {showEditModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Announcement</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target</label>
                  <select
                    required
                    value={createForm.target}
                    onChange={(e) => setCreateForm({ ...createForm, target: e.target.value as 'GLOBAL' | 'CLUB' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="GLOBAL">Global (All Users)</option>
                    <option value="CLUB">Club Specific</option>
                  </select>
                </div>

                {createForm.target === 'CLUB' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Club</label>
                    <select
                      required
                      value={createForm.clubId}
                      onChange={(e) => setCreateForm({ ...createForm, clubId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a club</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                  <textarea
                    rows={4}
                    required
                    value={createForm.content}
                    onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={createForm.imageUrl}
                    onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                    Update Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
