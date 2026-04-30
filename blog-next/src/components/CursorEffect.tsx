import { useState, useEffect } from "react"

const CursorEffect = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isClicking, setIsClicking] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 直接更新位置，不做任何节流，确保最快速度响应
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)

      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
          target.closest('a') || target.closest('button')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div
      className={`fixed pointer-events-none z-[9999] ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: isClicking ? "scale(0.9)" : isHovering ? "scale(1.2)" : "scale(1)",
        transition: "transform 0.05s ease-out, opacity 0.1s ease-out",
        willChange: "transform, left, top",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        style={{ willChange: "transform" }}
      >
        <defs>
          <linearGradient id="cursorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M4 4 L20 12 L14 14 L12 20 L4 4 Z"
          fill="url(#cursorGradient)"
          filter="url(#glow)"
        />
        
        <path
          d="M6 6 L18 13 L13 15 L11 19 L6 6 Z"
          fill="rgba(255,255,255,0.3)"
        />

        {isClicking && (
          <circle
            cx="16"
            cy="16"
            r="20"
            fill="none"
            stroke="url(#cursorGradient)"
            strokeWidth="2"
            opacity="0.5"
          />
        )}
      </svg>
      
      {isHovering && (
        <div
          className="absolute top-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20"
          style={{
            width: 50,
            height: 50,
            transform: "translate(-9px, -9px)",
          }}
        />
      )}
    </div>
  )
}

export default CursorEffect