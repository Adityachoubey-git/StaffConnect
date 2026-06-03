import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, UserPlus, Settings } from 'lucide-react'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function SuperAdminDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect(user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard')
  }

  // Fetch stats
  const totalUsers = await prisma.user.count({
    where: { id: { not: user.id } }
  })
  const activeUsers = await prisma.user.count({
    where: {
      isActive: true,
      id: { not: user.id }
    }
  })
  const pendingLeaves = await prisma.leave.count({ where: { status: 'PENDING' } })
  const totalLeaves = await prisma.leave.count()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Super Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Complete system overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <Users className="h-5 w-5 text-[#3274D5]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">{activeUsers} active</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
            <UserPlus className="h-5 w-5 text-[#22C55E]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{activeUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Leaves</CardTitle>
            <FileText className="h-5 w-5 text-[#F59E0B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pendingLeaves}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Leaves</CardTitle>
            <Settings className="h-5 w-5 text-[#8B5CF6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalLeaves}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <a
              href="/super-admin/users"
              className="block p-4 rounded-md border hover:bg-slate-50 transition-colors"
            >
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-slate-500 mt-1">
                Add, edit, or deactivate users and assign roles
              </div>
            </a>
            <a
              href="/super-admin/leave-approval"
              className="block p-4 rounded-md border hover:bg-slate-50 transition-colors"
            >
              <div className="font-medium">Review Leaves</div>
              <div className="text-sm text-slate-500 mt-1">
                {pendingLeaves} pending request{pendingLeaves !== 1 ? 's' : ''} awaiting review
              </div>
            </a>
            <a
              href="/super-admin/quota"
              className="block p-4 rounded-md border hover:bg-slate-50 transition-colors"
            >
              <div className="font-medium">Manage Quotas</div>
              <div className="text-sm text-slate-500 mt-1">
                Set and adjust leave quotas for users
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
