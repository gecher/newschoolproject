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
    // Initialize from localStorage if available, otherwise from bundled sample data
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('appData') : null;
    if (stored) {
      try {
        this.data = JSON.parse(stored);
      } catch {
        this.data = JSON.parse(JSON.stringify(sampleData));
        this.persist();
      }
    } else {
      this.data = JSON.parse(JSON.stringify(sampleData));
      this.persist();
    }
    // Seed initial data for better UX
    this.seedTeacherClubs();
    this.seedStudentMemberships();
    this.seedInitialMembershipRequests();
    this.seedInitialNotifications();
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('appData', JSON.stringify(this.data));
      }
    } catch {
      // ignore persistence errors
    }
  }

  private seedInitialNotifications(): void {
    try {
      if (!Array.isArray(this.data.notifications)) {
        this.data.notifications = [];
      }
      const now = new Date().toISOString();
      const ensureOneFor = (userId: string, message: string, type: string) => {
        const hasAny = this.data.notifications.some((n: any) => n.userId === userId);
        if (!hasAny) {
          this.createNotification({ userId, message, type, isRead: false, createdAt: now });
        }
      };

      // Admins
      (this.data.users as User[]).filter(u => u.role === 'ADMIN').forEach(admin => {
        ensureOneFor(admin.id, 'Welcome, Admin! Check your dashboard for system stats and pending requests.', 'ANNOUNCEMENT');
      });

      // Teachers
      (this.data.users as User[]).filter(u => u.role === 'TEACHER').forEach(teacher => {
        ensureOneFor(teacher.id, 'Welcome, Teacher! Review your assigned clubs and membership requests.', 'ANNOUNCEMENT');
      });

      // Students
      (this.data.users as User[]).filter(u => u.role === 'STUDENT').forEach(student => {
        // Only seed if student has none and there are no existing student notifications
        ensureOneFor(student.id, 'Welcome to ClubHub! Explore clubs and RSVP to events.', 'ANNOUNCEMENT');
      });
    } catch {
      // ignore seed errors
    }
  }

  private seedInitialMembershipRequests(): void {
    try {
      if (!Array.isArray(this.data.memberships)) {
        this.data.memberships = [];
      }
      const hasPending = this.data.memberships.some((m: Membership) => m.status === 'PENDING');
      if (hasPending) return;

      // Find a student without membership in a given club and create a pending request
      const students: User[] = (this.data.users as User[]).filter(u => u.role === 'STUDENT');
      const clubs: Club[] = this.data.clubs as Club[];
      if (students.length === 0 || clubs.length === 0) return;

      const pickStudent = students[0];
      // Choose a club the student is not already a member of
      const currentClubIds = (this.data.memberships as Membership[])
        .filter(m => m.userId === pickStudent.id)
        .map(m => m.clubId);
      const targetClub = clubs.find(c => !currentClubIds.includes(c.id)) || clubs[0];

      const grades = this.data.grades || [];
      const defaultGradeId = grades[0]?.id || 'grade-12';

      this.createMembership({
        userId: pickStudent.id,
        clubId: targetClub.id,
        role: 'MEMBER',
        status: 'PENDING',
        gradeId: defaultGradeId
      });

      // Optionally seed a second pending request for variety if possible
      const otherStudent = students[1];
      if (otherStudent) {
        const otherClub = clubs.find(c => c.id !== targetClub.id) || targetClub;
        this.createMembership({
          userId: otherStudent.id,
          clubId: otherClub.id,
          role: 'MEMBER',
          status: 'PENDING',
          gradeId: defaultGradeId
        });
      }
    } catch {
      // ignore seeding errors
    }
  }

  // Ensure each teacher has at least 3 clubs assigned as advisor
  private seedTeacherClubs(minPerTeacher: number = 3): void {
    try {
      // Avoid reseeding
      if (this.data.__seedTeacherClubsDone) return;
      const teachers: User[] = (this.data.users as User[]).filter(u => u.role === 'TEACHER');
      const categories = ['Technology', 'Arts', 'Academic', 'Sports', 'Community Service'];
      const logos = [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop'
      ];
      const covers = [
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=300&fit=crop',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=300&fit=crop',
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?w=800&h=300&fit=crop'
      ];

      teachers.forEach((t, idxT) => {
        const assigned = this.getClubsByAdvisor(t.id);
        for (let i = assigned.length; i < minPerTeacher; i += 1) {
          const idx = (idxT + i) % categories.length;
          this.createClub({
            name: `${t.fullName.split(' ')[0]}'s ${categories[idx]} Club ${i + 1}`,
            description: `A ${categories[idx]} focused club led by ${t.fullName}.`,
            logoUrl: logos[idx % logos.length],
            coverImageUrl: covers[idx % covers.length],
            category: categories[idx],
            status: 'ACTIVE',
            advisorId: t.id,
            isApproved: true,
            memberCount: 0,
            documents: [],
            gallery: []
          });
        }
      });

      this.data.__seedTeacherClubsDone = true;
      this.persist();
    } catch {
      // ignore
    }
  }

  // Ensure each student has at least one approved and one pending membership (to different clubs if possible)
  private seedStudentMemberships(): void {
    try {
      if (this.data.__seedStudentMembershipsDone) return;
      const students: User[] = (this.data.users as User[]).filter(u => u.role === 'STUDENT');
      const clubs: Club[] = this.getAllClubs();
      if (clubs.length === 0) return;
      const defaultGradeId = (this.data.grades && this.data.grades[0]?.id) || 'grade-12';

      students.forEach((s, idxS) => {
        const ms = this.getMembershipsByUser(s.id);
        const hasApproved = ms.some(m => m.status === 'APPROVED');
        const hasPending = ms.some(m => m.status === 'PENDING');
        const approvedClubId = hasApproved ? ms.find(m => m.status === 'APPROVED')!.clubId : clubs[idxS % clubs.length].id;
        if (!hasApproved) {
          this.createMembership({
            userId: s.id,
            clubId: approvedClubId,
            role: 'MEMBER',
            status: 'APPROVED',
            gradeId: defaultGradeId
          });
        }
        if (!hasPending) {
          // choose a different club when possible
          const otherClub = clubs.find(c => c.id !== approvedClubId) || clubs[0];
          this.createMembership({
            userId: s.id,
            clubId: otherClub.id,
            role: 'MEMBER',
            status: 'PENDING',
            gradeId: defaultGradeId
          });
        }
      });

      this.data.__seedStudentMembershipsDone = true;
      this.persist();
    } catch {
      // ignore
    }
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

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.data.users.findIndex((user: User) => user.id === id);
    if (userIndex === -1) return null;

    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return this.data.users[userIndex];
  }

  deleteUser(id: string): boolean {
    const userIndex = this.data.users.findIndex((user: User) => user.id === id);
    if (userIndex === -1) return false;

    // Remove the user
    this.data.users.splice(userIndex, 1);

    // Clean up related data: memberships
    this.data.memberships = this.data.memberships.filter(
      (membership: Membership) => membership.userId !== id
    );

    // Clean up related data: event attendees
    this.data.eventAttendees = this.data.eventAttendees.filter(
      (attendee: EventAttendee) => attendee.userId !== id
    );

    // Unassign as advisor from clubs
    this.data.clubs = this.data.clubs.map((club: Club) =>
      club.advisorId === id ? { ...club, advisorId: '' } : club
    );

    this.persist();
    return true;
  }

  // Club Management
  // Legacy alias used by some components
  getClubs(): Club[] {
    return this.getAllClubs();
  }

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
    this.persist();
    // Notifications: new club added -> notify admins
    try {
      this.notifyAdmins(`New club added: ${newClub.name}.`, 'ANNOUNCEMENT');
    } catch {}
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

    this.persist();
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

    this.persist();
    return true;
  }

  approveClub(id: string): Club | null {
    const updated = this.updateClub(id, { isApproved: true, status: 'ACTIVE' });
    this.persist();
    return updated;
  }

  assignAdvisor(clubId: string, advisorId: string): Club | null {
    const updated = this.updateClub(clubId, { advisorId });
    this.persist();
    // Notify advisor about assignment
    try {
      if (updated) {
        this.createNotification({
          userId: advisorId,
          message: `You have been assigned as advisor to ${updated.name}.`,
          type: 'ANNOUNCEMENT',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch {}
    return updated;
  }

  getTeachers(): User[] {
    return this.data.users.filter((user: User) => user.role === 'TEACHER');
  }

  // Event Management
  // Legacy alias used by some components
  getEvents(): Event[] {
    return this.getAllEvents();
  }

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
    this.persist();
    // Notifications: new event
    try {
      const club = this.getClubById(newEvent.clubId);
      const clubName = club?.name || 'Club';
      this.notifyClubMembers(newEvent.clubId, `New event: ${newEvent.title} by ${clubName}.`, 'EVENT');
      if (club?.advisorId) {
        this.createNotification({
          userId: club.advisorId,
          message: `New event created in ${clubName}: ${newEvent.title}.`,
          type: 'EVENT',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch {}
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

    this.persist();
    // Notifications: event update
    try {
      const updatedEvent = this.data.events[eventIndex] as Event;
      const club = this.getClubById(updatedEvent.clubId);
      const clubName = club?.name || 'Club';
      this.notifyClubMembers(updatedEvent.clubId, `Event updated: ${updatedEvent.title} (${clubName}).`, 'EVENT');
      if (club?.advisorId) {
        this.createNotification({
          userId: club.advisorId,
          message: `Event updated in ${clubName}: ${updatedEvent.title}.`,
          type: 'EVENT',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch {}
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

    this.persist();
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

    this.persist();
    // Notifications: join request
    try {
      const clubRef = this.getClubById(newMembership.clubId);
      const userRef = this.getUserById(newMembership.userId);
      const clubName = clubRef?.name || 'Club';
      const userName = userRef?.fullName || 'A student';

      // Notify all admins
      this.notifyAdmins(`${userName} requested to join ${clubName}.`, 'ANNOUNCEMENT');

      // Notify advisor, if any
      if (clubRef?.advisorId) {
        this.createNotification({
          userId: clubRef.advisorId,
          message: `${userName} requested to join ${clubName}.`,
          type: 'ANNOUNCEMENT',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      // Notify the requester
      this.createNotification({
        userId: newMembership.userId,
        message: `Your request to join ${clubName} has been submitted and is pending approval.`,
        type: 'ANNOUNCEMENT',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch {}
    return newMembership;
  }

  updateMembership(id: string, updates: Partial<Membership>): Membership | null {
    const membershipIndex = this.data.memberships.findIndex((membership: Membership) => membership.id === id);
    if (membershipIndex === -1) return null;

    const currentMembership = this.data.memberships[membershipIndex];

    // Ensure unique leadership roles per club: PRESIDENT, VICE_PRESIDENT, SECRETARY
    if (updates.role && ['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY'].includes(updates.role)) {
      const targetRole = updates.role;
      const targetClubId = currentMembership.clubId;
      this.data.memberships = this.data.memberships.map((m: Membership) => {
        if (m.clubId === targetClubId && m.role === targetRole && m.id !== id) {
          return { ...m, role: 'MEMBER' } as Membership;
        }
        return m;
      });
    }

    this.data.memberships[membershipIndex] = {
      ...currentMembership,
      ...updates
    };

    this.persist();
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

    this.persist();
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
    this.persist();
    return newAttendee;
  }

  updateEventAttendee(id: string, updates: Partial<EventAttendee>): EventAttendee | null {
    const attendeeIndex = this.data.eventAttendees.findIndex((attendee: EventAttendee) => attendee.id === id);
    if (attendeeIndex === -1) return null;

    this.data.eventAttendees[attendeeIndex] = {
      ...this.data.eventAttendees[attendeeIndex],
      ...updates
    };

    this.persist();
    return this.data.eventAttendees[attendeeIndex];
  }

  // Utility Methods
  getData(): any {
    return this.data;
  }

  getDataJSON(pretty: boolean = true): string {
    return JSON.stringify(this.data, pretty ? null : undefined, pretty ? 2 : undefined);
  }

  exportDataToFile(filename: string = 'app-data.json'): void {
    try {
      const json = this.getDataJSON(true);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data JSON:', e);
    }
  }

  importDataFromJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      this.data = parsed;
      this.persist();
      return true;
    } catch (e) {
      console.error('Failed to import data JSON:', e);
      return false;
    }
  }

  resetData(): void {
    this.data = JSON.parse(JSON.stringify(sampleData));
    this.persist();
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

  // Notifications (used by some components)
  createNotification(notificationData: {
    userId: string;
    message: string;
    type: 'ANNOUNCEMENT' | 'EVENT' | 'BADGE' | 'OTHER' | string;
    isRead: boolean;
    createdAt: string;
  }): { id: string } & typeof notificationData {
    const newNotification = {
      id: `notification-${Date.now()}`,
      ...notificationData
    };
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.push(newNotification);
    this.persist();
    return newNotification;
  }

  getNotificationsByUser(userId: string) {
    return (this.data.notifications || [])
      .filter((n: any) => n.userId === userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getUnreadNotificationsCount(userId: string): number {
    return (this.data.notifications || []).filter((n: any) => n.userId === userId && !n.isRead).length;
  }

  markNotificationRead(notificationId: string): boolean {
    const idx = (this.data.notifications || []).findIndex((n: any) => n.id === notificationId);
    if (idx === -1) return false;
    this.data.notifications[idx].isRead = true;
    this.persist();
    return true;
  }

  markAllNotificationsRead(userId: string): void {
    (this.data.notifications || []).forEach((n: any) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.persist();
  }

  notifyAdmins(message: string, type: string = 'OTHER'): void {
    const admins = (this.data.users || []).filter((u: User) => u.role === 'ADMIN');
    const now = new Date().toISOString();
    admins.forEach((admin: User) => this.createNotification({ userId: admin.id, message, type, isRead: false, createdAt: now }));
  }

  notifyClubMembers(clubId: string, message: string, type: string = 'EVENT'): void {
    const approvedMemberships = (this.data.memberships || []).filter((m: Membership) => m.clubId === clubId && m.status === 'APPROVED');
    const now = new Date().toISOString();
    approvedMemberships.forEach((m: Membership) => this.createNotification({ userId: m.userId, message, type, isRead: false, createdAt: now }));
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;