import { requireAuth, requireRole, getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { validateLeaveRequest } from '@/lib/leave-calculations'

// GET all leaves (filtered by user role)
export async function GET(request: Request) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let whereClause: any = {}

    // Users can only see their own leaves
    if (user.role === 'USER') {
      whereClause.userId = user.id
    }

    // Filter by status if provided
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      whereClause.status = status
    }

    const leaves = await prisma.leave.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ leaves })
  } catch (error: any) {
    console.error('Get leaves error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// POST - Apply for leave (Users only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only users can apply for leave
    if (user.role !== 'USER') {
      return NextResponse.json(
        { error: 'Only users can apply for leave. Admins and Super Admins cannot apply for leave.' },
        { status: 403 }
      )
    }

    const { startDate, endDate, reason } = await request.json()

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate leave request
    const validation = await validateLeaveRequest(user.id, start, end)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Create leave request
    const leave = await prisma.leave.create({
      data: {
        userId: user.id,
        startDate: start,
        endDate: end,
        reason: reason || null,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ leave, message: 'Leave request submitted successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Create leave error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred while creating leave request' }, { status: 500 })
  }
}
