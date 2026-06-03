'use client'

import { useState, useEffect } from 'react'
import { LeaveCard } from '@/components/leaves/leave-card'
import { Card, CardContent } from '@/components/ui/card'
import { Leave } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminLeaveApprovalPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  useEffect(() => {
    fetchLeaves()
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

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (response.ok) {
        fetchLeaves()
      }
    } catch (error) {
      console.error('Error approving leave:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (response.ok) {
        fetchLeaves()
      }
    } catch (error) {
      console.error('Error rejecting leave:', error)
    }
  }

  const filteredLeaves = filter === 'all' ? leaves : leaves.filter((l) => l.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Leave Approval</h1>
        <p className="text-gray-500 mt-1">Review and manage leave requests</p>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'PENDING' | 'APPROVED' | 'REJECTED')}>
        <TabsList>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filteredLeaves.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No {filter !== 'all' ? filter.toLowerCase() : ''} leave requests
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLeaves.map((leave) => (
                <LeaveCard
                  key={leave.id}
                  leave={leave}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  showActions={true}
                  showUser={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
