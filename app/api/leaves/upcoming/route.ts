import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { addDays, startOfDay } from 'date-fns'

export async function GET() {
  try {
    await requireAuth()

    const today = startOfDay(new Date())
    const nextWeek = addDays(today, 7)

    const upcomingLeaves = await prisma.leave.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          {
            startDate: {
              gte: today,
              lte: nextWeek,
            },
          },
          {
            AND: [
              {
                startDate: {
                  lte: today,
                },
              },
              {
                endDate: {
                  gte: today,
                },
              },
            ],
          },
        ],
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
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json({ leaves: upcomingLeaves })
  } catch (error: any) {
    console.error('Get upcoming leaves error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
