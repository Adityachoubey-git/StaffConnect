'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types'
import { Loader2, Edit } from 'lucide-react'

export default function SuperAdminQuotaPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [quotaForm, setQuotaForm] = useState({
    baseLeaveQuota: 0,
    extraLeaveQuota: 0,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?activeOnly=true&excludeRole=SUPER_ADMIN')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditQuota = (user: User) => {
    setEditingUser(user)
    setQuotaForm({
      baseLeaveQuota: user.baseLeaveQuota,
      extraLeaveQuota: user.extraLeaveQuota,
    })
    setShowEditDialog(true)
  }

  const handleUpdateQuota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setSubmitting(true)

    try {
      const response = await fetch(`/api/quota/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotaForm),
      })

      if (response.ok) {
        setShowEditDialog(false)
        setEditingUser(null)
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating quota:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Super Admin</Badge>
      case 'ADMIN':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">User</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Leave Quota Management</h1>
        <p className="text-slate-500 mt-1">Set and manage leave quotas for other users</p>
      </div>

      {/* Edit Dialog */}
      {editingUser && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Leave Quota</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateQuota} className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <Input value={editingUser.name || editingUser.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseQuota">Base Leave Quota (days)</Label>
                <Input
                  id="baseQuota"
                  type="number"
                  min="0"
                  placeholder="Enter base quota"
                  value={quotaForm.baseLeaveQuota}
                  onChange={(e) =>
                    setQuotaForm({ ...quotaForm, baseLeaveQuota: parseInt(e.target.value) || 0 })
                  }
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extraQuota">Extra Leave Quota (days)</Label>
                <Input
                  id="extraQuota"
                  type="number"
                  min="0"
                  placeholder="Enter extra quota"
                  value={quotaForm.extraLeaveQuota}
                  onChange={(e) =>
                    setQuotaForm({ ...quotaForm, extraLeaveQuota: parseInt(e.target.value) || 0 })
                  }
                  required
                  disabled={submitting}
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Total Quota: <span className="font-medium">{quotaForm.baseLeaveQuota + quotaForm.extraLeaveQuota} days</span>
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Quota'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Users List */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{user.name || user.email}</CardTitle>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Quota:</span>
                    <span className="font-medium">{user.baseLeaveQuota} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extra Quota:</span>
                    <span className="font-medium">{user.extraLeaveQuota} days</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-900 font-medium">Total:</span>
                    <span className="font-semibold">{user.baseLeaveQuota + user.extraLeaveQuota} days</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleEditQuota(user)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Quota
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
