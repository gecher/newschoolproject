export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'
export type ClubStatus = 'ACTIVE' | 'INACTIVE'
export type MembershipRole = 'MEMBER' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'SECRETARY' | 'CAPTAIN'
export type MembershipStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type RSVPStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CHECKED_IN'
export type AnnouncementTarget = 'GLOBAL' | 'CLUB'
export type Visibility = 'PUBLIC' | 'MEMBERS_ONLY'
export type NotificationType = 'ANNOUNCEMENT' | 'EVENT' | 'OTHER'
export type FileType = 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO'

export interface User {
  id: string
  fullName: string
  email: string
  password: string
  role: Role
  phone?: string
  profilePhoto?: string
  coverPhoto?: string
  bio?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Grade {
  id: string
  name: string
  startYear?: number
  endYear?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface UserGrade {
  id: string
  userId: string
  gradeId: string
  startDate: string
  endDate?: string
}

export interface Club {
  id: string
  name: string
  description: string
  logoUrl?: string
  coverImageUrl?: string
  category?: string
  status: ClubStatus
  advisorId: string
  isApproved?: boolean
  memberCount?: number
  documents?: ClubDocument[]
  gallery?: ClubImage[]
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ClubDocument {
  id: string
  name: string
  url: string
  type: FileType
  size: number
  uploadedBy: string
  uploadedAt: string
}

export interface ClubImage {
  id: string
  url: string
  caption?: string
  uploadedBy: string
  uploadedAt: string
}

export interface Membership {
  id: string
  userId: string
  clubId: string
  role: MembershipRole
  status: MembershipStatus
  gradeId: string
  joinedAt: string
  startDate: string
  endDate?: string
  deletedAt?: string
}

export interface Event {
  id: string
  clubId: string
  title: string
  description?: string
  location?: string
  date: string
  imageUrl?: string
  documents?: EventDocument[]
  rsvpLimit?: number
  createdBy?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface EventDocument {
  id: string
  name: string
  url: string
  type: FileType
  size: number
  uploadedBy: string
  uploadedAt: string
}

export interface EventAttendee {
  id: string
  eventId: string
  userId: string
  rsvpStatus: RSVPStatus
  checkedIn: boolean
}

export interface Announcement {
  id: string
  title: string
  content: string
  clubId?: string
  target: AnnouncementTarget
  imageUrl?: string
  attachments?: AnnouncementAttachment[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AnnouncementAttachment {
  id: string
  name: string
  url: string
  type: FileType
  size: number
  uploadedAt: string
}



export interface Notification {
  id: string
  userId: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export interface UploadedFile {
  id: string
  name: string
  url: string
  type: FileType
  size: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
}