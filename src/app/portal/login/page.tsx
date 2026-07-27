'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { Cloud, Lock, Mail, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function InternLoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    registration_number: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/portal/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      toast.success('Login successful!')
      router.push('/portal/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('/grid.svg')] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20">
            <Cloud className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
          Student Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Enter your Email and Registration Number to check your status.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-white">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@university.edu"
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number" className="text-sm font-bold text-slate-700">Registration Number</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="registration_number"
                  type="text"
                  required
                  placeholder="CX-INT-2026-PY-001"
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white uppercase"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({...formData, registration_number: e.target.value.toUpperCase()})}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 group"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : (
                <>
                  Access Portal
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don&apos;t have a registration number?{' '}
              <Link href="/portal/register" className="text-blue-600 font-bold hover:text-blue-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
