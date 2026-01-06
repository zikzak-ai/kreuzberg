import { useMemo } from 'react'
import { useBenchmark } from '@/context/BenchmarkContext'
import { Select } from '@/components/ui/select'

export interface FrameworkFilterProps {
  onChange: (framework: string) => void
  value?: string
  'data-testid'?: string
}

export function FrameworkFilter({
  onChange,
  value = '',
  'data-testid': testId = 'framework-filter',
}: FrameworkFilterProps) {
  const { data } = useBenchmark()

  const frameworks = useMemo(() => {
    if (!data?.by_framework_mode) {
      return []
    }
    return Array.from(
      new Set(
        Object.values(data.by_framework_mode).map(item => item.framework)
      )
    ).sort()
  }, [data])

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="framework-filter" className="text-sm font-medium">
        Framework
      </label>
      <Select
        id="framework-filter"
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All Frameworks</option>
        {frameworks.map((framework) => (
          <option key={framework} value={framework}>
            {framework}
          </option>
        ))}
      </Select>
    </div>
  )
}
