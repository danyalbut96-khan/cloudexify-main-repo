'use client'

import React, { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { Plus, Users, Calendar, AlertCircle, CheckCircle2, Pencil, X, Save } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    status: 'coming'
  })

  const [editingBatch, setEditingBatch] = useState<any>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

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
      setFormData({ name: '', start_date: '', end_date: '', status: 'coming' })
      fetchBatches()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create batch')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBatch) return
    setIsSavingEdit(true)
    
    try {
      const res = await fetch('/api/batches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBatch)
      })
      
      if (!res.ok) throw new Error('Failed to update batch')
      toast.success('Batch updated successfully!')
      setEditingBatch(null)
      fetchBatches()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepting':
        return <Badge variant="green" className="text-[10px] px-2 py-0">Accepting</Badge>
      case 'active':
        return <Badge variant="blue" className="text-[10px] px-2 py-0">Active</Badge>
      case 'coming':
        return <Badge variant="neutral" className="text-[10px] px-2 py-0 text-slate-500 bg-slate-100">Coming Soon</Badge>
      case 'completed':
        return <Badge variant="neutral" className="text-[10px] px-2 py-0">Completed</Badge>
      default:
        return <Badge variant="neutral" className="text-[10px] px-2 py-0">{status}</Badge>
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

            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="accepting">Accepting Registrations</option>
                <option value="coming">Coming Soon</option>
                <option value="active">Active (Ongoing)</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={isSubmitting}>
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
                <div key={batch.id} className={`flex items-center justify-between p-4 rounded-xl border ${batch.status === 'accepting' ? 'border-green-200 bg-green-50/50' : batch.status === 'active' ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-bold text-slate-800">{batch.name}</h3>
                      {getStatusBadge(batch.status)}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 space-x-4">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {formatDate(batch.start_date)} - {formatDate(batch.end_date)}</span>
                      <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {batch.interns?.[0]?.count || 0} Interns</span>
                    </div>
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex items-center"
                      onClick={() => setEditingBatch(batch)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Pencil className="w-5 h-5 mr-2 text-indigo-600" />
                Edit Batch
              </h2>
              <button 
                onClick={() => setEditingBatch(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBatch} className="space-y-4">
              <div className="space-y-2">
                <Label>Batch Name</Label>
                <Input 
                  required 
                  value={editingBatch.name}
                  onChange={(e) => setEditingBatch({...editingBatch, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    required 
                    value={editingBatch.start_date}
                    onChange={(e) => setEditingBatch({...editingBatch, start_date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    required 
                    value={editingBatch.end_date}
                    onChange={(e) => setEditingBatch({...editingBatch, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select 
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingBatch.status}
                  onChange={(e) => setEditingBatch({...editingBatch, status: e.target.value})}
                >
                  <option value="accepting">Accepting Registrations</option>
                  <option value="coming">Coming Soon</option>
                  <option value="active">Active (Ongoing)</option>
                  <option value="completed">Completed</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Warning: Setting to &apos;Accepting Registrations&apos; will automatically update any currently accepting batch to &apos;Active&apos;.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditingBatch(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700" 
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </PageWrapper>
  )
}
