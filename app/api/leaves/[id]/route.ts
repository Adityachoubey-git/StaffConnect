import { requireRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// PATCH - Update leave status (approve/reject)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await requireRole(['ADMIN', 'SUPER_ADMIN'])

    const { status } = await request.json()

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be APPROVED or REJECTED' }, { status: 400 })
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: { status },
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

    return NextResponse.json({ leave, message: `Leave request ${status.toLowerCase()} successfully` })
  } catch (error: any) {
    console.error('Update leave error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred while updating leave request' }, { status: 500 })
  }
}

// DELETE - Delete leave request
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await requireRole(['USER', 'ADMIN', 'SUPER_ADMIN'])

    const leave = await prisma.leave.findUnique({
      where: { id },
    })

    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    // Users can only delete their own pending leave requests
    if (user.role === 'USER' && (leave.userId !== user.id || leave.status !== 'PENDING')) {
      return NextResponse.json(
        { error: 'You can only delete your own pending leave requests' },
        { status: 403 }
      )
    }

    await prisma.leave.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Leave request deleted successfully' })
  } catch (error: any) {
    console.error('Delete leave error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred while deleting leave request' }, { status: 500 })
  }
}
