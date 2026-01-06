import { useMemo } from 'react'
import { useBenchmark } from '@/context/BenchmarkContext'
import { Select } from '@/components/ui/select'

export interface FileTypeFilterProps {
  onChange: (fileType: string) => void
  value?: string
  'data-testid'?: string
}

export function FileTypeFilter({
  onChange,
  value = '',
  'data-testid': testId = 'file-type-filter',
}: FileTypeFilterProps) {
  const { data } = useBenchmark()

  const fileTypes = useMemo(() => {
    if (!data?.by_framework_mode) {
      return []
    }
    const types = new Set<string>()
    Object.values(data.by_framework_mode).forEach(frameworkData => {
      Object.keys(frameworkData.by_file_type).forEach(fileType => {
        types.add(fileType)
      })
    })
    return Array.from(types).sort()
  }, [data])

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="file-type-filter" className="text-sm font-medium">
        File Type
      </label>
      <Select
        id="file-type-filter"
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All File Types</option>
        {fileTypes.map((fileType) => (
          <option key={fileType} value={fileType}>
            {fileType}
          </option>
        ))}
      </Select>
    </div>
  )
}
