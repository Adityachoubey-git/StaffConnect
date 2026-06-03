import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, CheckCircle, XCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect(user.role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/user/dashboard')
  }

  // Fetch stats
  const pendingLeaves = await prisma.leave.count({
    where: { status: 'PENDING' },
  })

  const approvedLeaves = await prisma.leave.count({
    where: { status: 'APPROVED' },
  })

  const rejectedLeaves = await prisma.leave.count({
    where: { status: 'REJECTED' },
  })

  // Fetch active users count (excluding SUPER_ADMIN and current admin)
  const activeUsers = await prisma.user.count({
    where: {
      isActive: true,
      role: { not: 'SUPER_ADMIN' },
      id: { not: user.id }
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage leave requests and view team overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
            <FileText className="h-5 w-5 text-[#F59E0B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pendingLeaves}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
            <CheckCircle className="h-5 w-5 text-[#22C55E]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{approvedLeaves}</div>
            <p className="text-xs text-slate-500 mt-1">Total approved</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Rejected</CardTitle>
            <XCircle className="h-5 w-5 text-[#EF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{rejectedLeaves}</div>
            <p className="text-xs text-slate-500 mt-1">Total rejected</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
            <Users className="h-5 w-5 text-[#3274D5]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{activeUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <a
              href="/admin/leave-approval"
              className="block p-3 rounded-md hover:bg-slate-50 transition-colors"
            >
              <div className="font-medium">Review Leave Requests</div>
              <div className="text-sm text-slate-500">
                {pendingLeaves} pending request{pendingLeaves !== 1 ? 's' : ''} awaiting your review
              </div>
            </a>
            <a
              href="/admin/users"
              className="block p-3 rounded-md hover:bg-slate-50 transition-colors"
            >
              <div className="font-medium">View Team Members</div>
              <div className="text-sm text-slate-500">See all active users in the system</div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
