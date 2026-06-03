'use client'

import { useState, useEffect } from 'react'
import { UserTable } from '@/components/users/user-table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { User } from '@/types'

export default function UserTeamPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      // Get current user info
      const currentUserResponse = await fetch('/api/auth/me')
      const currentUserData = await currentUserResponse.json()
      const currentUserId = currentUserData?.user?.id

      const response = await fetch(
        `/api/users?activeOnly=true&role=USER&excludeUserId=${currentUserId || ''}`
      )
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setFilteredUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Team</h1>
        <p className="text-gray-500 mt-1">View all active team members</p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <UserTable users={filteredUsers} showEditOptions={false} />
      )}
    </div>
  )
}
