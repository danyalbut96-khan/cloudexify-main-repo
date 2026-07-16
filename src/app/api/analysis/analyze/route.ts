import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const projectId = String(body.project_id || '').trim()

    if (!projectId) {
      return NextResponse.json({ error: 'project_id is required.' }, { status: 400 })
    }

    // 1. Fetch the project
    const { data: project, error: projectError } = await supabase
      .from('intern_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    if (project.analysis_status === 'done') {
      return NextResponse.json({ error: 'Project has already been analyzed.' }, { status: 409 })
    }

    // 2. Fetch AI settings from Supabase
    const { data: aiSettings } = await supabase
      .from('intern_analysis_settings')
      .select('openrouter_api_key, openrouter_model, system_prompt_prefix')
      .eq('id', 1)
      .maybeSingle()

    if (!aiSettings?.openrouter_api_key) {
      return NextResponse.json({ error: 'OpenRouter API key not configured. Go to Settings → Intern Analysis to add it.' }, { status: 400 })
    }

    // 3. Fetch domain criteria
    const { data: criteria } = await supabase
      .from('intern_analysis_criteria')
      .select('criterion_name, criterion_description, max_marks, sort_order')
      .eq('domain_code', project.domain_code)
      .order('sort_order', { ascending: true })

    if (!criteria || criteria.length === 0) {
      return NextResponse.json({ error: `No scoring criteria found for domain ${project.domain_code}.` }, { status: 400 })
    }

    // Mark as analyzing
    await supabase
      .from('intern_projects')
      .update({ analysis_status: 'analyzing' })
      .eq('id', projectId)

    // 4. Fetch GitHub repo data (public repos only, no token needed)
    let readmeContent = 'No README found.'
    let fileTree = 'Could not fetch file tree.'
    let languages = 'Unknown'

    try {
      // Parse owner/repo from URL
      const urlParts = project.repo_url.replace('https://github.com/', '').replace(/\/$/, '').split('/')
      const owner = urlParts[0]
      const repo = urlParts[1]

      if (owner && repo) {
        // Fetch README
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
          headers: { 'Accept': 'application/vnd.github.raw' }
        })
        if (readmeRes.ok) {
          readmeContent = (await readmeRes.text()).slice(0, 3000) // cap at 3000 chars
        }

        // Fetch repo tree (top level)
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=0`)
        if (treeRes.ok) {
          const treeData = await treeRes.json()
          const files = (treeData.tree || []).slice(0, 40).map((f: any) => f.path).join('\n')
          fileTree = files || 'Empty repository'
        }

        // Fetch languages
        const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`)
        if (langRes.ok) {
          const langData = await langRes.json()
          languages = Object.keys(langData).join(', ') || 'Unknown'
        }
      }
    } catch {
      // Non-fatal — proceed with whatever we have
    }

    // 5. Build AI prompt
    const criteriaList = criteria.map((c, i) =>
      `${i + 1}. ${c.criterion_name}: ${c.criterion_description} (0-${c.max_marks} marks)`
    ).join('\n')

    const systemPrompt = aiSettings.system_prompt_prefix || 'You are an expert software engineering mentor.'
    const userPrompt = `
INTERN: ${project.intern_name}
REGISTRATION NO: ${project.registration_number}
DOMAIN: ${project.domain_code}
PROJECT #${project.project_number}: ${project.project_title}
REPO URL: ${project.repo_url}
${project.description ? `DESCRIPTION: ${project.description}` : ''}

README CONTENT:
${readmeContent}

FILE STRUCTURE (top-level):
${fileTree}

LANGUAGES DETECTED:
${languages}

Score this project on the following ${criteria.length} criteria. Each criterion is worth ${criteria[0]?.max_marks ?? 5} marks.
Total maximum score: ${criteria.reduce((s, c) => s + c.max_marks, 0)} marks.

IMPORTANT: Return ONLY valid JSON, no extra text. Use this exact format:
{
  "total_score": <number>,
  "criteria": [
    {"name": "...", "score": <number>, "comment": "2-3 sentence constructive feedback"},
    ...
  ],
  "overall_feedback": "3-4 sentence overall assessment of the project"
}

CRITERIA:
${criteriaList}
`.trim()

    // 6. Call OpenRouter
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiSettings.openrouter_api_key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cloudexify.com',
        'X-Title': 'CloudExify Intern Analysis'
      },
      body: JSON.stringify({
        model: aiSettings.openrouter_model || 'mistralai/mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    })

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text()
      await supabase.from('intern_projects').update({ analysis_status: 'failed' }).eq('id', projectId)
      return NextResponse.json({ error: `OpenRouter error: ${openRouterRes.status} - ${errText}` }, { status: 502 })
    }

    const aiResponse = await openRouterRes.json()
    const rawContent = aiResponse?.choices?.[0]?.message?.content || ''

    // 7. Parse JSON from AI response
    let parsedFeedback: any = null
    try {
      // Extract JSON block if wrapped in markdown
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedFeedback = JSON.parse(jsonMatch[0])
      }
    } catch {
      await supabase.from('intern_projects').update({ analysis_status: 'failed' }).eq('id', projectId)
      return NextResponse.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 502 })
    }

    const totalScore = Math.min(
      criteria.reduce((s, c) => s + c.max_marks, 0),
      Math.max(0, Number(parsedFeedback?.total_score ?? 0))
    )

    // 8. Save result
    const { data: updated, error: updateError } = await supabase
      .from('intern_projects')
      .update({
        ai_score: totalScore,
        ai_feedback: parsedFeedback,
        ai_analyzed_at: new Date().toISOString(),
        analysis_status: 'done'
      })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save analysis result.' }, { status: 500 })
    }

    return NextResponse.json({ project: updated, feedback: parsedFeedback })
  } catch (err: unknown) {
    // Mark as failed on any unhandled error
    const body = await request.json().catch(() => ({}))
    if (body?.project_id) {
      await supabase.from('intern_projects').update({ analysis_status: 'failed' }).eq('id', body.project_id)
    }
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
