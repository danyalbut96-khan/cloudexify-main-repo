'use client'

import React, { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { Plus, Users, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: true
  })

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches')
      if (res.ok) {
        const data = await res.json()
        setBatches(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error(await res.text())
      
      toast.success('Batch created successfully!')
      setFormData({ name: '', start_date: '', end_date: '', is_active: true })
      fetchBatches()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create batch')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleBatchStatus = async (id: string, currentStatus: boolean) => {
    if (currentStatus) return // Already active, don't allow deactivating directly without making another active (or maybe allow it? Let's just allow toggling)
    
    try {
      const res = await fetch('/api/batches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: true })
      })
      
      if (!res.ok) throw new Error('Failed to update status')
      toast.success('Batch activated! Other batches have been deactivated.')
      fetchBatches()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <PageWrapper title="Batch Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Batch Form */}
        <Card className="lg:col-span-1 shadow-sm border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-600" />
              Create New Batch
            </h2>
            <p className="text-sm text-slate-500 mt-1">Start a new internship cohort.</p>
          </div>

          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div className="space-y-2">
              <Label>Batch Name</Label>
              <Input 
                placeholder="e.g., Summer 2026 Batch" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                type="date" 
                required 
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input 
                type="date" 
                required 
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2 pb-4">
              <input 
                type="checkbox" 
                id="is_active" 
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium text-slate-700">
                Set as Active Batch (accepting registrations)
              </Label>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </Button>
          </form>
        </Card>

        {/* Batch List */}
        <Card className="lg:col-span-2 shadow-sm border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Existing Batches
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage current and past cohorts.</p>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p>No batches found. Create your first batch!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch: any) => (
                <div key={batch.id} className={`flex items-center justify-between p-4 rounded-xl border ${batch.is_active ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-bold text-slate-800">{batch.name}</h3>
                      {batch.is_active ? (
                        <Badge variant="blue" className="text-[10px] px-2 py-0">Active</Badge>
                      ) : (
                        <Badge variant="neutral" className="text-[10px] px-2 py-0">Completed</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 space-x-4">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {formatDate(batch.start_date)} - {formatDate(batch.end_date)}</span>
                      <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {batch.interns?.[0]?.count || 0} Interns</span>
                    </div>
                  </div>
                  <div>
                    {!batch.is_active && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => toggleBatchStatus(batch.id, batch.is_active)}
                      >
                        Set Active
                      </Button>
                    )}
                    {batch.is_active && (
                      <div className="flex items-center text-green-600 text-xs font-semibold px-3 py-1.5 bg-green-100 rounded-md">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Active
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}
