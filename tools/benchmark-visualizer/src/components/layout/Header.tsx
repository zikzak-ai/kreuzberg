import React from 'react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onThemeToggle?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onThemeToggle }) => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Kreuzberg Benchmarks
          </h1>
        </div>

        {onThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            data-testid="theme-toggle"
          >
            <svg
              className="h-5 w-5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m6.364 1.636l-.707-.707M21 12h-1m-1.636 6.364l-.707.707M12 21v1m-6.364-1.636l.707.707M3 12h1m1.636-6.364l.707-.707"
              />
            </svg>
          </Button>
        )}
      </div>
    </header>
  )
}
