import { supabase, getServiceClient } from './supabase'

const BUCKET = 'resumes'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf']

export interface UploadResult {
  url: string
  path: string
}

export interface SignedUrlResult {
  url: string
  expiresAt: number
}

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Only PDF is supported.`)
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max is 10MB.`)
  }
}

export async function uploadResume(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  validateFile(file)

  const ext = file.name.split('.').pop() || 'pdf'
  const path = `${uid}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return { url: publicUrl.publicUrl, path }
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<SignedUrlResult> {
  const service = getServiceClient()
  const { data, error } = await service.storage.from(BUCKET).createSignedUrl(path, expiresIn)
  if (error) throw new Error(`Signed URL failed: ${error.message}`)
  return { url: data.signedUrl, expiresAt: Date.now() + expiresIn * 1000 }
}

export async function deleteResume(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export async function listResumes(uid: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(uid)
  if (error) return []
  return data.map((f) => f.name)
}
