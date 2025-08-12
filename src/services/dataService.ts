import { 
  User, Club, Event, Membership, Announcement, Badge, UserBadge, 
  Forum, ForumPost, Notification, EventAttendee, Grade, UserGrade 
} from '../types';
import sampleData from '../data/sample-data.json';

class DataService {
  private data: any;
  private readonly STORAGE_KEY = 'school_app_data_v1';

  constructor() {
    // Initialize with sample data, but prefer persisted data from localStorage
    const persisted = this.safeGetFromStorage();
    this.data = persisted ?? { ...sampleData };
  }

  // Generic CRUD operations for JSON manipulation
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private safeGetFromStorage(): any | null {
    try {
      if (typeof window === 'undefined') return null;
      const raw = window.localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private persist(): void {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // ignore storage errors in sandboxed environments
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users.filter((user: User) => !user.deletedAt);
  }

  getCurrentUser(): User | null {
    // In a real app, this would get the current user from authentication context
    // For now, return the first user as a mock
    return this.data.users[0] || null;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((user: User) => user.id === id && !user.deletedAt);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((user: User) => user.email === email && !user.deletedAt);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
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
      updatedAt: this.getCurrentTimestamp()
    };
    this.persist();
    return this.data.users[userIndex];
  }

  deleteUser(id: string): boolean {
    const userIndex = this.data.users.findIndex((user: User) => user.id === id);
    if (userIndex === -1) return false;

    this.data.users[userIndex].deletedAt = this.getCurrentTimestamp();
    this.persist();
    return true;
  }

  // Clubs
  getClubs(): Club[] {
    return this.data.clubs.filter((club: Club) => !club.deletedAt);
  }

  getClubById(id: string): Club | undefined {
    return this.data.clubs.find((club: Club) => club.id === id && !club.deletedAt);
  }

  getClubsByCategory(category: string): Club[] {
    return this.data.clubs.filter((club: Club) => 
      club.category === category && !club.deletedAt
    );
  }

  getClubsByAdvisor(advisorId: string): Club[] {
    return this.data.clubs.filter((club: Club) => 
      club.advisorId === advisorId && !club.deletedAt
    );
  }

  createClub(clubData: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Club {
    const newClub: Club = {
      ...clubData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    this.data.clubs.push(newClub);
    this.persist();
    return newClub;
  }

  updateClub(id: string, updates: Partial<Club>): Club | null {
    const clubIndex = this.data.clubs.findIndex((club: Club) => club.id === id);
    if (clubIndex === -1) return null;

    this.data.clubs[clubIndex] = {
      ...this.data.clubs[clubIndex],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    this.persist();
    return this.data.clubs[clubIndex];
  }

  deleteClub(id: string): boolean {
    const clubIndex = this.data.clubs.findIndex((club: Club) => club.id === id);
    if (clubIndex === -1) return false;

    this.data.clubs[clubIndex].deletedAt = this.getCurrentTimestamp();
    this.persist();
    return true;
  }

  // Events
  getEvents(): Event[] {
    return this.data.events.filter((event: Event) => !event.deletedAt);
  }

  getEventById(id: string): Event | undefined {
    return this.data.events.find((event: Event) => event.id === id && !event.deletedAt);
  }

  getEventsByClub(clubId: string): Event[] {
    return this.data.events.filter((event: Event) => 
      event.clubId === clubId && !event.deletedAt
    );
  }

  getUpcomingEvents(): Event[] {
    const now = new Date();
    return this.data.events.filter((event: Event) => 
      new Date(event.date) > now && !event.deletedAt
    );
  }

  createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const newEvent: Event = {
      ...eventData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    this.data.events.push(newEvent);
    this.persist();
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const eventIndex = this.data.events.findIndex((event: Event) => event.id === id);
    if (eventIndex === -1) return null;

    this.data.events[eventIndex] = {
      ...this.data.events[eventIndex],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    this.persist();
    return this.data.events[eventIndex];
  }

  deleteEvent(id: string): boolean {
    const eventIndex = this.data.events.findIndex((event: Event) => event.id === id);
    if (eventIndex === -1) return false;

    this.data.events[eventIndex].deletedAt = this.getCurrentTimestamp();
    this.persist();
    return true;
  }

  // Memberships
  getMemberships(): Membership[] {
    return this.data.memberships.filter((membership: Membership) => !membership.deletedAt);
  }

  getMembershipsByUser(userId: string): Membership[] {
    return this.data.memberships.filter((membership: Membership) => 
      membership.userId === userId && !membership.deletedAt
    );
  }

  getMembershipsByClub(clubId: string): Membership[] {
    return this.data.memberships.filter((membership: Membership) => 
      membership.clubId === clubId && !membership.deletedAt
    );
  }

  createMembership(membershipData: Omit<Membership, 'id'>): Membership {
    const newMembership: Membership = {
      ...membershipData,
      id: this.generateId()
    };
    this.data.memberships.push(newMembership);
    this.persist();
    return newMembership;
  }

  updateMembership(id: string, updates: Partial<Membership>): Membership | null {
    const membershipIndex = this.data.memberships.findIndex((membership: Membership) => membership.id === id);
    if (membershipIndex === -1) return null;

    this.data.memberships[membershipIndex] = {
      ...this.data.memberships[membershipIndex],
      ...updates
    };
    this.persist();
    return this.data.memberships[membershipIndex];
  }

  deleteMembership(id: string): boolean {
    const membershipIndex = this.data.memberships.findIndex((membership: Membership) => membership.id === id);
    if (membershipIndex === -1) return false;

    this.data.memberships[membershipIndex].deletedAt = this.getCurrentTimestamp();
    this.persist();
    return true;
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  getAnnouncementsByClub(clubId: string): Announcement[] {
    return this.data.announcements.filter((announcement: Announcement) => 
      announcement.clubId === clubId
    );
  }

  getGlobalAnnouncements(): Announcement[] {
    return this.data.announcements.filter((announcement: Announcement) => 
      announcement.target === 'GLOBAL'
    );
  }

  createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Announcement {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    this.data.announcements.push(newAnnouncement);
    this.persist();
    return newAnnouncement;
  }

  updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const idx = this.data.announcements.findIndex((a: Announcement) => a.id === id);
    if (idx === -1) return null;
    this.data.announcements[idx] = {
      ...this.data.announcements[idx],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    this.persist();
    return this.data.announcements[idx];
  }

  deleteAnnouncement(id: string): boolean {
    const idx = this.data.announcements.findIndex((a: Announcement) => a.id === id);
    if (idx === -1) return false;
    this.data.announcements.splice(idx, 1);
    this.persist();
    return true;
  }

  // Event Attendees
  getEventAttendees(eventId: string): EventAttendee[] {
    return this.data.eventAttendees.filter((attendee: EventAttendee) => 
      attendee.eventId === eventId
    );
  }

  createEventAttendee(attendeeData: Omit<EventAttendee, 'id'>): EventAttendee {
    const newAttendee: EventAttendee = {
      ...attendeeData,
      id: this.generateId()
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

  // Badges
  getBadges(): Badge[] {
    return this.data.badges;
  }

  getUserBadges(userId: string): UserBadge[] {
    return this.data.userBadges.filter((userBadge: UserBadge) => 
      userBadge.userId === userId
    );
  }

  createBadge(badgeData: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>): Badge {
    const newBadge: Badge = {
      ...badgeData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    this.data.badges.push(newBadge);
    this.persist();
    return newBadge;
  }

  assignBadgeToUser(userId: string, badgeId: string): UserBadge {
    const newUserBadge: UserBadge = {
      id: this.generateId(),
      userId,
      badgeId,
      assignedAt: this.getCurrentTimestamp()
    };
    this.data.userBadges.push(newUserBadge);
    this.persist();
    return newUserBadge;
  }

  updateBadge(id: string, updates: Partial<Badge>): Badge | null {
    const idx = this.data.badges.findIndex((b: Badge) => b.id === id);
    if (idx === -1) return null;
    this.data.badges[idx] = {
      ...this.data.badges[idx],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    this.persist();
    return this.data.badges[idx];
  }

  deleteBadge(id: string): boolean {
    const idx = this.data.badges.findIndex((b: Badge) => b.id === id);
    if (idx === -1) return false;
    this.data.badges.splice(idx, 1);
    this.persist();
    return true;
  }

  // Forums
  getForums(): Forum[] {
    return this.data.forums;
  }

  getForumsByClub(clubId: string): Forum[] {
    return this.data.forums.filter((forum: Forum) => forum.clubId === clubId);
  }

  getForumPosts(forumId: string): ForumPost[] {
    return this.data.forumPosts.filter((post: ForumPost) => 
      post.forumId === forumId && !post.deletedAt
    );
  }

  createForumPost(postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt'>): ForumPost {
    const newPost: ForumPost = {
      ...postData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    this.data.forumPosts.push(newPost);
    this.persist();
    return newPost;
  }

  updateForumPost(id: string, updates: Partial<ForumPost>): ForumPost | null {
    const idx = this.data.forumPosts.findIndex((p: ForumPost) => p.id === id);
    if (idx === -1) return null;
    this.data.forumPosts[idx] = {
      ...this.data.forumPosts[idx],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    this.persist();
    return this.data.forumPosts[idx];
  }

  deleteForumPost(id: string): boolean {
    const idx = this.data.forumPosts.findIndex((p: ForumPost) => p.id === id);
    if (idx === -1) return false;
    this.data.forumPosts.splice(idx, 1);
    this.persist();
    return true;
  }

  // Notifications
  getUserNotifications(userId: string): Notification[] {
    return this.data.notifications.filter((notification: Notification) => 
      notification.userId === userId
    );
  }

  createNotification(notificationData: Omit<Notification, 'id'>): Notification {
    const newNotification: Notification = {
      ...notificationData,
      id: this.generateId()
    };
    this.data.notifications.push(newNotification);
    return newNotification;
  }

  markNotificationAsRead(id: string): boolean {
    const notificationIndex = this.data.notifications.findIndex((notification: Notification) => notification.id === id);
    if (notificationIndex === -1) return false;

    this.data.notifications[notificationIndex].isRead = true;
    return true;
  }

  // Search functionality
  searchClubs(query: string): Club[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.clubs.filter((club: Club) => 
      !club.deletedAt && (
        club.name.toLowerCase().includes(lowercaseQuery) ||
        club.description.toLowerCase().includes(lowercaseQuery) ||
        club.category?.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  searchEvents(query: string): Event[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.events.filter((event: Event) => 
      !event.deletedAt && (
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.description?.toLowerCase().includes(lowercaseQuery) ||
        event.location?.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  searchUsers(query: string): User[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.users.filter((user: User) => 
      !user.deletedAt && (
        user.fullName.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Analytics
  getClubAnalytics(clubId: string) {
    const club = this.getClubById(clubId);
    const memberships = this.getMembershipsByClub(clubId);
    const events = this.getEventsByClub(clubId);
    
    return {
      club,
      totalMembers: memberships.length,
      activeMembers: memberships.filter(m => m.status === 'APPROVED').length,
      pendingMembers: memberships.filter(m => m.status === 'PENDING').length,
      totalEvents: events.length,
      upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
      membershipGrowth: this.calculateMembershipGrowth(clubId)
    };
  }

  private calculateMembershipGrowth(clubId: string) {
    const memberships = this.getMembershipsByClub(clubId);
    const monthlyData: { [key: string]: number } = {};
    
    memberships.forEach(membership => {
      const month = new Date(membership.joinedAt).toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    return monthlyData;
  }

  // Export data for backup/reports
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  // Import data from backup
  importData(jsonData: string) {
    try {
      this.data = JSON.parse(jsonData);
      this.persist();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Convenience helpers for admin tools
  getAllData() {
    return { ...this.data };
  }

  resetToSampleData() {
    this.data = { ...sampleData };
    this.persist();
  }
}

export const dataService = new DataService();