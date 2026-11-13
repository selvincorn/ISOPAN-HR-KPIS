import type { KPIDefinition, KPIRecord } from './database'

export type KPIStatus = 'green' | 'yellow' | 'red'
export type TargetOperator = '<=' | '>=' | '='
export type Frequency = 'weekly' | 'monthly' | 'semi_annual'

export interface KPIWithRecords extends KPIDefinition {
  records: KPIRecord[]
  latestRecord?: KPIRecord
}

export interface KPITrendPoint {
  period: string
  actual: number
  target: number
  status: KPIStatus
}

export interface KPISummary {
  total: number
  green: number
  yellow: number
  red: number
  noData: number
}
