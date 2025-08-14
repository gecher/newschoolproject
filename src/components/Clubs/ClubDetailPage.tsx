import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Calendar, MapPin, Star, 
  Plus, Share2, Heart,
  Edit, Settings, UserPlus, Image as ImageIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { Club, Event, Membership, User } from '../../types';

interface ClubDetailPageProps {
  onNavigate: (page: string, data?: any) => void;
  clubId: string;
}

const ClubDetailPage: React.FC<ClubDetailPageProps> = ({ onNavigate, clubId }) => {
  const { currentUser } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [advisor, setAdvisor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'events' | 'members' | 'gallery'>('about');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Event create/edit for managers (admin/advisor/president)
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    rsvpLimit: '' as string | number
  });

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  const loadClubData = async () => {
    try {
      const clubData = dataService.getClubById(clubId);
      if (!clubData) {
        onNavigate('clubs');
        return;
      }

      setClub(clubData);

      // Load events
      const clubEvents = dataService.getEventsByClub(clubId);
      setEvents(clubEvents);

      // Load members
      const memberships = dataService.getMembershipsByClub(clubId);
      const memberUsers = memberships
        .filter(m => m.status === 'APPROVED')
        .map(m => dataService.getUserById(m.userId))
        .filter(Boolean) as User[];
      setMembers(memberUsers);

      // Load advisor
      const advisorData = dataService.getUserById(clubData.advisorId);
      setAdvisor(advisorData || null);

      // Check current user membership
      if (currentUser) {
        const userMembership = memberships.find(m => m.userId === currentUser.id);
        setMembership(userMembership || null);
      }
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClub = async () => {
    if (!currentUser || !club) return;

    try {
      const newMembership = dataService.createMembership({
        userId: currentUser.id,
        clubId: club.id,
        role: 'MEMBER',
        status: 'PENDING',
        gradeId: 'grade-12', // Default grade
        joinedAt: new Date().toISOString(),
        startDate: new Date().toISOString()
      });

      setMembership(newMembership);
      alert('Join request submitted successfully!');
    } catch (error) {
      console.error('Error joining club:', error);
      alert('Failed to join club. Please try again.');
    }
  };

  const canManageClub = () => {
    if (!currentUser || !club) return false;
    return currentUser.role === 'ADMIN' || 
           currentUser.id === club.advisorId ||
           (membership && membership.role === 'PRESIDENT');
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', description: '', location: '', date: '', rsvpLimit: '' });
    setShowEventModal(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    const dt = new Date(event.date);
    const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEventForm({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      date: isoLocal,
      rsvpLimit: event.rsvpLimit ?? ''
    });
    setShowEventModal(true);
  };

  const saveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    const iso = eventForm.date ? new Date(eventForm.date as string).toISOString() : new Date().toISOString();
    const rsvp = eventForm.rsvpLimit === '' ? 0 : Number(eventForm.rsvpLimit);
    if (editingEvent) {
      dataService.updateEvent(editingEvent.id, {
        title: eventForm.title,
        clubId: club.id,
        description: eventForm.description || undefined,
        location: eventForm.location || undefined,
        date: iso,
        rsvpLimit: rsvp
      });
    } else {
      dataService.createEvent({
        title: eventForm.title,
        clubId: club.id,
        description: eventForm.description || undefined,
        location: eventForm.location || undefined,
        date: iso,
        imageUrl: '',
        rsvpLimit: rsvp
      });
    }
    setShowEventModal(false);
    setEditingEvent(null);
    // refresh events list
    setEvents(dataService.getEventsByClub(club.id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nextImage = () => {
    if (club?.gallery && club.gallery.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % club.gallery.length);
    }
  };

  const prevImage = () => {
    if (club?.gallery && club.gallery.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + club.gallery.length) % club.gallery.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Club not found</h2>
          <button
            onClick={() => onNavigate('clubs')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 md:h-80 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
          {club.coverImageUrl ? (
            <img
              src={club.coverImageUrl}
              alt={club.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="h-24 w-24 text-white opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => onNavigate('clubs')}
          className="absolute top-4 left-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Club Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end space-x-4">
              {club.logoUrl && (
                <img
                  src={club.logoUrl}
                  alt={`${club.name} logo`}
                  className="h-20 w-20 rounded-lg border-4 border-white shadow-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{club.name}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">{club.category}</span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {members.length} members
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {events.length} events
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {!membership ? (
                <button
                  onClick={handleJoinClub}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Join Club
                </button>
              ) : membership.status === 'PENDING' ? (
                <span className="bg-yellow-100 text-yellow-800 px-6 py-2 rounded-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Pending Approval
                </span>
              ) : (
                <span className="bg-green-100 text-green-800 px-6 py-2 rounded-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Member
                </span>
              )}

              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center transition-colors">
                <Heart className="h-5 w-5 mr-2" />
                Follow
              </button>

              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center transition-colors">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>

              {canManageClub() && (
                <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center transition-colors">
                  <Settings className="h-5 w-5 mr-2" />
                  Manage
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'about', label: 'About', icon: Users },
                  { id: 'events', label: 'Events', icon: Calendar },
                  { id: 'members', label: 'Members', icon: Users },
                  { id: 'gallery', label: 'Gallery', icon: ImageIcon }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {club.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Club Advisor</h3>
                    {advisor && (
                      <div className="flex items-center space-x-3">
                        <img
                          src={advisor.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'}
                          alt={advisor.fullName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{advisor.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{advisor.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Club Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{members.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Members</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{events.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Events</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {events.filter(e => new Date(e.date) > new Date()).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {new Date().getFullYear() - new Date(club.createdAt).getFullYear()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Years Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Club Events</h3>
                    {canManageClub() && (
                      <button onClick={openAddEvent} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </button>
                    )}
                  </div>

                  {events.length > 0 ? (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => onNavigate('event-detail', { eventId: event.id })}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{event.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(event.date)}
                                </span>
                                {event.location && (
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            {event.imageUrl && (
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="h-16 w-16 rounded-lg object-cover ml-4"
                              />
                            )}
                          </div>
                          {canManageClub() && (
                            <div className="flex items-center justify-end space-x-2 mt-3">
                              <button onClick={(e) => { e.stopPropagation(); openEditEvent(event); }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No events scheduled</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Club Members ({members.length})</h3>
                  </div>

                  {members.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {members.map((member) => {
                        const memberMembership = dataService.getMembershipsByUser(member.id)
                          .find(m => m.clubId === club.id);
                        
                        return (
                          <div key={member.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <img
                              src={member.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'}
                              alt={member.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{member.fullName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              memberMembership?.role === 'PRESIDENT' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : memberMembership?.role === 'CAPTAIN'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {memberMembership?.role || 'MEMBER'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No members yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Gallery</h3>

                  {club.gallery && club.gallery.length > 0 ? (
                    <div className="space-y-6">
                      {/* Featured Image */}
                      <div className="relative">
                        <img
                          src={club.gallery[currentImageIndex].url}
                          alt={club.gallery[currentImageIndex].caption}
                          className="w-full h-64 md:h-96 object-cover rounded-lg"
                        />
                        
                        {club.gallery.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}

                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded">
                            {club.gallery[currentImageIndex].caption}
                          </p>
                        </div>
                      </div>

                      {/* Thumbnail Grid */}
                      {club.gallery.length > 1 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {club.gallery.map((image, index) => (
                            <button
                              key={image.id}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`aspect-square rounded-lg overflow-hidden ${
                                index === currentImageIndex ? 'ring-2 ring-indigo-500' : ''
                              }`}
                            >
                              <img
                                src={image.url}
                                alt={image.caption}
                                className="w-full h-full object-cover hover:opacity-75 transition-opacity"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No photos available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('events')}
                  className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">View Events</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">New member joined</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Event scheduled</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">New discussion post</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Club Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Club Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Founded</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(club.createdAt).getFullYear()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{club.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`text-sm font-medium ${
                    club.status === 'ACTIVE' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {club.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Approval</span>
                  <span className={`text-sm font-medium ${
                    club.isApproved 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {club.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailPage;
/**
 * Event modal for managers
 */
// Render the modal at the end to avoid cluttering the main JSX above
// Note: Keeping minimal to avoid large refactors