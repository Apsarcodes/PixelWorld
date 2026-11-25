import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

/**
 * Returns an S3Client configured for Cloudflare R2 if credentials are provided
 */
export function getR2Client(): S3Client | null {
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

/**
 * Uploads a file buffer directly to Cloudflare R2 bucket.
 * Returns the public URL (via R2_PUBLIC_DOMAIN) on success, or null if unconfigured.
 */
export async function uploadToR2(params: {
  buffer: Buffer
  filename: string
  mimeType: string
}): Promise<string | null> {
  const s3 = getR2Client()
  const bucket = process.env.R2_BUCKET || 'pixelworld-media'
  const publicDomain = (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/$/, '')

  if (!s3 || !publicDomain) {
    return null
  }

  const cleanFilename = params.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${Date.now()}-${cleanFilename}`

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: params.buffer,
        ContentType: params.mimeType,
      })
    )

    return `${publicDomain}/${key}`
  } catch (err) {
    console.error('[Cloudflare R2 Upload Error]', err)
    return null
  }
}
