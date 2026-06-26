import { useCallback, useEffect, useRef, useState } from 'react'

interface PosterSize {
  width: number
  height: number
}

const MIN_SCALE = 0.15
const MAX_SCALE = 1.5
const ZOOM_STEP = 0.1

export function useFitPoster() {
  const posterRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<PosterSize>({ width: 0, height: 0 })
  const [fitScale, setFitScale] = useState(1)
  const [manualScale, setManualScale] = useState<number | null>(null)

  const updateFitScale = useCallback(() => {
    const poster = posterRef.current
    if (!poster) return

    const width = poster.offsetWidth
    const height = poster.offsetHeight
    if (width === 0 || height === 0) return

    setSize({ width, height })

    const padding = 32
    const nextFit = Math.min(1, (window.innerWidth - padding) / width)
    setFitScale(nextFit)
  }, [])

  useEffect(() => {
    const poster = posterRef.current
    if (!poster) return

    const observer = new ResizeObserver(updateFitScale)
    observer.observe(poster)
    updateFitScale()
    window.addEventListener('resize', updateFitScale)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateFitScale)
    }
  }, [updateFitScale])

  const scale = manualScale ?? fitScale

  const zoomIn = useCallback(() => {
    setManualScale((current) => {
      const base = current ?? fitScale
      return Math.min(MAX_SCALE, Number((base + ZOOM_STEP).toFixed(2)))
    })
  }, [fitScale])

  const zoomOut = useCallback(() => {
    setManualScale((current) => {
      const base = current ?? fitScale
      return Math.max(MIN_SCALE, Number((base - ZOOM_STEP).toFixed(2)))
    })
  }, [fitScale])

  const resetZoom = useCallback(() => {
    setManualScale(null)
  }, [])

  return {
    posterRef,
    scale,
    fitScale,
    scaledWidth: size.width * scale,
    scaledHeight: size.height * scale,
    zoomIn,
    zoomOut,
    resetZoom,
    isCustomZoom: manualScale !== null,
  }
}
