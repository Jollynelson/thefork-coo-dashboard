import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function useAutoExpand(defaultId?: string | null) {
  const location = useLocation()
  const openId = (location.state as { openId?: string } | null)?.openId
  const [expanded, setExpanded] = useState<string | null>(openId ?? defaultId ?? null)

  useEffect(() => {
    if (openId) {
      setExpanded(openId)
      setTimeout(() => {
        const el = document.getElementById(`record-${openId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
    }
  }, [openId])

  return { expanded, setExpanded }
}
