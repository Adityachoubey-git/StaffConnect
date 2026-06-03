import { requireRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET user by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireRole(['ADMIN', 'SUPER_ADMIN'])

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        baseLeaveQuota: true,
        extraLeaveQuota: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Get user error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// PATCH - Update user (soft delete, role assignment, quota management)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const body = await request.json()
    const { isActive, role, baseLeaveQuota, extraLeaveQuota, name } = body

    const updateData: any = {}

    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (role) updateData.role = role
    if (typeof baseLeaveQuota === 'number') updateData.baseLeaveQuota = baseLeaveQuota
    if (typeof extraLeaveQuota === 'number') updateData.extraLeaveQuota = extraLeaveQuota
    if (name !== undefined) updateData.name = name

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        baseLeaveQuota: true,
        extraLeaveQuota: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser, message: 'User updated successfully' })
  } catch (error: any) {
    console.error('Update user error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred while updating user' }, { status: 500 })
  }
}
