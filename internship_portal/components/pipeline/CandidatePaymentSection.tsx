'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Clock, Upload, CheckCircle2, Copy, AlertCircle, ShieldCheck, CreditCard, Sparkles, FileText, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface CandidatePaymentSectionProps {
  intern: {
    id: string
    full_name: string
    domain: string
    pipeline_stage: string
    payment_deadline?: string
    payment_method?: string
    payment_transaction_id?: string
    payment_screenshot_url?: string
    batches?: { name: string }
  }
  onSuccess: () => void
}

export default function CandidatePaymentSection({ intern, onSuccess }: CandidatePaymentSectionProps) {
  const [method, setMethod] = useState<'JazzCash' | 'Easypaisa' | 'Bank Transfer'>('JazzCash')
  const [transactionId, setTransactionId] = useState('')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  })

  useEffect(() => {
    if (!intern.payment_deadline) return

    const calculateTime = () => {
      const deadline = new Date(intern.payment_deadline!).getTime()
      const now = Date.now()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [intern.payment_deadline])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  // Handle receipt upload to private bucket 'payment_receipts'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Receipt image must be under 5MB.')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Uploading payment proof...')
        try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/payment/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload receipt')

      setScreenshotUrl(data.url)
      toast.success('Receipt uploaded successfully!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload receipt', { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transactionId.trim()) {
      toast.error('Please enter the Transaction ID (TID) from your receipt.')
      return
    }
    if (!screenshotUrl) {
      toast.error('Please upload your payment receipt screenshot.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: method,
          payment_transaction_id: transactionId.trim(),
          payment_screenshot_url: screenshotUrl
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment.')

      toast.success(data.message)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If already submitted and waiting for admin review:
  if (intern.pipeline_stage === 'payment_pending') {
    return (
      <Card className="p-6 bg-white border border-amber-200/80 rounded-2xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-600">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Verification in Progress
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Payment Submitted - Awaiting Admin Approval
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Thank you for submitting your payment proof. Our finance and admissions office is verifying your Transaction ID (TID: <span className="font-mono font-bold text-slate-900">{intern.payment_transaction_id || 'Submitted'}</span>).
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Verification usually completes within <strong>12 to 24 hours</strong>. Once verified, your status will turn to <span className="text-emerald-600 font-bold">Approved</span> and all dashboard features, projects, and learning resources will be unlocked automatically.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border border-indigo-200/80 rounded-2xl bg-white shadow-xl">
      {/* Top Banner with Countdown */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Shortlisted Candidate
              </span>
              <span className="text-xs text-indigo-200 font-medium">{intern.batches?.name || 'Internship Program'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black mt-2">
              Congratulations, {intern.full_name}!
            </h2>
            <p className="text-sm text-indigo-200/90 mt-1 max-w-xl">
              You have passed your Technical Interview assessment. To secure your reserved seat in the <strong>{intern.domain}</strong> track, please transfer the verification fee before the deadline.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="bg-black/30 border border-white/10 backdrop-blur-md rounded-xl p-3 px-5 text-center">
            <div className="text-[11px] text-indigo-200 uppercase tracking-wider font-bold mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Payment Deadline
            </div>
            {timeLeft.isExpired ? (
              <div className="text-rose-400 font-bold text-sm">Expired</div>
            ) : (
              <div className="flex items-center gap-2 font-mono font-black text-xl text-white">
                <div className="bg-white/10 px-2 py-1 rounded">{String(timeLeft.days).padStart(2, '0')}d</div>
                <span>:</span>
                <div className="bg-white/10 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</div>
                <span>:</span>
                <div className="bg-white/10 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</div>
                <span>:</span>
                <div className="bg-white/10 px-2 py-1 rounded text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}s</div>
              </div>
            )}
            <div className="text-[10px] text-gray-400 mt-1">72-Hour Seat Hold</div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Payment Methods Instruction Cards */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            1. Official CloudExify Payment Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* JazzCash */}
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
              method === 'JazzCash' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
            }`} onClick={() => setMethod('JazzCash')}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-extrabold text-slate-900 text-sm">JazzCash</span>
                <input type="radio" checked={method === 'JazzCash'} onChange={() => setMethod('JazzCash')} className="text-indigo-600" />
              </div>
              <div className="text-xs text-slate-500">Account Title:</div>
              <div className="font-bold text-slate-800 text-xs mb-2">CloudExify Admissions</div>
              <div className="text-xs text-slate-500">Mobile / Account:</div>
              <div className="flex items-center justify-between font-mono font-bold text-indigo-700 text-sm bg-white p-2 rounded border border-slate-200">
                <span>0300-1234567</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard('0300-1234567', 'JazzCash Account'); }} className="text-slate-400 hover:text-indigo-600">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Easypaisa */}
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
              method === 'Easypaisa' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
            }`} onClick={() => setMethod('Easypaisa')}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-extrabold text-slate-900 text-sm">Easypaisa</span>
                <input type="radio" checked={method === 'Easypaisa'} onChange={() => setMethod('Easypaisa')} className="text-indigo-600" />
              </div>
              <div className="text-xs text-slate-500">Account Title:</div>
              <div className="font-bold text-slate-800 text-xs mb-2">CloudExify Admissions</div>
              <div className="text-xs text-slate-500">Mobile / Account:</div>
              <div className="flex items-center justify-between font-mono font-bold text-emerald-700 text-sm bg-white p-2 rounded border border-slate-200">
                <span>0300-1234567</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard('0300-1234567', 'Easypaisa Account'); }} className="text-slate-400 hover:text-indigo-600">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
              method === 'Bank Transfer' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
            }`} onClick={() => setMethod('Bank Transfer')}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-extrabold text-slate-900 text-sm">Meezan Bank</span>
                <input type="radio" checked={method === 'Bank Transfer'} onChange={() => setMethod('Bank Transfer')} className="text-indigo-600" />
              </div>
              <div className="text-xs text-slate-500">Account Title:</div>
              <div className="font-bold text-slate-800 text-xs mb-2">CloudExify PVT LTD</div>
              <div className="text-xs text-slate-500">IBAN:</div>
              <div className="flex items-center justify-between font-mono font-bold text-slate-800 text-xs bg-white p-2 rounded border border-slate-200">
                <span className="truncate">PK00MEZN00012345678901</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard('PK00MEZN00012345678901', 'IBAN'); }} className="text-slate-400 hover:text-indigo-600">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Fee Note */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-xs text-slate-500">Verification & Program Fee:</div>
              <div className="text-base font-extrabold text-slate-900">PKR 2,500 <span className="text-xs font-normal text-slate-500">(One-time)</span></div>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">Covers LMS, Mentorship & Certificates</span>
        </div>

        {/* Form to Submit Receipt */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            2. Submit Transaction Proof
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Transaction ID (TID) / Reference No *
              </label>
              <input
                type="text"
                placeholder="e.g. 1029384756 or JZ-827394"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 rounded-xl p-3 focus:border-indigo-600 focus:bg-white outline-none font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Found on your SMS or mobile receipt</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Upload Screenshot / Receipt PDF *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-300 rounded-xl p-1.5 bg-slate-50"
                />
              </div>
              {screenshotUrl && (
                <span className="text-[11px] text-emerald-600 font-bold mt-1 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Receipt uploaded successfully
                </span>
              )}
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || timeLeft.isExpired}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Submitting Verification...'
              ) : (
                <>
                  Confirm & Submit Payment Verification
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
