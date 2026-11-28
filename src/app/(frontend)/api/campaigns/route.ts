import fs from 'fs'
import os from 'os'
import path from 'path'
import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isAllowedImageMimeType, sanitizeString } from '@/lib/security'
import { ensureUserOrganization } from '@/lib/organization'
import type { Campaign } from '@/payload-types'

const CTA_VALUES = [
  'Visit Website',
  'Call Now',
  'WhatsApp',
  'Get Directions',
  'Shop Now',
  'Book Now',
  'Learn More',
] as const
type CallToAction = (typeof CTA_VALUES)[number]
const CTA_OPTIONS = new Set<string>(CTA_VALUES)

const text = (form: FormData, key: string, maxLength: number) => {
  const value = form.get(key)
  return sanitizeString(value, maxLength)
}

const integer = (form: FormData, key: string) => {
  const value = Number(form.get(key))
  return Number.isInteger(value) ? value : NaN
}

const relationshipID = (value: unknown) =>
  value && typeof value === 'object' && 'id' in value
    ? (value as { id: string | number }).id
    : value

const serializeCampaign = (campaign: Campaign) => {
  const creative =
    campaign.creative && typeof campaign.creative === 'object' ? campaign.creative : null

  return {
    id: campaign.id,
    name: campaign.name,
    brandName: campaign.brandName,
    headline: campaign.headline,
    description: campaign.description ?? '',
    callToAction: campaign.callToAction,
    width: campaign.width,
    height: campaign.height,
    startsAt: campaign.startsAt,
    endsAt: campaign.endsAt,
    status: campaign._status,
    creative: creative
      ? {
          id: creative.id,
          url: creative.url,
          alt: creative.alt,
          width: creative.width,
          height: creative.height,
        }
      : { id: relationshipID(campaign.creative) },
  }
}

export async function GET(request: Request) {
  const user = await appAuth.payloadUser(request)
  if (!user) return Response.json({ error: 'Please sign in to view campaigns.' }, { status: 401 })

  const rateLimit = checkRateLimit(`campaigns_get:${user.id}`, { limit: 100, windowMs: 60000 })
  if (!rateLimit.success) {
    return Response.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'campaigns',
    overrideAccess: false,
    user,
    draft: true,
    depth: 1,
    limit: 50,
    sort: '-updatedAt',
  })

  return Response.json({ campaigns: result.docs.map((doc) => serializeCampaign(doc)) })
}

export async function POST(request: Request) {
  const user = await appAuth.payloadUser(request)
  if (!user)
    return Response.json({ error: 'Please sign in before creating a campaign.' }, { status: 401 })

  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(`campaigns_post:${user.id}_${ip}`, { limit: 20, windowMs: 60000 })
  if (!rateLimit.success) {
    return Response.json({ error: 'Too many requests. Please wait before creating another campaign.' }, { status: 429 })
  }

  const form = await request.formData()
  const file = form.get('creative')
  const name = text(form, 'name', 120) || 'My Ad Campaign'
  const brandName = text(form, 'brandName', 120) || 'PixelWord Advertiser'
  const headline = text(form, 'headline', 180) || 'Exclusive Promotion'
  const description = text(form, 'description', 1000)
  const callToAction = text(form, 'callToAction', 40)
  const width = integer(form, 'width')
  const height = integer(form, 'height')
  const startsAt = text(form, 'startsAt', 30)
  const endsAt = text(form, 'endsAt', 30)

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'Choose an image creative.' }, { status: 400 })
  }
  if (!isAllowedImageMimeType(file.type)) {
    return Response.json(
      { error: 'Creative must be a JPG, PNG, GIF, or WebP image. SVG or executable formats are not allowed.' },
      { status: 400 },
    )
  }
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'Creative must be smaller than 10 MB.' }, { status: 400 })
  }
  if (!name || !brandName || !headline) {
    return Response.json(
      { error: 'Campaign name, business name, and headline are required.' },
      { status: 400 },
    )
  }
  if (!CTA_OPTIONS.has(callToAction)) {
    return Response.json({ error: 'Choose a valid call to action.' }, { status: 400 })
  }
  if (width < 80 || width > 1200 || height < 80 || height > 1200) {
    return Response.json(
      { error: 'Creative dimensions must be between 80 and 1200 pixels.' },
      { status: 400 },
    )
  }
  const starts = new Date(startsAt)
  const ends = new Date(endsAt)
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || ends <= starts) {
    return Response.json({ error: 'Choose a valid campaign date range.' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  let mediaID: string | number | null = null
  let organizationID: string | number

  try {
    organizationID = await ensureUserOrganization(user as any, payload)
    user.defaultOrganization = organizationID as any
  } catch (orgErr) {
    console.error('[Campaigns] Failed to resolve or provision organization:', orgErr)
    return Response.json(
      { error: 'Your account does not have an active organization.' },
      { status: 403 },
    )
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer())
  let r2PublicUrl: string | null = null

  // Upload to Cloudflare R2 if configured
  try {
    const { uploadToR2 } = await import('@/lib/storage/r2')
    r2PublicUrl = await uploadToR2({
      buffer: fileBuffer,
      filename: file.name,
      mimeType: file.type,
    })
  } catch (err) {
    console.warn('[R2 Storage] R2 upload skipped or unconfigured:', err)
  }

  // Ensure upload directory exists dynamically at request time
  const uploadDir =
    process.env.VERCEL || process.env.NODE_ENV === 'production'
      ? path.resolve(os.tmpdir(), 'media')
      : path.resolve(process.cwd(), 'media')

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
  } catch {}

  let safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  if (!safeFilename.includes('.')) {
    const ext =
      file.type === 'image/jpeg'
        ? '.jpg'
        : file.type === 'image/png'
          ? '.png'
          : file.type === 'image/webp'
            ? '.webp'
            : '.gif'
    safeFilename = `${safeFilename}${ext}`
  }

  try {
    const media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      user,
      data: {
        alt: `${brandName} — ${headline}`,
        purpose: 'creative',
        uploadedBy: user.id,
        organization: organizationID as any,
        externalURL: r2PublicUrl || undefined,
      } as any,
      file: {
        data: fileBuffer,
        mimetype: file.type,
        name: safeFilename,
        size: file.size,
      },
    })
    mediaID = media.id

    const campaign = await payload.create({
      collection: 'campaigns',
      overrideAccess: false,
      user,
      draft: true,
      depth: 1,
      data: {
        name,
        brandName,
        headline,
        description,
        callToAction: callToAction as CallToAction,
        creative: media.id,
        width,
        height,
        startsAt: starts.toISOString(),
        endsAt: ends.toISOString(),
      },
    })

    return Response.json({ campaign: serializeCampaign(campaign) }, { status: 201 })
  } catch (error) {
    if (mediaID !== null) {
      await payload
        .delete({ collection: 'media', id: mediaID, overrideAccess: true, user })
        .catch(() => undefined)
    }
    const message = error instanceof Error ? error.message : 'Unable to save the campaign.'
    console.error('[Campaign Save Error]', error)
    return Response.json({ error: message }, { status: 400 })
  }
}
