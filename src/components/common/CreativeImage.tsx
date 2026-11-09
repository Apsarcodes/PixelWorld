import React from 'react'
import Image from 'next/image'
import type { StoredCampaign } from '@/types/pixelworld'

export function CreativeImage({
  campaign,
  sizes,
  className = 'object-cover',
}: {
  campaign: StoredCampaign
  sizes: string
  className?: string
}) {
  if (!campaign.creative.url) return null
  return (
    <Image
      src={campaign.creative.url}
      alt={campaign.creative.alt || `${campaign.brandName} creative`}
      fill
      sizes={sizes}
      className={className}
    />
  )
}
