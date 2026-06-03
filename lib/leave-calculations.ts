import prisma from '@/lib/prisma'
import { differenceInDays } from 'date-fns'
import { LeaveQuotaInfo } from '@/types'

export async function calculateLeaveQuota(userId: string): Promise<LeaveQuotaInfo> {
  // Get user's quota
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      baseLeaveQuota: true,
      extraLeaveQuota: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const totalQuota = user.baseLeaveQuota + user.extraLeaveQuota

  // Calculate used quota from approved leaves
  const approvedLeaves = await prisma.leave.findMany({
    where: {
      userId,
      status: 'APPROVED',
    },
    select: {
      startDate: true,
      endDate: true,
    },
  })

  const usedQuota = approvedLeaves.reduce((total, leave) => {
    const days = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1
    return total + days
  }, 0)

  const remainingQuota = totalQuota - usedQuota

  return {
    totalQuota,
    usedQuota,
    remainingQuota,
    baseQuota: user.baseLeaveQuota,
    extraQuota: user.extraLeaveQuota,
  }
}

export function calculateLeaveDays(startDate: Date, endDate: Date): number {
  return differenceInDays(new Date(endDate), new Date(startDate)) + 1
}

export async function validateLeaveRequest(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ valid: boolean; error?: string }> {
  // Check if dates are valid
  if (startDate > endDate) {
    return { valid: false, error: 'Start date must be before end date' }
  }

  // Check if dates are in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (startDate < today) {
    return { valid: false, error: 'Cannot apply for leave in the past' }
  }

  // Calculate days requested
  const daysRequested = calculateLeaveDays(startDate, endDate)

  // Get remaining quota
  const quotaInfo = await calculateLeaveQuota(userId)

  if (daysRequested > quotaInfo.remainingQuota) {
    return {
      valid: false,
      error: `Insufficient leave quota. You have ${quotaInfo.remainingQuota} days remaining but requested ${daysRequested} days.`,
    }
  }

  return { valid: true }
}
