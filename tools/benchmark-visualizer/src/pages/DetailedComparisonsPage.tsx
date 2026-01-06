import { useState, useMemo } from 'react'
import { useBenchmark } from '@/context/BenchmarkContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type SortField = 'framework' | 'mode' | 'fileType' | 'ocrMode' | 'throughputP50' | 'throughputP95' | 'throughputP99' | 'memoryP50' | 'memoryP95' | 'memoryP99' | 'durationP50' | 'durationP95' | 'durationP99' | 'coldStart' | 'diskSize'
type SortOrder = 'asc' | 'desc'

interface TableRow {
  key: string
  framework: string
  mode: string
  fileType: string
  ocrMode: string
  throughputP50: number
  throughputP95: number
  throughputP99: number
  memoryP50: number
  memoryP95: number
  memoryP99: number
  durationP50: number
  durationP95: number
  durationP99: number
  coldStart: number | null
  diskSize: number | null
}

export function DetailedComparisonsPage() {
  const { data, loading, error } = useBenchmark()
  const [sortField, setSortField] = useState<SortField>('framework')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const tableData = useMemo(() => {
    if (!data) return []

    const rows: TableRow[] = []

    Object.entries(data.by_framework_mode).forEach(([, frameworkData]) => {
      Object.entries(frameworkData.by_file_type).forEach(([fileType, fileTypeMetrics]) => {
        if (!fileTypeMetrics.no_ocr || !fileTypeMetrics.with_ocr) {
          return
        }

        // Add row for no_ocr
        rows.push({
          key: `${frameworkData.framework}-${frameworkData.mode}-${fileType}-no_ocr`,
          framework: frameworkData.framework,
          mode: frameworkData.mode,
          fileType,
          ocrMode: 'no_ocr',
          throughputP50: fileTypeMetrics.no_ocr.throughput.p50,
          throughputP95: fileTypeMetrics.no_ocr.throughput.p95,
          throughputP99: fileTypeMetrics.no_ocr.throughput.p99,
          memoryP50: fileTypeMetrics.no_ocr.memory.p50,
          memoryP95: fileTypeMetrics.no_ocr.memory.p95,
          memoryP99: fileTypeMetrics.no_ocr.memory.p99,
          durationP50: fileTypeMetrics.no_ocr.duration.p50,
          durationP95: fileTypeMetrics.no_ocr.duration.p95,
          durationP99: fileTypeMetrics.no_ocr.duration.p99,
          coldStart: frameworkData.cold_start?.p50_ms ?? null,
          diskSize: data.disk_sizes[frameworkData.framework]?.size_bytes ?? null,
        })

        // Add row for with_ocr
        rows.push({
          key: `${frameworkData.framework}-${frameworkData.mode}-${fileType}-with_ocr`,
          framework: frameworkData.framework,
          mode: frameworkData.mode,
          fileType,
          ocrMode: 'with_ocr',
          throughputP50: fileTypeMetrics.with_ocr.throughput.p50,
          throughputP95: fileTypeMetrics.with_ocr.throughput.p95,
          throughputP99: fileTypeMetrics.with_ocr.throughput.p99,
          memoryP50: fileTypeMetrics.with_ocr.memory.p50,
          memoryP95: fileTypeMetrics.with_ocr.memory.p95,
          memoryP99: fileTypeMetrics.with_ocr.memory.p99,
          durationP50: fileTypeMetrics.with_ocr.duration.p50,
          durationP95: fileTypeMetrics.with_ocr.duration.p95,
          durationP99: fileTypeMetrics.with_ocr.duration.p99,
          coldStart: frameworkData.cold_start?.p50_ms ?? null,
          diskSize: data.disk_sizes[frameworkData.framework]?.size_bytes ?? null,
        })
      })
    })

    // Sort the data
    const sorted = rows.sort((a, b) => {
      let aVal: any = a[sortField as keyof TableRow]
      let bVal: any = b[sortField as keyof TableRow]

      if (aVal === null && bVal === null) return 0
      if (aVal === null) return sortOrder === 'asc' ? 1 : -1
      if (bVal === null) return sortOrder === 'asc' ? -1 : 1

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return sorted
  }, [data, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-semibold hover:bg-transparent"
    >
      {label}
      {sortField === field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
    </Button>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-64 mb-6" data-testid="skeleton-comparisons" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" data-testid="error-message">
          <AlertDescription>Error: {error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div data-testid="page-comparisons" className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Detailed Comparisons</h1>

      <div className="rounded-md border overflow-x-auto">
        <Table data-testid="table-comparisons">
          <TableHeader>
            <TableRow>
              <TableHead data-testid="table-header-framework" className="min-w-32">
                <SortButton field="framework" label="Framework" />
              </TableHead>
              <TableHead data-testid="table-header-mode" className="min-w-24">
                <SortButton field="mode" label="Mode" />
              </TableHead>
              <TableHead data-testid="table-header-file-type" className="min-w-24">
                <SortButton field="fileType" label="File Type" />
              </TableHead>
              <TableHead data-testid="table-header-ocr-mode" className="min-w-24">
                <SortButton field="ocrMode" label="OCR Mode" />
              </TableHead>
              <TableHead data-testid="table-header-throughput-p50" className="min-w-32 text-right">
                <SortButton field="throughputP50" label="Throughput p50 (MB/s)" />
              </TableHead>
              <TableHead data-testid="table-header-throughput-p95" className="min-w-32 text-right">
                <SortButton field="throughputP95" label="Throughput p95 (MB/s)" />
              </TableHead>
              <TableHead data-testid="table-header-throughput-p99" className="min-w-32 text-right">
                <SortButton field="throughputP99" label="Throughput p99 (MB/s)" />
              </TableHead>
              <TableHead data-testid="table-header-memory-p50" className="min-w-28 text-right">
                <SortButton field="memoryP50" label="Memory p50 (MB)" />
              </TableHead>
              <TableHead data-testid="table-header-memory-p95" className="min-w-28 text-right">
                <SortButton field="memoryP95" label="Memory p95 (MB)" />
              </TableHead>
              <TableHead data-testid="table-header-memory-p99" className="min-w-28 text-right">
                <SortButton field="memoryP99" label="Memory p99 (MB)" />
              </TableHead>
              <TableHead data-testid="table-header-duration-p50" className="min-w-28 text-right">
                <SortButton field="durationP50" label="Duration p50 (ms)" />
              </TableHead>
              <TableHead data-testid="table-header-duration-p95" className="min-w-28 text-right">
                <SortButton field="durationP95" label="Duration p95 (ms)" />
              </TableHead>
              <TableHead data-testid="table-header-duration-p99" className="min-w-28 text-right">
                <SortButton field="durationP99" label="Duration p99 (ms)" />
              </TableHead>
              <TableHead data-testid="table-header-cold-start" className="min-w-28 text-right">
                <SortButton field="coldStart" label="Cold Start (ms)" />
              </TableHead>
              <TableHead data-testid="table-header-disk-size" className="min-w-24 text-right">
                <SortButton field="diskSize" label="Disk Size" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center text-muted-foreground py-4">
                  No benchmark data available
                </TableCell>
              </TableRow>
            ) : (
              tableData.map(row => (
                <TableRow key={row.key} data-testid={`table-row-${row.key}`}>
                  <TableCell className="font-medium" data-testid={`cell-framework-${row.key}`}>
                    {row.framework}
                  </TableCell>
                  <TableCell data-testid={`cell-mode-${row.key}`}>{row.mode}</TableCell>
                  <TableCell data-testid={`cell-fileType-${row.key}`}>{row.fileType}</TableCell>
                  <TableCell data-testid={`cell-ocrMode-${row.key}`}>{row.ocrMode === 'no_ocr' ? 'No OCR' : 'With OCR'}</TableCell>
                  <TableCell className="text-right" data-testid={`cell-throughputP50-${row.key}`}>
                    {row.throughputP50.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-throughputP95-${row.key}`}>
                    {row.throughputP95.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-throughputP99-${row.key}`}>
                    {row.throughputP99.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-memoryP50-${row.key}`}>
                    {row.memoryP50.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-memoryP95-${row.key}`}>
                    {row.memoryP95.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-memoryP99-${row.key}`}>
                    {row.memoryP99.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-durationP50-${row.key}`}>
                    {row.durationP50.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-durationP95-${row.key}`}>
                    {row.durationP95.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-durationP99-${row.key}`}>
                    {row.durationP99.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-coldStart-${row.key}`}>
                    {row.coldStart !== null ? row.coldStart.toFixed(2) : '—'}
                  </TableCell>
                  <TableCell className="text-right" data-testid={`cell-diskSize-${row.key}`}>
                    {row.diskSize !== null ? formatBytes(row.diskSize) : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
