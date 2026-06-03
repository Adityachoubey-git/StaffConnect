import { requireRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET all users (with optional filters)
export async function GET(request: Request) {
  try {
    const user = await requireRole(['ADMIN', 'SUPER_ADMIN', 'USER'])

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const role = searchParams.get('role')
    const excludeRole = searchParams.get('excludeRole')
    const excludeUserId = searchParams.get('excludeUserId')

    // Build where clause based on filters
    const whereClause: any = {}

    if (activeOnly) {
      whereClause.isActive = true
    }

    if (role) {
      whereClause.role = role
    }

    if (excludeRole) {
      whereClause.role = { not: excludeRole }
    }

    if (excludeUserId) {
      whereClause.id = { not: excludeUserId }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Get users error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// POST - Create new user (Admin and Super Admin)
export async function POST(request: Request) {
  try {
    const user = await requireRole(['ADMIN', 'SUPER_ADMIN'])

    const { email, password, name, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Admins can only create USER role accounts
    // Super Admins can create any role
    if (user.role === 'ADMIN' && role !== 'USER') {
      return NextResponse.json(
        { error: 'Admins can only create users with USER role' },
        { status: 403 }
      )
    }

    // Create user in Supabase Auth using admin client
    const supabase = createAdminClient()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user in authentication system' },
        { status: 400 }
      )
    }

    // Create user profile in database
    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name: name || null,
        role: role || 'USER',
        isActive: true,
        baseLeaveQuota: 20,
        extraLeaveQuota: 0,
      },
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

    return NextResponse.json({ user: newUser, message: 'User created successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Create user error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'An error occurred while creating user' }, { status: 500 })
  }
}
