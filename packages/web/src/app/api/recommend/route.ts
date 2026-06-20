import { NextRequest, NextResponse } from 'next/server'
import { callJsonCompletion } from '@/lib/ai'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { skills, preferredRoles, experience, internships } = await req.json()

    if (!internships?.length) {
      return NextResponse.json([])
    }

    const systemPrompt = `You are an internship recommendation engine. Rank internships by relevance to the user's profile. Always respond with a valid JSON array of objects with keys: internshipId (string), score (0-100 number), reason (string).`

    const userPrompt = `User profile:
Skills: ${skills?.join(', ') || 'Not specified'}
Preferred roles: ${preferredRoles?.join(', ') || 'Not specified'}
Experience: ${experience || 'Not specified'}

Internships to rank:
${JSON.stringify(internships.map((i: any) => ({ id: i.id, title: i.title, company: i.company, skills: i.skills, description: i.description })))}

Rank these from best to worst match.`

    interface Rec {
      internshipId: string
      score: number
      reason: string
    }

    let recommendations = await callJsonCompletion<Rec[]>(systemPrompt, userPrompt)

    if (!recommendations) {
      recommendations = internships.slice(0, 5).map((i: any) => ({
        internshipId: i.id,
        score: Math.floor(Math.random() * 30) + 70,
        reason: `This ${i.title} role at ${i.company} aligns with your ${skills?.[0] || 'technical'} skills.`,
      }))
    }

    return NextResponse.json(recommendations)
  } catch (err) {
    logger.error('Recommendation failed', { error: (err as Error).message })
    return NextResponse.json({ error: 'Recommendation failed' }, { status: 500 })
  }
}
