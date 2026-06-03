import { requireAuth, requireRole } from '@/lib/auth'
import { calculateLeaveQuota } from '@/lib/leave-calculations'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET user's leave quota
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const currentUser = await requireAuth()

    // Users can only view their own quota, admins can view any
    if (currentUser.role === 'USER' && currentUser.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const quotaInfo = await calculateLeaveQuota(userId)

    return NextResponse.json({ quota: quotaInfo })
  } catch (error: any) {
    console.error('Get quota error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// PATCH - Update leave quotas (Super Admin only)
export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    await requireRole(['SUPER_ADMIN'])

    const { baseLeaveQuota, extraLeaveQuota } = await request.json()

    const updateData: any = {}
    if (typeof baseLeaveQuota === 'number') updateData.baseLeaveQuota = baseLeaveQuota
    if (typeof extraLeaveQuota === 'number') updateData.extraLeaveQuota = extraLeaveQuota

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        baseLeaveQuota: true,
        extraLeaveQuota: true,
      },
    })

    return NextResponse.json({ user, message: 'Leave quota updated successfully' })
  } catch (error: any) {
    console.error('Update quota error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred while updating quota' }, { status: 500 })
  }
}
