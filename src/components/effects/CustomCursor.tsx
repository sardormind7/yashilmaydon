import { useEffect, useState } from 'react'
import { useMousePosition } from '../../hooks/useMousePosition'
export function CustomCursor() {
  const point = useMousePosition()
  const [active, setActive] = useState(false)
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    if (!fine.matches) return
    const move = (event: PointerEvent) =>
      setActive(Boolean((event.target as HTMLElement).closest('a,button')))
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return (
    <>
      <span
        className={`cursor-dot ${active ? 'cursor-active' : ''}`}
        style={{ transform: `translate(${point.x}px,${point.y}px)` }}
      />
      <span
        className={`cursor-ring ${active ? 'cursor-active' : ''}`}
        style={{ transform: `translate(${point.x}px,${point.y}px)` }}
      />
    </>
  )
}
