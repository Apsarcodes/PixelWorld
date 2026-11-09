import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isAllowedImageMimeType, sanitizeString } from '@/lib/security'
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
  const name = text(form, 'name', 120)
  const brandName = text(form, 'brandName', 120)
  const headline = text(form, 'headline', 180)
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
  const organizationID = relationshipID(user.defaultOrganization)
  if (!organizationID) {
    return Response.json(
      { error: 'Your account does not have an active organization.' },
      { status: 403 },
    )
  }

  try {
    const media = await payload.create({
      collection: 'media',
      overrideAccess: false,
      user,
      data: {
        alt: `${brandName} — ${headline}`,
        purpose: 'creative',
        uploadedBy: user.id,
        organization: organizationID as any,
      },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
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
        .delete({ collection: 'media', id: mediaID, overrideAccess: false, user })
        .catch(() => undefined)
    }
    const message = error instanceof Error ? error.message : 'Unable to save the campaign.'
    return Response.json({ error: message }, { status: 400 })
  }
}
