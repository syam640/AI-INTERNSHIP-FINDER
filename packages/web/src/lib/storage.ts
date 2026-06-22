import { uploadResume as cloudinaryUpload, UploadResult } from './cloudinary-storage'
import { withRetry } from './retry'
import { logger } from './logger'

export async function uploadResume(uid: string, file: File): Promise<UploadResult> {
  const result = await withRetry(() => cloudinaryUpload(uid, file), {
    maxAttempts: 3,
    baseDelay: 1000,
  })
  logger.info('Resume uploaded to Cloudinary', {
    uid,
    path: result.path,
    size: file.size,
  })
  return result
}
