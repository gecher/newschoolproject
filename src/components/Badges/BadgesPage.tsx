import React, { useState, useEffect } from 'react';
import { 
  Award, Star, Trophy, Medal, Target, Users, 
  Calendar, TrendingUp, Plus, Search, Filter, 
  ChevronDown, Edit, Trash2, Eye, CheckCircle, 
  XCircle, Crown, Zap, Heart, BookOpen 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { Badge, UserBadge, User } from '../../types';

interface BadgesPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const BadgesPage: React.FC<BadgesPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'earned' | 'available'>('all');

  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    iconUrl: '',
    autoAssign: false,
    condition: ''
  });

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const allBadges = dataService.getBadges();
      const allUserBadges = dataService.getUserBadges(currentUser?.id || '');
      const allUsers = dataService.getUsers();
      
      setBadges(allBadges);
      setUserBadges(allUserBadges);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBadge: Partial<Badge> = {
      name: badgeForm.name,
      description: badgeForm.description,
      iconUrl: badgeForm.iconUrl || undefined,
      autoAssign: badgeForm.autoAssign,
      condition: badgeForm.condition || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const created = dataService.createBadge(newBadge as Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>);
      setBadges([...badges, created]);
      setBadgeForm({ name: '', description: '', iconUrl: '', autoAssign: false, condition: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating badge:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const hasEarnedBadge = (badgeId: string) => {
    return userBadges.some(userBadge => userBadge.badgeId === badgeId);
  };

  const getEarnedDate = (badgeId: string) => {
    const userBadge = userBadges.find(ub => ub.badgeId === badgeId);
    return userBadge ? formatDate(userBadge.assignedAt) : null;
  };

  const canCreateBadge = () => {
    return currentUser?.role === 'ADMIN';
  };

  const canAwardBadge = () => {
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER';
  };

  const getBadgeIcon = (badge: Badge) => {
    const iconMap: { [key: string]: any } = {
      'crown': Crown,
      'star': Star,
      'trophy': Trophy,
      'medal': Medal,
      'target': Target,
      'zap': Zap,
      'heart': Heart,
      'book': BookOpen,
      'default': Award
    };

    const iconName = badge.iconUrl?.split('/').pop()?.split('.')[0] || 'default';
    return iconMap[iconName] || iconMap.default;
  };

  const getBadgeColor = (badge: Badge) => {
    const colors = [
      'from-yellow-400 to-orange-500',
      'from-blue-400 to-purple-500',
      'from-green-400 to-emerald-500',
      'from-red-400 to-pink-500',
      'from-indigo-400 to-blue-500',
      'from-purple-400 to-pink-500'
    ];
    
    const index = badge.name.length % colors.length;
    return colors[index];
  };

  const filteredBadges = badges.filter(badge => {
    if (searchTerm && !badge.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCategory !== 'all' && !badge.name.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
    
    if (viewMode === 'earned') return hasEarnedBadge(badge.id);
    if (viewMode === 'available') return !hasEarnedBadge(badge.id);
    
    return true;
  });

  const categories = ['Leadership', 'Participation', 'Achievement', 'Community', 'Academic', 'Sports'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Badges & Achievements</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your accomplishments and earn recognition for your contributions
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          {canCreateBadge() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Badge
            </button>
          )}
          {canAwardBadge() && (
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
              <Award className="h-5 w-5 mr-2" />
              Award Badge
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Badges</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{badges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Earned</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{userBadges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{badges.length - userBadges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {badges.length > 0 ? Math.round((userBadges.length / badges.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'all' | 'earned' | 'available')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Badges</option>
            <option value="earned">Earned</option>
            <option value="available">Available</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setViewMode('all');
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      {filteredBadges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => {
            const IconComponent = getBadgeIcon(badge);
            const colorClass = getBadgeColor(badge);
            const earned = hasEarnedBadge(badge.id);
            const earnedDate = getEarnedDate(badge.id);
            
            return (
              <div
                key={badge.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                  earned ? 'ring-2 ring-yellow-400' : ''
                }`}
                onClick={() => {
                  setSelectedBadge(badge);
                  setShowBadgeModal(true);
                }}
              >
                <div className={`h-32 bg-gradient-to-br ${colorClass} flex items-center justify-center relative`}>
                  <IconComponent className="h-16 w-16 text-white" />
                  {earned && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {badge.name}
                    </h3>
                    {earned && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Earned
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {badge.description}
                  </p>

                  {earned && earnedDate && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      Earned {earnedDate}
                    </div>
                  )}

                  {!earned && badge.autoAssign && (
                    <div className="flex items-center text-xs text-blue-500 dark:text-blue-400">
                      <Zap className="h-3 w-3 mr-1" />
                      Auto-assigned
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No badges found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory !== 'all' || viewMode !== 'all'
              ? 'Try adjusting your filters to see more badges.'
              : 'There are no badges available at the moment.'}
          </p>
        </div>
      )}

      {/* Badge Detail Modal */}
      {showBadgeModal && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Badge Details
                </h2>
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className={`h-32 bg-gradient-to-br ${getBadgeColor(selectedBadge)} rounded-lg flex items-center justify-center`}>
                  {React.createElement(getBadgeIcon(selectedBadge), { className: "h-16 w-16 text-white" })}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedBadge.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedBadge.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {hasEarnedBadge(selectedBadge.id) && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Earned
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getEarnedDate(selectedBadge.id)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedBadge.autoAssign && (
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Auto-assigned
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Awarded automatically when conditions are met
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedBadge.condition && (
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Requirements
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedBadge.condition}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowBadgeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                  {canAwardBadge() && !hasEarnedBadge(selectedBadge.id) && (
                    <div className="flex-1 flex items-center space-x-2">
                      <select
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        onChange={(e) => setSelectedBadge({ ...selectedBadge, description: `${selectedBadge.description || ''}` } as Badge)}
                        defaultValue={currentUser?.id}
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                      </select>
                      <button 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        onClick={(e) => {
                          const awardTo = (e.currentTarget.previousSibling as HTMLSelectElement).value || currentUser?.id || '';
                          dataService.assignBadgeToUser(awardTo, selectedBadge.id);
                          setUserBadges(dataService.getUserBadges(awardTo));
                          setShowBadgeModal(false);
                        }}
                      >
                        Award
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Badge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Badge
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Badge Name
                  </label>
                  <input
                    type="text"
                    required
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon URL (optional)
                  </label>
                  <input
                    type="url"
                    value={badgeForm.iconUrl}
                    onChange={(e) => setBadgeForm({...badgeForm, iconUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto-assign Condition (optional)
                  </label>
                  <input
                    type="text"
                    value={badgeForm.condition}
                    onChange={(e) => setBadgeForm({...badgeForm, condition: e.target.value})}
                    placeholder="e.g., Join 5 clubs, Attend 10 events"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoAssign"
                    checked={badgeForm.autoAssign}
                    onChange={(e) => setBadgeForm({...badgeForm, autoAssign: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoAssign" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Auto-assign when conditions are met
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Badge
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

export default BadgesPage;
