'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('An unexpected error occurred. Please try again.')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password.')
      }

      // Role-based routing
      if (data.user.role === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard')
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/user/dashboard')
      }

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="h-screen w-screen bg-white flex overflow-hidden font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[450px] space-y-8">

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/images/logo.png" alt="StaffConnect Logo" className="h-8 w-auto object-contain" />
              <span className="font-bold tracking-tight text-xl text-slate-900">
                Staff<span className="text-[#3274D5] ml-0.5">Connect</span>
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@ems.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 border-slate-200 focus:border-[#3274D5] focus:ring-[#3274D5]/10 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 border-slate-200 focus:border-[#3274D5] focus:ring-[#3274D5]/10 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="py-2.5 px-3 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#3274D5] hover:bg-[#163A60] text-white font-medium transition-all shadow-sm cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Section - Visual Overlay */}
      <div className="hidden lg:flex flex-1 relative bg-slate-50">
        <Image
          src="/images/login.jpg"
          alt="Office Environment"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Subtle, professional overlay with corporate gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1F33]/90 via-[#0F2B48]/80 to-[#3274D5]/60 backdrop-blur-[1px]" />

        <div className="relative z-20 flex flex-col justify-end p-16 w-full h-full text-white">
          <div className="max-w-md space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Manage your workforce <br />
              <span className="text-[#42C6FF]">with ease.</span>
            </h2>
            <p className="text-slate-200 leading-relaxed">
              Our central hub for employee management helps you track performance,
              manage leave requests, and stay connected with your team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}