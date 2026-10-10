'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000 // 15 minutes

export default function AutoLogoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.error('Session expired due to inactivity. Please log in again.')
      router.push('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }, [router])

  useEffect(() => {
    // Only track inactivity on secure portal pages
    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/submit-project')) {
      return
    }

    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        handleLogout()
      }, INACTIVITY_LIMIT_MS)
    }

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']
    
    events.forEach(event => window.addEventListener(event, resetTimer))
    resetTimer() // Initialize timer

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [pathname, handleLogout])

  return <>{children}</>
}
