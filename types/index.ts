// Enums matching Prisma schema
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string
  email: string
  name: string | null
  role: Role
  isActive: boolean
  baseLeaveQuota: number
  extraLeaveQuota: number
  createdAt: Date
  updatedAt: Date
}

export interface Leave {
  id: string
  startDate: Date
  endDate: Date
  reason: string | null
  status: LeaveStatus
  userId: string
  user?: User
  createdAt: Date
  updatedAt: Date
}

export interface LeaveQuotaInfo {
  totalQuota: number
  usedQuota: number
  remainingQuota: number
  baseQuota: number
  extraQuota: number
}

export interface UpcomingLeave {
  id: string
  userName: string
  startDate: Date
  endDate: Date
  reason: string | null
}

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: Role
  isActive: boolean
}
