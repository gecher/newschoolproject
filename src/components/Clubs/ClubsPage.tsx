import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List, Users, MapPin, 
  Calendar, Star, Plus, ChevronRight, BookOpen,
  Zap, Palette, Trophy, Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { Club, Membership } from '../../types';

interface ClubsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const ClubsPage: React.FC<ClubsPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { name: 'All', icon: Grid, color: 'gray' },
    { name: 'Technology', icon: Zap, color: 'blue' },
    { name: 'Arts', icon: Palette, color: 'purple' },
    { name: 'Academic', icon: BookOpen, color: 'green' },
    { name: 'Sports', icon: Trophy, color: 'orange' },
    { name: 'Community Service', icon: Heart, color: 'red' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchQuery, selectedCategory]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allClubs = dataService.getClubs();
      setClubs(allClubs);

      if (currentUser) {
        const userMemberships = dataService.getMembershipsByUser(currentUser.id);
        setMemberships(userMemberships);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = clubs;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(club => club.category === selectedCategory);
    }

    setFilteredClubs(filtered);
  };

  const isUserMember = (clubId: string) => {
    return memberships.some(membership => 
      membership.clubId === clubId && membership.status === 'APPROVED'
    );
  };

  const getUserMembership = (clubId: string) => {
    return memberships.find(membership => 
      membership.clubId === clubId
    );
  };

  const handleJoinClub = async (clubId: string) => {
    if (!currentUser) return;

    try {
      // Check if user already has a membership
      const existingMembership = getUserMembership(clubId);
      if (existingMembership) {
        alert('You already have a membership request for this club');
        return;
      }

      // Create new membership request
      const newMembership = dataService.createMembership({
        userId: currentUser.id,
        clubId: clubId,
        role: 'MEMBER',
        status: 'PENDING',
        gradeId: 'grade-12', // Default grade, should be dynamic
        joinedAt: new Date().toISOString(),
        startDate: new Date().toISOString()
      });

      setMemberships([...memberships, newMembership]);

      // Create notification
      dataService.createNotification({
        userId: currentUser.id,
        message: `Your request to join the club has been submitted and is pending approval.`,
        type: 'ANNOUNCEMENT',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      alert('Join request submitted successfully!');
    } catch (error) {
      console.error('Error joining club:', error);
      alert('Failed to join club. Please try again.');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : BookOpen;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : 'gray';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Clubs</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and join clubs that match your interests and passions.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px]"
            >
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Clubs Grid/List */}
      {filteredClubs.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredClubs.map((club) => {
            const membership = getUserMembership(club.id);
            const isMember = isUserMember(club.id);
            const CategoryIcon = getCategoryIcon(club.category || '');
            const categoryColor = getCategoryColor(club.category || '');

            if (viewMode === 'grid') {
              return (
                <div
                  key={club.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onNavigate('club-detail', { clubId: club.id })}
                >
                  {/* Club Cover Image */}
                  <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                    {club.coverImageUrl ? (
                      <img
                        src={club.coverImageUrl}
                        alt={club.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CategoryIcon className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-${categoryColor}-600`}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {club.category}
                      </span>
                    </div>
                    {club.logoUrl && (
                      <div className="absolute -bottom-6 left-4">
                        <img
                          src={club.logoUrl}
                          alt={`${club.name} logo`}
                          className="h-12 w-12 rounded-lg border-2 border-white dark:border-gray-800 bg-white dark:bg-gray-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* Club Content */}
                  <div className="p-6 pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {club.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {club.description}
                    </p>

                    {/* Club Stats */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{dataService.getMembershipsByClub(club.id).length} members</span>
                      <Calendar className="h-4 w-4 ml-4 mr-1" />
                      <span>{dataService.getEventsByClub(club.id).length} events</span>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      {isMember ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          Member
                        </span>
                      ) : membership?.status === 'PENDING' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinClub(club.id);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Join Club
                        </button>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            } else {
              // List view
              return (
                <div
                  key={club.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onNavigate('club-detail', { clubId: club.id })}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={club.logoUrl || club.coverImageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=80&h=80&fit=crop'}
                      alt={club.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {club.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryColor}-100 dark:bg-${categoryColor}-900 text-${categoryColor}-800 dark:text-${categoryColor}-200`}>
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {club.category}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                        {club.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{dataService.getMembershipsByClub(club.id).length} members</span>
                        <Calendar className="h-4 w-4 ml-4 mr-1" />
                        <span>{dataService.getEventsByClub(club.id).length} events</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {isMember ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Member
                        </span>
                      ) : membership?.status === 'PENDING' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinClub(club.id);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Join
                        </button>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clubs found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search or filters'
              : 'No clubs are available at the moment'
            }
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClubsPage;