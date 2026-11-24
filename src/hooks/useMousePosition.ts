import { useEffect, useState } from 'react'

export function useMousePosition() {
  const [position, setPosition] = useState({ x: -30, y: -30 })
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const update = (event: PointerEvent) => setPosition({ x: event.clientX, y: event.clientY })
    window.addEventListener('pointermove', update)
    return () => window.removeEventListener('pointermove', update)
  }, [])
  return position
}
