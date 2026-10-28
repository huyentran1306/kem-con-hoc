import React from 'react'

export function NavHome({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <path className="f" d="M3.5 10.5L12 4l8.5 6.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
      <path className="w" d="M9.5 21v-6a2.5 2.5 0 0 1 5 0v6" />
      <circle className="h" cx="12" cy="11.5" r="1.3" />
    </svg>
  )
}

export function NavUsers({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <circle className="f" cx="5.4" cy="7.4" r="1.9" />
      <circle className="f" cx="12.6" cy="7.4" r="1.9" />
      <circle className="f" cx="9" cy="11.8" r="5" />
      <circle className="d" cx="7.3" cy="11.2" r=".7" />
      <circle className="d" cx="10.7" cy="11.2" r=".7" />
      <ellipse className="w" cx="9" cy="13.6" rx="1.7" ry="1.2" />
      <circle className="d" cx="9" cy="13.2" r=".5" />
      <circle className="f" cx="15.6" cy="13.4" r="1.3" />
      <circle className="f" cx="20.2" cy="13.4" r="1.3" />
      <circle className="f" cx="17.9" cy="16.6" r="3.4" />
      <circle className="d" cx="16.8" cy="16.2" r=".55" />
      <circle className="d" cx="19" cy="16.2" r=".55" />
    </svg>
  )
}

export function NavCap({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <path className="h" style={{ stroke: '#6B4A2B', strokeWidth: 1.6 }} d="M12 8.2c-1.6-1.3-5.2-1.6-6.5 1.2-1.6 3.3.3 9.8 3.4 10.8 1.2.4 2-.4 3.1-.4s1.9.8 3.1.4c3.1-1 5-7.5 3.4-10.8-1.3-2.8-4.9-2.5-6.5-1.2z" />
      <path d="M12 8.2c0-2 .8-3.6 2.4-4.6" />
      <path className="l" d="M12.8 5.8c1.4-1.9 3.9-1.8 4.7-1.4-.4 1.7-2.5 2.8-4.7 1.4z" />
      <path className="w" style={{ stroke: 'none', opacity: 0.7 }} d="M7.6 10.6c.5-1 1.4-1.4 2.2-1.3-.4.6-.9 1.3-1.1 2.3z" />
    </svg>
  )
}

export function NavBook({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <path className="f" d="M3 6.6c3.1-1.1 6.1-.8 9 1.1v12c-2.9-1.9-5.9-2.2-9-1.1z" />
      <path className="w" d="M21 6.6c-3.1-1.1-6.1-.8-9 1.1v12c2.9-1.9 5.9-2.2 9-1.1z" />
      <path className="s" d="M15.5 6.4v5l1.5-1.1 1.5 1.1V6.2" />
      <path d="M5.5 10.2c1.6-.3 3-.1 4.2.5M5.5 13.2c1.6-.3 3-.1 4.2.5" />
    </svg>
  )
}

export function NavSpark({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <path className="f" d="M10.5 3.5l1.9 4.9 4.9 1.9-4.9 1.9-1.9 4.9-1.9-4.9-4.9-1.9 4.9-1.9z" />
      <path className="s" d="M18.4 13.6l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9z" />
      <circle className="h" cx="5" cy="18.5" r="1.3" />
    </svg>
  )
}

export function NavShield({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <path className="f" d="M12 3.2l7.4 2.8v5.6c0 4.5-3.1 7.9-7.4 9.3-4.3-1.4-7.4-4.8-7.4-9.3V6z" />
      <ellipse className="d" cx="12" cy="14" rx="2.4" ry="1.9" />
      <circle className="d" cx="9.4" cy="11" r=".95" />
      <circle className="d" cx="11" cy="9.5" r=".95" />
      <circle className="d" cx="13" cy="9.5" r=".95" />
      <circle className="d" cx="14.6" cy="11" r=".95" />
    </svg>
  )
}

export function NavPalette({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <path className="f" d="M12 3.2a8.8 8.8 0 1 0 0 17.6c1.4 0 2-.9 2-1.9 0-1.4-1-1.8-1-3 0-1 .8-1.9 2-1.9h2a4 4 0 0 0 4-4c0-3.9-4-6.8-9-6.8z" />
      <circle className="h" cx="7.4" cy="11.2" r="1.5" />
      <circle className="s" cx="9.6" cy="7.2" r="1.5" />
      <circle className="l" style={{ stroke: 'none' }} cx="14.4" cy="7" r="1.5" />
      <circle className="k" cx="7.8" cy="15.6" r="1.5" />
    </svg>
  )
}

export function NavServer({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <path className="f" d="M7 18.8a4.1 4.1 0 0 1-.7-8.1 5.6 5.6 0 0 1 10.8-1.3 4.3 4.3 0 0 1 .5 8.6z" />
      <path className="w" d="M10.2 13.6l1.4 1.5 3-3.2" style={{ fill: 'none', stroke: '#3E9A5A', strokeWidth: 1.9 }} />
    </svg>
  )
}

export function NavKey({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={`cute ${className}`} {...props}>
      <path className="f" d="M4 8.2l4.2 3.6L12 5.6l3.8 6.2L20 8.2 18.4 18H5.6z" />
      <circle className="s" cx="4" cy="7.6" r="1.4" />
      <circle className="s" cx="12" cy="4.8" r="1.4" />
      <circle className="s" cx="20" cy="7.6" r="1.4" />
      <path d="M6 20.6h12" />
      <circle className="h" cx="12" cy="14.6" r="1.3" />
    </svg>
  )
}

export const NAV_ICONS = {
  home: NavHome,
  users: NavUsers,
  cap: NavCap,
  book: NavBook,
  spark: NavSpark,
  shield: NavShield,
  palette: NavPalette,
  server: NavServer,
  key: NavKey,
}

export function NavIcon({ name, className = '', ...props }) {
  const Comp = NAV_ICONS[name]
  if (!Comp) return null
  return <Comp className={className} {...props} />
}
