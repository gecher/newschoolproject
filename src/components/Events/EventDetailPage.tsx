import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Users, 
  Share2, Heart, CheckCircle, XCircle, Edit,
  UserPlus, MessageSquare, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { Event, Club, EventAttendee, User } from '../../types';

interface EventDetailPageProps {
  onNavigate: (page: string, data?: any) => void;
  eventId: string;
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ onNavigate, eventId }) => {
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [userAttendance, setUserAttendance] = useState<EventAttendee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const eventData = dataService.getEventById(eventId);
      if (!eventData) {
        onNavigate('events');
        return;
      }

      setEvent(eventData);

      // Load club data
      const clubData = dataService.getClubById(eventData.clubId);
      setClub(clubData || null);

      // Load attendees
      const eventAttendees = dataService.getEventAttendees(eventId);
      setAttendees(eventAttendees);

      // Check current user attendance
      if (currentUser) {
        const userAttendee = eventAttendees.find(a => a.userId === currentUser.id);
        setUserAttendance(userAttendee || null);
      }
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVP = async (status: 'ACCEPTED' | 'REJECTED') => {
    if (!currentUser || !event) return;

    try {
      if (userAttendance) {
        // Update existing RSVP
        const updated = dataService.updateEventAttendee(userAttendance.id, { rsvpStatus: status });
        if (updated) {
          setUserAttendance(updated);
        }
      } else {
        // Create new RSVP
        const newAttendee = dataService.createEventAttendee({
          eventId: event.id,
          userId: currentUser.id,
          rsvpStatus: status,
          checkedIn: false
        });
        setUserAttendance(newAttendee);
        setAttendees([...attendees, newAttendee]);
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP. Please try again.');
    }
  };

  const canManageEvent = () => {
    if (!currentUser || !event || !club) return false;
    return currentUser.role === 'ADMIN' || 
           currentUser.id === club.advisorId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = () => {
    if (!event) return null;
    
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (eventDate < now) {
      return { status: 'past', color: 'gray', text: 'Past Event' };
    } else if (eventDate.toDateString() === now.toDateString()) {
      return { status: 'today', color: 'green', text: 'Today' };
    } else {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    }
  };

  const getAttendeeCount = () => {
    return attendees.filter(a => a.rsvpStatus === 'ACCEPTED').length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event not found</h2>
          <button
            onClick={() => onNavigate('events')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="relative">
        {/* Event Image */}
        <div className="h-64 md:h-80 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-24 w-24 text-white opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => onNavigate('events')}
          className="absolute top-4 left-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Event Status Badge */}
        {eventStatus && (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium text-white ${
            eventStatus.color === 'green' ? 'bg-green-600' :
            eventStatus.color === 'blue' ? 'bg-blue-600' :
            'bg-gray-600'
          }`}>
            {eventStatus.text}
          </div>
        )}

        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(event.date)}
              </span>
              {event.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </span>
              )}
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {getAttendeeCount()} attending
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* RSVP Actions */}
            <div className="flex flex-wrap gap-3 mb-8">
              {!userAttendance ? (
                <>
                  <button
                    onClick={() => handleRSVP('ACCEPTED')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    I'm Going
                  </button>
                  <button
                    onClick={() => handleRSVP('REJECTED')}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Can't Go
                  </button>
                </>
              ) : userAttendance.rsvpStatus === 'ACCEPTED' ? (
                <div className="flex items-center space-x-3">
                  <span className="bg-green-100 text-green-800 px-6 py-2 rounded-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    You're Going
                  </span>
                  <button
                    onClick={() => handleRSVP('REJECTED')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Change to Can't Go
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="bg-red-100 text-red-800 px-6 py-2 rounded-lg flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    You Can't Go
                  </span>
                  <button
                    onClick={() => handleRSVP('ACCEPTED')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Change to Going
                  </button>
                </div>
              )}

              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center transition-colors">
                <Heart className="h-5 w-5 mr-2" />
                Save
              </button>

              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center transition-colors">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>

              {canManageEvent() && (
                <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center transition-colors">
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Event
                </button>
              )}
            </div>

            {/* Event Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Event</h2>
              
              {event.description && (
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Date & Time</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-5 w-5 mr-2" />
                    <div>
                      <p>{formatDate(event.date)}</p>
                      <p className="text-sm">{formatTime(event.date)}</p>
                    </div>
                  </div>
                </div>

                {event.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Location</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-5 w-5 mr-2" />
                      <p>{event.location}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Organizer</h3>
                  {club && (
                    <div className="flex items-center">
                      <img
                        src={club.logoUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=40&h=40&fit=crop'}
                        alt={club.name}
                        className="h-8 w-8 rounded-full mr-2"
                      />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{club.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{club.category}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Attendance</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="h-5 w-5 mr-2" />
                    <div>
                      <p>{getAttendeeCount()} going</p>
                      {event.rsvpLimit && (
                        <p className="text-sm">{event.rsvpLimit - getAttendeeCount()} spots left</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Documents */}
            {event.documents && event.documents.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Event Materials</h2>
                <div className="space-y-3">
                  {event.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {club && (
                  <button
                    onClick={() => onNavigate('club-detail', { clubId: club.id })}
                    className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">View Club</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigate('forums')}
                  className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Discuss Event</span>
                </button>
                <button className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Invite Friends</span>
                </button>
              </div>
            </div>

            {/* Attendees */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Who's Going ({getAttendeeCount()})
              </h3>
              
              {attendees.filter(a => a.rsvpStatus === 'ACCEPTED').length > 0 ? (
                <div className="space-y-3">
                  {attendees
                    .filter(a => a.rsvpStatus === 'ACCEPTED')
                    .slice(0, 5)
                    .map((attendee) => {
                      const user = dataService.getUserById(attendee.userId);
                      if (!user) return null;
                      
                      return (
                        <div key={attendee.id} className="flex items-center space-x-3">
                          <img
                            src={user.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                            alt={user.fullName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                          </div>
                        </div>
                      );
                    })}
                  
                  {attendees.filter(a => a.rsvpStatus === 'ACCEPTED').length > 5 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      +{attendees.filter(a => a.rsvpStatus === 'ACCEPTED').length - 5} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No one is going yet</p>
              )}
            </div>

            {/* Event Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {event.rsvpLimit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Capacity</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.rsvpLimit} people
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`text-sm font-medium ${
                    eventStatus?.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    eventStatus?.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {eventStatus?.text}
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

export default EventDetailPage;