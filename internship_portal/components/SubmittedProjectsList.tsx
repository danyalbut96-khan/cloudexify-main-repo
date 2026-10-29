import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ExternalLink, CheckCircle2, Clock, XCircle, AlertCircle, Sparkles, UserCheck } from 'lucide-react'

interface Project {
  id: string
  project_number: number
  project_title: string
  repo_url: string
  description?: string
  submitted_at?: string
  analysis_status?: string
  display_ai_score?: number | null
  display_ai_feedback?: any | null
  ai_score_visible?: boolean
  manual_status?: string
  manual_marks?: number | null
  manual_feedback?: string | null
}

interface SubmittedProjectsListProps {
  projects: Project[]
  maxProjectsCount: number
}

export default function SubmittedProjectsList({ projects, maxProjectsCount }: SubmittedProjectsListProps) {
  if (!projects || projects.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-2xl">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="font-bold text-slate-700">No Projects Submitted Yet</h4>
        <p className="text-xs text-slate-500 mt-1">
          When you submit your project repository, it will appear here with live review updates and mentor marks.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((proj) => {
        // Status styling for manual review (case-insensitive and trimmed)
        const statusClean = String(proj.manual_status || '').toLowerCase().trim()
        const isApproved = statusClean === 'approved' || statusClean === 'completed' || statusClean === 'passed'
        const isRejected = statusClean === 'rejected' || statusClean === 'revision' || statusClean === 'needs revision'
        const isPending = !isApproved && !isRejected

        return (
          <Card key={proj.id} className="p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <Badge variant="blue" className="bg-blue-50 text-blue-700 font-black text-xs px-2.5 py-0.5 border border-blue-200">
                    Project #{proj.project_number}
                  </Badge>

                  {/* Manual / Mentor status badge */}
                  {isApproved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" /> Revisions Needed
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3.5 h-3.5" /> Under Review
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900">{proj.project_title}</h4>
                {proj.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{proj.description}</p>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                <a
                  href={proj.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  GitHub Repository
                </a>
                {proj.submitted_at && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(proj.submitted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Mentor and AI Evaluation Section */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Mentor / Manual Marks & Feedback */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    Mentor Review
                  </span>
                  {proj.manual_marks !== null && proj.manual_marks !== undefined ? (
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      Marks: {proj.manual_marks} / 25
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Marks Pending</span>
                  )}
                </div>
                {proj.manual_feedback ? (
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/70">
                    {proj.manual_feedback}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No feedback remarks added yet.</p>
                )}
              </div>

              {/* AI Code Review & Feedback */}
              <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 rounded-xl p-3.5 border border-indigo-100/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI Code Analysis
                  </span>
                  {proj.ai_score_visible ? (
                    <span className="text-xs font-extrabold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                      AI Score: {proj.display_ai_score ?? 0}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Score hidden by Admin</span>
                  )}
                </div>

                {proj.ai_score_visible && proj.display_ai_feedback ? (
                  <div className="text-xs text-slate-700 bg-white/90 p-2.5 rounded-lg border border-indigo-100 space-y-1">
                    {typeof proj.display_ai_feedback === 'string' ? (
                      <p className="leading-relaxed">{proj.display_ai_feedback}</p>
                    ) : (
                      <>
                        {proj.display_ai_feedback.overall_feedback && (
                          <p className="leading-relaxed mb-1">{proj.display_ai_feedback.overall_feedback}</p>
                        )}
                        {proj.display_ai_feedback.strengths && (
                          <p className="text-emerald-700"><strong>Strengths:</strong> {proj.display_ai_feedback.strengths}</p>
                        )}
                        {proj.display_ai_feedback.improvements && (
                          <p className="text-amber-700"><strong>Improvements:</strong> {proj.display_ai_feedback.improvements}</p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {proj.analysis_status === 'pending'
                      ? 'AI analysis queued in background.'
                      : 'Detailed AI feedback will be available once released.'}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}