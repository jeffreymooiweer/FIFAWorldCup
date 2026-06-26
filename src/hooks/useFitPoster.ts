import { useCallback, useEffect, useRef, useState } from 'react'

interface PosterSize {
  width: number
  height: number
}

const MIN_SCALE = 0.15
const MAX_SCALE = 2.5
const ZOOM_STEP = 0.1

function clampScale(value: number) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(value.toFixed(2))))
}

function touchDistance(touches: TouchList) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.hypot(dx, dy)
}

export function useFitPoster() {
  const posterRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<PosterSize>({ width: 0, height: 0 })
  const [fitScale, setFitScale] = useState(1)
  const [manualScale, setManualScale] = useState<number | null>(null)
  const scaleRef = useRef(1)
  const fitScaleRef = useRef(1)
  const pinchRef = useRef({ distance: 0, scale: 1 })

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
  scaleRef.current = scale
  fitScaleRef.current = fitScale

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return
      pinchRef.current = {
        distance: touchDistance(event.touches),
        scale: scaleRef.current,
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || pinchRef.current.distance === 0) return
      event.preventDefault()
      const distance = touchDistance(event.touches)
      const next = pinchRef.current.scale * (distance / pinchRef.current.distance)
      setManualScale(clampScale(next))
    }

    const endPinch = (event: TouchEvent) => {
      if (event.touches.length < 2) pinchRef.current.distance = 0
    }

    viewport.addEventListener('touchstart', onTouchStart, { passive: true })
    viewport.addEventListener('touchmove', onTouchMove, { passive: false })
    viewport.addEventListener('touchend', endPinch)
    viewport.addEventListener('touchcancel', endPinch)

    return () => {
      viewport.removeEventListener('touchstart', onTouchStart)
      viewport.removeEventListener('touchmove', onTouchMove)
      viewport.removeEventListener('touchend', endPinch)
      viewport.removeEventListener('touchcancel', endPinch)
    }
  }, [])

  const zoomIn = useCallback(() => {
    setManualScale((current) => {
      const base = current ?? fitScaleRef.current
      return clampScale(base + ZOOM_STEP)
    })
  }, [])

  const zoomOut = useCallback(() => {
    setManualScale((current) => {
      const base = current ?? fitScaleRef.current
      return clampScale(base - ZOOM_STEP)
    })
  }, [])

  const resetZoom = useCallback(() => {
    setManualScale(null)
  }, [])

  return {
    posterRef,
    viewportRef,
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
