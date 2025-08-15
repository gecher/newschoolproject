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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    imageUrl: '',
    rsvpLimit: '' as number | ''
  });

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

    // Check RSVP limit
    if (status === 'ACCEPTED' && event.rsvpLimit) {
      const currentAttendees = attendees.filter(a => a.rsvpStatus === 'ACCEPTED').length;
      if (currentAttendees >= event.rsvpLimit) {
        alert('Sorry, this event is at full capacity.');
        return;
      }
    }

    try {
      if (userAttendance) {
        // Update existing RSVP
        const updated = dataService.updateEventAttendee(userAttendance.id, { rsvpStatus: status });
        if (updated) {
          setUserAttendance(updated);
          // Update attendees list
          setAttendees(attendees.map(a => a.id === updated.id ? updated : a));
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

  const handleCheckIn = (attendeeId: string, checkedIn: boolean) => {
    try {
      const updated = dataService.updateEventAttendee(attendeeId, { checkedIn });
      if (updated) {
        setAttendees(attendees.map(a => a.id === updated.id ? updated : a));
      }
    } catch (error) {
      console.error('Error updating check-in status:', error);
      alert('Failed to update check-in status. Please try again.');
    }
  };

  const canManageEvent = () => {
    if (!currentUser || !event || !club) return false;
    return currentUser.role === 'ADMIN' || 
           currentUser.id === club.advisorId;
  };

  const handleEditEvent = () => {
    if (!event) return;
    
    // Convert ISO date to datetime-local format
    const date = new Date(event.date);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    setEditForm({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      date: localDate,
      imageUrl: event.imageUrl || '',
      rsvpLimit: event.rsvpLimit || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const updatedEvent = dataService.updateEvent(event.id, {
      title: editForm.title,
      description: editForm.description || undefined,
      location: editForm.location || undefined,
      date: new Date(editForm.date).toISOString(),
      imageUrl: editForm.imageUrl || undefined,
      rsvpLimit: editForm.rsvpLimit === '' ? undefined : Number(editForm.rsvpLimit)
    });

    if (updatedEvent) {
      setEvent(updatedEvent);
      setShowEditModal(false);
    }
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
              <Calendar className="h-24 w-24 text-white opacity-70" />
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
                <button 
                  onClick={handleEditEvent}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center transition-colors"
                >
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

            {/* Attendee Management Section for Organizers */}
            {canManageEvent() && (
              <div className="mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Attendee Management</h2>
                   
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Total RSVPs</h3>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {attendees.filter(a => a.rsvpStatus === 'ACCEPTED').length}
                      </p>
                      {event.rsvpLimit && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          of {event.rsvpLimit} capacity
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Checked In</h3>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {attendees.filter(a => a.checkedIn).length}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {eventStatus?.status === 'past' ? 'Final count' : 'So far'}
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Pending</h3>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {attendees.filter(a => a.rsvpStatus === 'PENDING').length}
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Awaiting response
                      </p>
                    </div>
                  </div>

                  {/* Attendees List */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Attendee</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">RSVP Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Check-in</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendees.map((attendee) => {
                          const user = dataService.getUserById(attendee.userId);
                          if (!user) return null;
                          
                          return (
                            <tr key={attendee.id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={user.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                                    alt={user.fullName}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  attendee.rsvpStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                  attendee.rsvpStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {attendee.rsvpStatus}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {attendee.rsvpStatus === 'ACCEPTED' ? (
                                  attendee.checkedIn ? (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Checked In
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleCheckIn(attendee.id, true)}
                                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors"
                                    >
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Check In
                                    </button>
                                  )
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  {attendee.rsvpStatus === 'PENDING' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          const updated = dataService.updateEventAttendee(attendee.id, { rsvpStatus: 'ACCEPTED' });
                                          if (updated) {
                                            setAttendees(attendees.map(a => a.id === updated.id ? updated : a));
                                          }
                                        }}
                                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => {
                                          const updated = dataService.updateEventAttendee(attendee.id, { rsvpStatus: 'REJECTED' });
                                          if (updated) {
                                            setAttendees(attendees.map(a => a.id === updated.id ? updated : a));
                                          }
                                        }}
                                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

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
                        <div key={attendee.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
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
                          
                          {/* Check-in status for organizers */}
                          {canManageEvent() && (
                            <div className="flex items-center space-x-2">
                              {attendee.checkedIn ? (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Checked In
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleCheckIn(attendee.id, true)}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-green-100 hover:text-green-800 transition-colors"
                                >
                                  Check In
                                </button>
                              )}
                            </div>
                          )}
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

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Event</h2>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location (optional)</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Provide a URL to an image for the event. If left empty, a default image will be used.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RSVP Limit (optional)</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.rsvpLimit}
                    onChange={(e) => setEditForm({ ...editForm, rsvpLimit: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)} 
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                    Update Event
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

export default EventDetailPage;