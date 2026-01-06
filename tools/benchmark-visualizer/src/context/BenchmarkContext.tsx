import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AggregatedBenchmarkData } from '@/types/benchmark'
import { BenchmarkDataService } from '@/services/benchmarkService'

interface BenchmarkContextState {
  data: AggregatedBenchmarkData | null
  loading: boolean
  error: Error | null
}

const BenchmarkContext = createContext<BenchmarkContextState | undefined>(undefined)

export function BenchmarkProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BenchmarkContextState>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    BenchmarkDataService.fetchData()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }))
  }, [])

  return (
    <BenchmarkContext.Provider value={state}>
      {children}
    </BenchmarkContext.Provider>
  )
}

export function useBenchmark() {
  const context = useContext(BenchmarkContext)
  if (!context) {
    throw new Error('useBenchmark must be used within BenchmarkProvider')
  }
  return context
}
