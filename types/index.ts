export interface PokyRecord {
    id: string;
    timestamp: Date;
    employee: string;
}

export interface StatsData {
    date: string;
    count: number;
}

export interface SearchFilter {
    startDate?: Date;
    endDate?: Date;
    employee?: string;
}

export enum PeriodType {
    DAILY = 'daily',
    MONTHLY = 'monthly',
    YEARLY = 'yearly'
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface CreatePokyRecordInput {
    employee: string;
    timestamp?: Date;
  }