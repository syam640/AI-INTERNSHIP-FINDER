import { NextRequest, NextResponse } from 'next/server'
import { uploadResume } from '@/lib/supabase-storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const uid = formData.get('uid') as string | null

    if (!file || !uid) {
      return NextResponse.json({ error: 'Missing file or uid' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
    }

    const result = await uploadResume(uid, file)

    return NextResponse.json({ url: result.url, path: result.path })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
