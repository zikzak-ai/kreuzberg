import React from 'react'

interface FooterMetadata {
  version?: string
  timestamp?: string
  benchmarkCount?: number
}

interface FooterProps {
  metadata?: FooterMetadata
  className?: string
}

export const Footer: React.FC<FooterProps> = ({ metadata, className = '' }) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={`border-t border-border bg-background mt-auto ${className}`}
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            <p>© {currentYear} Kreuzberg Benchmarks. All rights reserved.</p>
          </div>

          {metadata && (
            <div className="text-sm text-muted-foreground space-y-1 md:space-y-0 md:flex md:gap-6">
              {metadata.version && (
                <div data-testid="footer-version">
                  <span className="font-medium">Version:</span> {metadata.version}
                </div>
              )}
              {metadata.benchmarkCount !== undefined && (
                <div data-testid="footer-benchmark-count">
                  <span className="font-medium">Benchmarks:</span> {metadata.benchmarkCount}
                </div>
              )}
              {metadata.timestamp && (
                <div data-testid="footer-timestamp">
                  <span className="font-medium">Updated:</span> {new Date(metadata.timestamp).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
          <p>Performance benchmarking suite for Kreuzberg framework</p>
        </div>
      </div>
    </footer>
  )
}
