'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Cloud, FileText, Download, CheckCircle2, Clock, XCircle, LogOut, Briefcase, LayoutDashboard, UserCircle, Menu } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

export default function StudentDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/portal/dashboard')
      if (res.status === 401) {
        router.push('/portal/login')
        return
      }
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      
      setData(json)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    document.cookie = "intern_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    toast.success('Logged out successfully')
    router.push('/portal/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { intern, documents, tasks } = data

  const renderStatusScreen = () => {
    if (!intern.status || intern.status === 'Pending' || intern.status === 'Under Review') {
      return (
        <Card className="max-w-lg mx-auto mt-20 p-8 text-center shadow-xl border-blue-100 bg-white">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Application Under Review</h2>
          <p className="text-slate-500 font-medium mb-6">
            Hello {intern.full_name}, your application for the {intern.domain} internship is currently being reviewed by our team. Please check back later.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-semibold text-slate-700">
            Registration Number: <span className="text-blue-600">{intern.registration_number}</span>
          </div>
        </Card>
      )
    }

    if (intern.status === 'Rejected') {
      return (
        <Card className="max-w-lg mx-auto mt-20 p-8 text-center shadow-xl border-red-100 bg-white">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Application Status Update</h2>
          <p className="text-slate-600 font-medium mb-4 leading-relaxed">
            Dear <strong>{intern.full_name}</strong>,
            <br/><br/>
            Thank you for applying to the <strong>{intern.domain}</strong> internship program at CloudExify. We sincerely appreciate the time and effort you invested in your application.
            <br/><br/>
            After careful review of your profile, we regret to inform you that we are unable to move forward with your application at this time. This was a difficult decision, as we received many highly qualified applications this cohort.
            <br/><br/>
            Please do not let this discourage you. We encourage you to continue developing your skills and hope you will re-apply for future opportunities with us. We wish you the absolute best in your professional journey!
          </p>
          <div className="text-xs text-slate-400 font-semibold border-t pt-4">
            CloudExify Talent Acquisition Team
          </div>
        </Card>
      )
    }

    // Accepted State
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="z-10 text-center md:text-left mb-6 md:mb-0">
            <Badge variant="blue" className="bg-white/20 text-white border-none mb-3 backdrop-blur-sm shadow-sm px-3 py-1 text-xs">
              {intern.batches?.name || 'Internship Program'}
            </Badge>
            <h1 className="text-3xl font-black tracking-tight mb-2">Welcome aboard, {intern.full_name}!</h1>
            <p className="text-blue-100 font-medium">Domain: {intern.domain} • Reg: {intern.registration_number}</p>
          </div>
          <div className="z-10 flex items-center bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/20">
            <CheckCircle2 className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-xs text-blue-100 font-bold uppercase tracking-wider">Status</p>
              <p className="text-lg font-black text-white">Accepted</p>
            </div>
          </div>
        </div>

        {/* Batch Status Alert */}
        {intern.batches && intern.batches.status === 'completed' && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center">
            <Clock className="w-5 h-5 text-amber-500 mr-3" />
            <p className="text-sm font-medium text-amber-800">
              Your internship batch has concluded. You can still download your final certificates and documents below.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tasks Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Your Monthly Tasks
            </h2>
            
            {tasks && tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task: any) => (
                  <Card key={task.id} className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="blue" className="mb-2 bg-blue-100 text-blue-800 font-bold">{task.duration_label}</Badge>
                        <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{task.description}</p>
                        
                        {task.file_url && (
                          <a href={task.file_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm font-bold text-blue-600 hover:underline">
                            View Attached Resource &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-slate-50">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Tasks Assigned Yet</h3>
                <p className="text-sm text-slate-500 mt-1">Your mentor will assign tasks for your batch shortly.</p>
              </Card>
            )}
          </div>

          {/* Documents Sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-emerald-600" />
              Official Documents
            </h2>
            
            <Card className="p-0 overflow-hidden divide-y divide-slate-100">
              <DocumentRow title="Offer Letter" url={documents?.offer_letter_url} />
              <DocumentRow title="Internship Certificate" url={documents?.certificate_url} />
              <DocumentRow title="Experience Letter" url={documents?.experience_certificate_url} />
              <DocumentRow title="Recommendation Letter" url={documents?.recommendation_letter_url} />
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              CloudExify<span className="text-blue-500 font-extrabold text-2xl ml-0.5">.</span>
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-4">Menu</div>
          
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false) }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false) }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <UserCircle className="w-5 h-5" />
            <span>My Profile</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
          <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-end items-center space-x-4">
            <span className="text-sm font-bold text-slate-700">{intern.full_name}</span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
              {intern.full_name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' ? renderStatusScreen() : (
            <Card className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 border-b pb-4">My Profile</h2>
              <div className="space-y-4">
                <div><span className="text-slate-500 font-bold block text-xs uppercase mb-1">Full Name</span><span className="font-semibold text-slate-900 text-lg">{intern.full_name}</span></div>
                <div><span className="text-slate-500 font-bold block text-xs uppercase mb-1">Registration No</span><span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 inline-block rounded-md">{intern.registration_number}</span></div>
                <div><span className="text-slate-500 font-bold block text-xs uppercase mb-1">Email Address</span><span className="font-semibold text-slate-900">{intern.email}</span></div>
                <div><span className="text-slate-500 font-bold block text-xs uppercase mb-1">Domain</span><span className="font-semibold text-slate-900">{intern.domain}</span></div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

function DocumentRow({ title, url }: { title: string, url: string | undefined | null }) {
  if (!url) {
    return (
      <div className="p-4 flex items-center justify-between bg-slate-50 opacity-75">
        <div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className="text-[10px] font-medium text-slate-400">Not generated yet</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
          <Download className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 flex items-center justify-between bg-white hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => window.open(url, '_blank')}>
      <div>
        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{title}</p>
        <p className="text-[10px] font-bold text-emerald-600">Available to download</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-md transition-all">
        <Download className="w-4 h-4 text-blue-600 group-hover:text-white" />
      </div>
    </div>
  )
}
