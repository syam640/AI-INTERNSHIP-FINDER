import { NextRequest, NextResponse } from 'next/server'
import { uploadResume } from '@/lib/storage'
import { logger } from '@/lib/logger'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '15mb',
  },
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Content-Type must be multipart/form-data' },
      { status: 400 }
    )
  }

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

    logger.info('Uploading resume', { uid, size: file.size, type: file.type })

    const result = await uploadResume(uid, file)

    logger.info('Resume uploaded successfully', { uid, path: result.path })
    return NextResponse.json({ url: result.url, path: result.path })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    logger.error('Resume upload failed', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
