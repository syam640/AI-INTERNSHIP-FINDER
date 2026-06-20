import { NextRequest, NextResponse } from 'next/server'
import { callChatCompletion } from '@/lib/ai'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { company, role, skills, name } = await req.json()

    if (!company || !role) {
      return NextResponse.json({ error: 'Company and role are required' }, { status: 400 })
    }

    const content = await callChatCompletion(
      [
        {
          role: 'system',
          content: 'You are a professional cover letter writer. Write concise, compelling cover letters (3-4 paragraphs, professional tone).',
        },
        {
          role: 'user',
          content: `Write a cover letter for ${name || 'the applicant'} applying for ${role} at ${company}. Skills include: ${(skills || []).join(', ')}.`,
        },
      ],
      { temperature: 0.7 }
    )

    if (!content) {
      const fallback = `Dear Hiring Manager at ${company},

I am writing to express my strong interest in the ${role} position. With my background in ${(skills || ['relevant technologies']).slice(0, 3).join(', ')}, I am confident that I would be a valuable addition to your team.

Throughout my experience, I have developed strong technical and problem-solving skills that align perfectly with this role. I am particularly excited about the opportunity to contribute to ${company}'s innovative projects and growth.

I would welcome the opportunity to discuss how my qualifications match your needs. Thank you for your consideration.

Best regards,
${name || 'Your Name'}`

      return NextResponse.json({ content: fallback })
    }

    return NextResponse.json({ content })
  } catch (err) {
    logger.error('Cover letter generation failed', { error: (err as Error).message })
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
