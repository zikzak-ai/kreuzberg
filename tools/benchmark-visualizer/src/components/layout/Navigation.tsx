import React from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

interface NavLink {
  label: string
  href: string
  testId: string
}

const navLinks: NavLink[] = [
  {
    label: 'Home',
    href: '/',
    testId: 'nav-link-landing',
  },
  {
    label: 'Charts',
    href: '/charts',
    testId: 'nav-link-charts',
  },
  {
    label: 'Comparisons',
    href: '/comparisons',
    testId: 'nav-link-comparisons',
  },
]

interface NavigationProps {
  className?: string
}

export const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  return (
    <nav
      className={`border-b border-border bg-background ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap gap-2 md:gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              data-testid={link.testId}
            >
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full md:w-auto"
                >
                  {link.label}
                </Button>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
