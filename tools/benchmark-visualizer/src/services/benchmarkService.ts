import type { AggregatedBenchmarkData } from '@/types/benchmark'

export class BenchmarkDataService {
  private static readonly DATA_URL = '/aggregated.json'

  static async fetchData(): Promise<AggregatedBenchmarkData> {
    const response = await fetch(this.DATA_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch benchmark data: ${response.statusText}`)
    }
    return response.json()
  }
}
