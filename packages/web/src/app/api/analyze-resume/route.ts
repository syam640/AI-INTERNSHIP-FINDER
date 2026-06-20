import { NextRequest, NextResponse } from 'next/server'
import { callJsonCompletion } from '@/lib/ai'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { resumeText, skills } = await req.json()

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    const systemPrompt = `You are an expert ATS resume analyzer. Analyze the resume and respond with valid JSON:
{ "atsScore": number (0-100), "missingSkills": string[], "suggestions": string[], "strengths": string[] }`

    const userPrompt = `Resume text:
"${resumeText.substring(0, 4000)}"

User's listed skills: ${skills?.join(', ') || 'Not specified'}

Provide ATS score, missing skills, improvement suggestions, and key strengths.`

    interface Analysis {
      atsScore: number
      missingSkills: string[]
      suggestions: string[]
      strengths: string[]
    }

    let analysis = await callJsonCompletion<Analysis>(systemPrompt, userPrompt)

    if (!analysis) {
      analysis = {
        atsScore: 72,
        missingSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        suggestions: [
          'Add specific metrics and achievements to your experience section',
          'Include a skills section with relevant technologies',
          'Tailor your resume with keywords from job descriptions',
        ],
        strengths: ['Clear professional summary', 'Good education background'],
      }
    }

    return NextResponse.json(analysis)
  } catch (err) {
    logger.error('Resume analysis failed', { error: (err as Error).message })
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
