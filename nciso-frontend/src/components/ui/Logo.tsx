import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield with padlock */}
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      
      {/* Shield */}
      <path
        d="M20 5 L35 8 L35 18 C35 25 28 30 20 35 L5 30 L5 18 C5 25 12 30 20 25 L20 5 Z"
        fill="url(#shieldGradient)"
        stroke="#1e40af"
        strokeWidth="1"
      />
      
      {/* Padlock */}
      <rect x="15" y="18" width="10" height="8" rx="1" fill="none" stroke="#000" strokeWidth="1.5"/>
      <path d="M17 18 L17 15 C17 12 19 10 22 10 C25 10 27 12 27 15 L27 18" stroke="#000" strokeWidth="1.5" fill="none"/>
      <circle cx="22" cy="22" r="1.5" fill="#000"/>
      
      {/* Network nodes */}
      <circle cx="8" cy="12" r="2" fill="#60a5fa"/>
      <circle cx="32" cy="12" r="2" fill="#60a5fa"/>
      <circle cx="8" cy="28" r="2" fill="#60a5fa"/>
      <circle cx="32" cy="28" r="2" fill="#60a5fa"/>
      
      {/* Connecting lines */}
      <path d="M10 12 Q20 8 30 12" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
      <path d="M10 28 Q20 32 30 28" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
      <path d="M8 14 Q8 20 8 26" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
      <path d="M32 14 Q32 20 32 26" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
      
      {/* Text "n.CISO" */}
      <text x="45" y="15" fill="white" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif">
        n<tspan fill="#60a5fa">.</tspan>CISO
      </text>
    </svg>
  )
} 