import sampleData from '../data/sample-data.json';

// Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  phone: string;
  profilePhoto: string;
  coverPhoto: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  advisorId: string;
  isApproved: boolean;
  memberCount: number;
  documents: any[];
  gallery: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  location: string;
  date: string;
  imageUrl: string;
  rsvpLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  clubId: string;
  role: 'PRESIDENT' | 'VICE_PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'MEMBER' | 'CAPTAIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  gradeId: string;
  joinedAt: string;
  startDate: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  checkedIn: boolean;
}

// Data Service Class
class DataService {
  private data: any;

  constructor() {
    this.data = JSON.parse(JSON.stringify(sampleData)); // Deep copy
  }

  // User Management
  getUserById(id: string): User | null {
    return this.data.users.find((user: User) => user.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    return this.data.users.find((user: User) => user.email === email) || null;
  }

  getAllUsers(): User[] {
    return this.data.users;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.data.users.findIndex((user: User) => user.id === id);
    if (userIndex === -1) return null;

    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.data.users[userIndex];
  }

  // Club Management
  getAllClubs(): Club[] {
    return this.data.clubs;
  }

  getClubById(id: string): Club | null {
    return this.data.clubs.find((club: Club) => club.id === id) || null;
  }

  getClubsByAdvisor(advisorId: string): Club[] {
    return this.data.clubs.filter((club: Club) => club.advisorId === advisorId);
  }

  createClub(clubData: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Club {
    const newClub: Club = {
      ...clubData,
      id: `club-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.clubs.push(newClub);
    return newClub;
  }

  updateClub(id: string, updates: Partial<Club>): Club | null {
    const clubIndex = this.data.clubs.findIndex((club: Club) => club.id === id);
    if (clubIndex === -1) return null;

    this.data.clubs[clubIndex] = {
      ...this.data.clubs[clubIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.data.clubs[clubIndex];
  }

  deleteClub(id: string): boolean {
    const clubIndex = this.data.clubs.findIndex((club: Club) => club.id === id);
    if (clubIndex === -1) return false;

    this.data.clubs.splice(clubIndex, 1);
    
    // Remove related memberships
    this.data.memberships = this.data.memberships.filter(
      (membership: Membership) => membership.clubId !== id
    );

    // Remove related events
    this.data.events = this.data.events.filter(
      (event: Event) => event.clubId !== id
    );

    return true;
  }

  approveClub(id: string): Club | null {
    return this.updateClub(id, { isApproved: true, status: 'ACTIVE' });
  }

  // Event Management
  getAllEvents(): Event[] {
    return this.data.events;
  }

  getEventById(id: string): Event | null {
    return this.data.events.find((event: Event) => event.id === id) || null;
  }

  getEventsByClub(clubId: string): Event[] {
    return this.data.events.filter((event: Event) => event.clubId === clubId);
  }

  createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.events.push(newEvent);
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const eventIndex = this.data.events.findIndex((event: Event) => event.id === id);
    if (eventIndex === -1) return null;

    this.data.events[eventIndex] = {
      ...this.data.events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.data.events[eventIndex];
  }

  deleteEvent(id: string): boolean {
    const eventIndex = this.data.events.findIndex((event: Event) => event.id === id);
    if (eventIndex === -1) return false;

    this.data.events.splice(eventIndex, 1);
    
    // Remove related attendees
    this.data.eventAttendees = this.data.eventAttendees.filter(
      (attendee: EventAttendee) => attendee.eventId !== id
    );

    return true;
  }

  // Membership Management
  getAllMemberships(): Membership[] {
    return this.data.memberships;
  }

  getMembershipsByUser(userId: string): Membership[] {
    return this.data.memberships.filter((membership: Membership) => membership.userId === userId);
  }

  getMembershipsByClub(clubId: string): Membership[] {
    return this.data.memberships.filter((membership: Membership) => membership.clubId === clubId);
  }

  createMembership(membershipData: Omit<Membership, 'id' | 'joinedAt' | 'startDate'>): Membership {
    const newMembership: Membership = {
      ...membershipData,
      id: `membership-${Date.now()}`,
      joinedAt: new Date().toISOString(),
      startDate: new Date().toISOString()
    };

    this.data.memberships.push(newMembership);
    
    // Update club member count
    const club = this.getClubById(membershipData.clubId);
    if (club) {
      this.updateClub(club.id, { memberCount: club.memberCount + 1 });
    }

    return newMembership;
  }

  updateMembership(id: string, updates: Partial<Membership>): Membership | null {
    const membershipIndex = this.data.memberships.findIndex((membership: Membership) => membership.id === id);
    if (membershipIndex === -1) return null;

    this.data.memberships[membershipIndex] = {
      ...this.data.memberships[membershipIndex],
      ...updates
    };

    return this.data.memberships[membershipIndex];
  }

  approveMembership(id: string): Membership | null {
    return this.updateMembership(id, { status: 'APPROVED' });
  }

  rejectMembership(id: string): Membership | null {
    return this.updateMembership(id, { status: 'REJECTED' });
  }

  deleteMembership(id: string): boolean {
    const membershipIndex = this.data.memberships.findIndex((membership: Membership) => membership.id === id);
    if (membershipIndex === -1) return false;

    const membership = this.data.memberships[membershipIndex];
    this.data.memberships.splice(membershipIndex, 1);
    
    // Update club member count
    const club = this.getClubById(membership.clubId);
    if (club) {
      this.updateClub(club.id, { memberCount: Math.max(0, club.memberCount - 1) });
    }

    return true;
  }

  // Event Attendance Management
  getAllEventAttendees(): EventAttendee[] {
    return this.data.eventAttendees;
  }

  getEventAttendees(eventId: string): EventAttendee[] {
    return this.data.eventAttendees.filter((attendee: EventAttendee) => attendee.eventId === eventId);
  }

  getUserEventAttendance(userId: string): EventAttendee[] {
    return this.data.eventAttendees.filter((attendee: EventAttendee) => attendee.userId === userId);
  }

  createEventAttendee(attendeeData: Omit<EventAttendee, 'id'>): EventAttendee {
    const newAttendee: EventAttendee = {
      ...attendeeData,
      id: `attendee-${Date.now()}`
    };

    this.data.eventAttendees.push(newAttendee);
    return newAttendee;
  }

  updateEventAttendee(id: string, updates: Partial<EventAttendee>): EventAttendee | null {
    const attendeeIndex = this.data.eventAttendees.findIndex((attendee: EventAttendee) => attendee.id === id);
    if (attendeeIndex === -1) return null;

    this.data.eventAttendees[attendeeIndex] = {
      ...this.data.eventAttendees[attendeeIndex],
      ...updates
    };

    return this.data.eventAttendees[attendeeIndex];
  }

  // Utility Methods
  getData(): any {
    return this.data;
  }

  resetData(): void {
    this.data = JSON.parse(JSON.stringify(sampleData));
  }

  // Search functionality
  searchClubs(query: string): Club[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.clubs.filter((club: Club) =>
      club.name.toLowerCase().includes(lowercaseQuery) ||
      club.description.toLowerCase().includes(lowercaseQuery) ||
      club.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchEvents(query: string): Event[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.events.filter((event: Event) =>
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.description.toLowerCase().includes(lowercaseQuery) ||
      event.location.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchUsers(query: string): User[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.users.filter((user: User) =>
      user.fullName.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.role.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;