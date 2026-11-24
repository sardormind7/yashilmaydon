import { useEffect, useRef } from 'react'

interface Player {
  x: number
  y: number
  dx: number
  dy: number
  team: number
}
export function FootballFieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    let width = 0,
      height = 0,
      frame = 0,
      hidden = document.hidden
    let pointer = { x: -1000, y: -1000 }
    const players: Player[] = Array.from({ length: 12 }, (_, i) => ({
      x: ((i % 6) + 0.7) / 7,
      y: (Math.floor(i / 6) + 0.5) / 2,
      dx: 0,
      dy: 0,
      team: Math.floor(i / 6),
    }))
    let ball = { x: 0.5, y: 0.5, tx: 0.7, ty: 0.4, progress: 0 }
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
    }
    const paint = () => {
      if (hidden) return
      context.clearRect(0, 0, width, height)
      const fieldW = Math.min(width * 0.82, 1020),
        fieldH = Math.min(height * 0.84, 650),
        left = (width - fieldW) / 2,
        top = (height - fieldH) / 2
      context.strokeStyle = document.documentElement.classList.contains('dark')
        ? 'rgba(126,220,165,.12)'
        : 'rgba(22,131,75,.10)'
      context.lineWidth = 1.2
      context.strokeRect(left, top, fieldW, fieldH)
      context.beginPath()
      context.moveTo(width / 2, top)
      context.lineTo(width / 2, top + fieldH)
      context.stroke()
      context.beginPath()
      context.arc(width / 2, height / 2, fieldH * 0.13, 0, Math.PI * 2)
      context.stroke()
      const boxW = fieldW * 0.16,
        boxH = fieldH * 0.42,
        goalW = fieldW * 0.055,
        goalH = fieldH * 0.19
      context.strokeRect(left, top + (fieldH - boxH) / 2, boxW, boxH)
      context.strokeRect(left + fieldW - boxW, top + (fieldH - boxH) / 2, boxW, boxH)
      context.strokeRect(left - goalW, top + (fieldH - goalH) / 2, goalW, goalH)
      context.strokeRect(left + fieldW, top + (fieldH - goalH) / 2, goalW, goalH)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduced) {
        ball.progress += 0.0025
        if (ball.progress >= 1) {
          ball = {
            ...ball,
            x: ball.tx,
            y: ball.ty,
            tx: players[Math.floor(Math.random() * players.length)].x,
            ty: players[Math.floor(Math.random() * players.length)].y,
            progress: 0,
          }
        }
      }
      const bx = (ball.x + (ball.tx - ball.x) * ball.progress) * width,
        by = (ball.y + (ball.ty - ball.y) * ball.progress) * height
      players.forEach((player, index) => {
        const px = player.x * width,
          py = player.y * height,
          dist = Math.hypot(pointer.x - px, pointer.y - py)
        const influence = Math.max(0, 1 - dist / 240) * 0.035
        if (!reduced) {
          player.dx += (pointer.x < px ? influence : -influence) - player.dx * 0.04
          player.dy += (pointer.y < py ? influence : -influence) - player.dy * 0.04
        }
        context.beginPath()
        context.fillStyle = player.team ? 'rgba(245,180,73,.55)' : 'rgba(22,131,75,.58)'
        context.arc(px + player.dx * width, py + player.dy * height, 4.5, 0, Math.PI * 2)
        context.fill()
        if (index === 0) {
          const distance = Math.hypot(pointer.x - bx, pointer.y - by)
          if (distance < 100 && !reduced) {
            ball.tx += ((pointer.x - bx) / width) * 0.0008
            ball.ty += ((pointer.y - by) / height) * 0.0008
          }
        }
      })
      context.beginPath()
      context.fillStyle = 'rgba(255,255,255,.92)'
      context.arc(bx, by, 4, 0, Math.PI * 2)
      context.fill()
      if (!reduced) frame = requestAnimationFrame(paint)
    }
    const visibility = () => {
      hidden = document.hidden
      if (hidden) cancelAnimationFrame(frame)
      else paint()
    }
    resize()
    paint()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])
  return <canvas aria-hidden="true" ref={canvasRef} className="field-background" />
}
