import { uploadResume as supabaseUpload } from './supabase-storage'
import { withRetry } from './retry'
import { logger } from './logger'

export async function uploadResume(uid: string, file: File): Promise<string> {
  const result = await withRetry(() => supabaseUpload(uid, file), {
    maxAttempts: 3,
    baseDelay: 1000,
  })
  logger.info('Resume uploaded to Supabase Storage', {
    uid,
    path: result.path,
    size: file.size,
  })
  return result.url
}
