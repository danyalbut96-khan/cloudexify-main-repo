'use client'

import React, { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { Plus, Users, Calendar, AlertCircle, CheckCircle2, Pencil, X, Save, Copy, Archive, ArchiveRestore, BarChart } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const AVAILABLE_DOMAINS = [
  'Python Programming', 'C++ Programming', 'Java Programming', 
  'Data Science & AI Basics', 'Cybersecurity Fundamentals', 'Full Stack Development'
]

const getInitialDomains = () => AVAILABLE_DOMAINS.map(d => ({ domain: d, seats_total: 0, is_open: true }))

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    status: 'coming',
    documents_locked: false,
    mode_enum: 'remote',
    location_enum: 'Remote',
    projects: '',
    comp_type: 'unpaid',
    comp_amount: '',
    certificate: '',
    registration_deadline: '',
    domains: getInitialDomains()
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
      setFormData({ name: '', start_date: '', end_date: '', status: 'coming', documents_locked: false, mode_enum: 'remote', location_enum: 'Remote', projects: '', comp_type: 'unpaid', comp_amount: '', certificate: '', registration_deadline: '', domains: getInitialDomains() })
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

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to update batch')
      }
      toast.success('Batch updated successfully!')
      setEditingBatch(null)
      fetchBatches()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleArchiveBatch = async (id: string, is_archived: boolean) => {
    try {
      const res = await fetch('/api/batches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_archived })
      })
      if (!res.ok) throw new Error('Failed to archive batch')
      toast.success(is_archived ? 'Batch archived' : 'Batch restored')
      fetchBatches()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDuplicateBatch = (batch: any) => {
    const newDomains = (batch.batch_domains || []).map((d: any) => ({ domain: d.domain, seats_total: d.seats_total, is_open: true }));
    // merge with available domains
    const domainsToSet = AVAILABLE_DOMAINS.map(d => {
      const existing = newDomains.find((nd: any) => nd.domain === d);
      return existing || { domain: d, seats_total: 0, is_open: true };
    });
    setFormData({
      ...formData,
      name: `${batch.name} (Copy)`,
      start_date: batch.start_date,
      end_date: batch.end_date,
      status: 'coming',
      documents_locked: batch.documents_locked,
      mode_enum: batch.mode_enum || 'remote',
      location_enum: batch.location_enum || 'Remote',
      projects: batch.projects || '',
      comp_type: batch.comp_type || 'unpaid',
      comp_amount: batch.comp_amount || '',
      certificate: batch.certificate || '',
      registration_deadline: batch.registration_deadline || '',
      domains: domainsToSet
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Batch details copied! You can now edit and create it.');
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepting':
        return <Badge variant="success" className="text-[10px] px-2 py-0">Accepting</Badge>
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
      
      {/* Batch Summary Cards */}
      {!isLoading && batches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 shadow-sm border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 mb-1 flex items-center">
              <BarChart className="w-4 h-4 mr-1 text-slate-400" /> Total Active Interns
            </h3>
            <p className="text-2xl font-bold text-slate-800">
              {batches.filter(b => b.status === 'active' && !b.is_archived).reduce((acc, b) => acc + (b.interns?.[0]?.count || 0), 0)}
            </p>
          </Card>
          <Card className="p-4 shadow-sm border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 mb-1">Ongoing Batches</h3>
            <p className="text-2xl font-bold text-slate-800">
              {batches.filter(b => b.status === 'active' && !b.is_archived).length}
            </p>
          </Card>
          <Card className="p-4 shadow-sm border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 mb-1">Accepting Batches</h3>
            <p className="text-2xl font-bold text-slate-800">
              {batches.filter(b => b.status === 'accepting' && !b.is_archived).length}
            </p>
          </Card>
          <Card className="p-4 shadow-sm border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 mb-1">Archived Batches</h3>
            <p className="text-2xl font-bold text-slate-800">
              {batches.filter(b => b.is_archived).length}
            </p>
          </Card>
        </div>
      )}

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
                onChange={(e: { target: { value: any } }) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                required
                value={formData.start_date}
                onChange={(e: { target: { value: any } }) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                required
                value={formData.end_date}
                onChange={(e: { target: { value: any } }) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Registration Deadline</Label>
              <Input
                type="date"
                value={formData.registration_deadline}
                onChange={(e: { target: { value: any } }) => setFormData({ ...formData, registration_deadline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="accepting">Accepting Registrations</option>
                <option value="coming">Coming Soon</option>
                <option value="active">Active (Ongoing)</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mode</Label>
                <select
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.mode_enum}
                  onChange={(e: any) => setFormData({ ...formData, mode_enum: e.target.value })}
                >
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <select
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.location_enum}
                  onChange={(e: any) => setFormData({ ...formData, location_enum: e.target.value })}
                >
                  <option value="Islamabad">Islamabad</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Projects Text</Label>
                <Input
                  placeholder="e.g. 4 Real-world Client Projects"
                  value={formData.projects}
                  onChange={(e: { target: { value: any } }) => setFormData({ ...formData, projects: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Compensation Type</Label>
                <select
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.comp_type}
                  onChange={(e: any) => setFormData({ ...formData, comp_type: e.target.value })}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="stipend">Stipend</option>
                </select>
              </div>
              {formData.comp_type !== 'unpaid' && (
                <div className="space-y-2">
                  <Label>Compensation Amount</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 10000"
                    value={formData.comp_amount}
                    onChange={(e: { target: { value: any } }) => setFormData({ ...formData, comp_amount: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <Label>Certificate Text</Label>
                <Input
                  placeholder="e.g. Verified Certificate + LOR"
                  value={formData.certificate}
                  onChange={(e: { target: { value: any } }) => setFormData({ ...formData, certificate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Label className="text-base">Domain Seats Configuration</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.domains.map((dom, idx) => (
                  <div key={dom.domain} className="flex items-center justify-between p-2 border border-slate-200 rounded-md bg-slate-50">
                    <span className="text-xs font-semibold text-slate-700 w-1/2 truncate">{dom.domain}</span>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        className="w-20 text-xs h-7" 
                        placeholder="Seats" 
                        value={dom.seats_total || ''} 
                        onChange={(e) => {
                          const newDomains = [...formData.domains];
                          newDomains[idx].seats_total = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, domains: newDomains });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
              <input
                type="checkbox"
                id="doc-lock-new"
                checked={formData.documents_locked}
                onChange={(e) => setFormData({ ...formData, documents_locked: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <Label htmlFor="doc-lock-new" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Lock Document Downloads
              </Label>
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
                    <div className="flex items-center text-xs text-slate-500 space-x-4 mb-2">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {formatDate(batch.start_date)} - {formatDate(batch.end_date)}</span>
                      <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {batch.interns?.[0]?.count || 0} Interns</span>
                    </div>
                    {batch.batch_domains && batch.batch_domains.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {batch.batch_domains.filter((d: any) => d.seats_total > 0 || d.seats_filled > 0).map((d: any) => (
                          <span key={d.id} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                            {d.domain.split(' ')[0]}: <strong className={d.seats_filled >= d.seats_total ? 'text-red-500' : 'text-green-600'}>{d.seats_filled}/{d.seats_total}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex items-center w-full justify-start"
                      onClick={() => {
                        const editData = { ...batch };
                        const currentDomains = editData.batch_domains || [];
                        editData.domains = AVAILABLE_DOMAINS.map(d => {
                          const existing = currentDomains.find((cd: any) => cd.domain === d);
                          return existing || { domain: d, seats_total: 0, is_open: true };
                        });
                        setEditingBatch(editData)
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex items-center w-full justify-start text-slate-600 hover:text-slate-800"
                      onClick={() => handleDuplicateBatch(batch)}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs flex items-center w-full justify-start ${batch.is_archived ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-600'}`}
                      onClick={() => handleArchiveBatch(batch.id, !batch.is_archived)}
                    >
                      {batch.is_archived ? <><ArchiveRestore className="w-3.5 h-3.5 mr-1.5" /> Restore</> : <><Archive className="w-3.5 h-3.5 mr-1.5" /> Archive</>}
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
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
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
                  onChange={(e: { target: { value: any } }) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    required
                    value={editingBatch.start_date}
                    onChange={(e: { target: { value: any } }) => setEditingBatch({ ...editingBatch, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    required
                    value={editingBatch.end_date}
                    onChange={(e: { target: { value: any } }) => setEditingBatch({ ...editingBatch, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Registration Deadline</Label>
                <Input
                  type="date"
                  value={editingBatch.registration_deadline || ''}
                  onChange={(e: { target: { value: any } }) => setEditingBatch({ ...editingBatch, registration_deadline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingBatch.status}
                  onChange={(e: any) => setEditingBatch({ ...editingBatch, status: e.target.value })}
                >
                  <option value="accepting">Accepting Registrations</option>
                  <option value="coming">Coming Soon</option>
                  <option value="active">Active (Ongoing)</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <select
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingBatch.mode_enum || 'remote'}
                    onChange={(e: any) => setEditingBatch({ ...editingBatch, mode_enum: e.target.value })}
                  >
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <select
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingBatch.location_enum || 'Remote'}
                    onChange={(e: any) => setEditingBatch({ ...editingBatch, location_enum: e.target.value })}
                  >
                    <option value="Islamabad">Islamabad</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Projects Text</Label>
                  <Input
                    placeholder="e.g. 4 Real-world Client Projects"
                    value={editingBatch.projects || ''}
                    onChange={(e: { target: { value: any } }) => setEditingBatch({ ...editingBatch, projects: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Compensation Type</Label>
                  <select
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingBatch.comp_type || 'unpaid'}
                    onChange={(e: any) => setEditingBatch({ ...editingBatch, comp_type: e.target.value })}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="stipend">Stipend</option>
                  </select>
                </div>
                {editingBatch.comp_type !== 'unpaid' && (
                  <div className="space-y-2">
                    <Label>Compensation Amount</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10000"
                      value={editingBatch.comp_amount || ''}
                      onChange={(e: { target: { value: any } }) => setEditingBatch({ ...editingBatch, comp_amount: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-2 col-span-2">
                  <Label>Certificate Text</Label>
                  <Input
                    placeholder="e.g. Verified Certificate + LOR"
                    value={editingBatch.certificate || ''}
                    onChange={(e: { target: { value: any } }) => setEditingBatch({ ...editingBatch, certificate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <Label className="text-base">Domain Seats Configuration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {editingBatch.domains?.map((dom: any, idx: number) => (
                    <div key={dom.domain} className="flex items-center justify-between p-2 border border-slate-200 rounded-md bg-slate-50">
                      <span className="text-xs font-semibold text-slate-700 w-1/2 truncate">{dom.domain}</span>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number" 
                          className="w-20 text-xs h-7" 
                          placeholder="Seats" 
                          value={dom.seats_total || ''} 
                          onChange={(e) => {
                            const newDomains = [...editingBatch.domains];
                            newDomains[idx].seats_total = parseInt(e.target.value) || 0;
                            setEditingBatch({ ...editingBatch, domains: newDomains });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-100 rounded-lg mt-4">
                <input
                  type="checkbox"
                  id="doc-lock-edit"
                  checked={editingBatch.documents_locked}
                  onChange={(e) => setEditingBatch({ ...editingBatch, documents_locked: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <div className="flex flex-col">
                  <Label htmlFor="doc-lock-edit" className="text-sm font-bold text-red-900 cursor-pointer">
                    Lock Document Downloads
                  </Label>
                  <span className="text-[10px] text-red-700 leading-tight">If checked, interns in this batch cannot download their generated documents from the portal.</span>
                </div>
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
