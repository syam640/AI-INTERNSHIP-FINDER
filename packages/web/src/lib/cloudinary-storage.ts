const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const API_KEY = process.env.CLOUDINARY_API_KEY!
const API_SECRET = process.env.CLOUDINARY_API_SECRET!

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf']

export interface UploadResult {
  url: string
  path: string
  publicId: string
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
  file: File
): Promise<UploadResult> {
  validateFile(file)

  const timestamp = Math.round(Date.now() / 1000)
  const publicId = `resumes/${uid}/${timestamp}`

  const toSign = `public_id=${publicId}&timestamp=${timestamp}`
  const signature = await generateSignature(toSign)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('public_id', publicId)
  formData.append('timestamp', String(timestamp))
  formData.append('api_key', API_KEY)
  formData.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: formData, signal: AbortSignal.timeout(60000) }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload failed: ${text.slice(0, 200)}`)
  }

  const result = await res.json()
  return {
    url: result.secure_url,
    path: result.public_id,
    publicId: result.public_id,
  }
}

async function generateSignature(params: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(params + API_SECRET)
  const hash = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function deleteResume(publicId: string): Promise<void> {
  const timestamp = Math.round(Date.now() / 1000)
  const toSign = `public_id=${publicId}&timestamp=${timestamp}`
  const signature = await generateSignature(toSign)

  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('timestamp', String(timestamp))
  formData.append('api_key', API_KEY)
  formData.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/destroy`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Delete failed')
}
