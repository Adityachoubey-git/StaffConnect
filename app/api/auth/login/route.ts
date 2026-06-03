import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('=== Login attempt started ===')
    const { email, password } = await request.json()

    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    console.log('Creating Supabase client...')
    const supabase = await createClient()

    // Sign in with Supabase Auth
    console.log('Attempting Supabase auth for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase auth error:', error.message)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!data.user) {
      console.log('No user data returned from Supabase')
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    console.log('User authenticated, User ID:', data.user.id)

    // Fetch user profile from database
    console.log('Fetching profile from database...')
    const profile = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    })

    if (!profile) {
      console.error('❌ User profile not found in database for ID:', data.user.id)
      console.error('Please run this SQL in Supabase:')
      console.error(`INSERT INTO users (id, email, name, role, "isActive", "baseLeaveQuota", "extraLeaveQuota") VALUES ('${data.user.id}', '${email}', 'Super Admin', 'SUPER_ADMIN', true, 20, 0);`)
      return NextResponse.json({
        error: 'User profile not found in database. Please contact administrator.',
        userId: data.user.id
      }, { status: 404 })
    }

    if (!profile.isActive) {
      console.log('User account is inactive:', profile.email)
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Your account has been deactivated' }, { status: 403 })
    }

    console.log('✅ Login successful for:', profile.email, 'Role:', profile.role)
    return NextResponse.json({
      user: profile,
      message: 'Login successful',
    })
  } catch (error: any) {
    console.error('❌ Login error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json({
      error: 'An error occurred during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
