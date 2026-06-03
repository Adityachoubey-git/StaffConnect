'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LeaveCard } from '@/components/leaves/leave-card'
import { LeaveQuotaDisplay } from '@/components/leaves/leave-quota-display'
import { Plus, Loader2 } from 'lucide-react'
import { Leave, LeaveQuotaInfo } from '@/types'

export default function UserLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [quota, setQuota] = useState<LeaveQuotaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    fetchLeaves()
    fetchQuota()
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await fetch('/api/leaves')
      if (response.ok) {
        const data = await response.json()
        setLeaves(data.leaves)
      }
    } catch (error) {
      console.error('Error fetching leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuota = async () => {
    try {
      const sessionResponse = await fetch('/api/auth/session')
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        const quotaResponse = await fetch(`/api/quota/${sessionData.user.id}`)
        if (quotaResponse.ok) {
          const quotaData = await quotaResponse.json()
          setQuota(quotaData.quota)
        }
      }
    } catch (error) {
      console.error('Error fetching quota:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit leave request')
      }

      setSuccess('Leave request submitted successfully!')
      setFormData({ startDate: '', endDate: '', reason: '' })
      setShowForm(false)
      fetchLeaves()
      fetchQuota()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return

    try {
      const response = await fetch(`/api/leaves/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchLeaves()
        fetchQuota()
      }
    } catch (error) {
      console.error('Error deleting leave:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Leaves</h1>
          <p className="text-gray-500 mt-1">Manage your leave requests</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-[#3274D5] hover:bg-[#163A60] text-white cursor-pointer">
          <Plus className="h-4 w-4" />
          Apply for Leave
        </Button>
      </div>

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-md">
          {success}
        </div>
      )}

      {/* Apply Leave Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Apply for Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for leave"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  disabled={submitting}
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leave Quota */}
      {quota && (
        <div className="max-w-md">
          <LeaveQuotaDisplay quota={quota} />
        </div>
      )}

      {/* Leave History */}
      <div>
        <h2 className="text-lg font-medium mb-4">Leave History</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : leaves.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No leave requests yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leaves.map((leave) => (
              <LeaveCard key={leave.id} leave={leave} onDelete={handleDelete} showUser={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
