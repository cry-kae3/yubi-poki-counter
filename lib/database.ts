import { PrismaClient } from '@prisma/client';
import { PokyRecord, StatsData, PeriodType } from '../types';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const saveRecord = async (
    record: Omit<PokyRecord, 'id'>
): Promise<PokyRecord> => {
    try {
        const createdRecord = await prisma.pokyRecord.create({
            data: {
                timestamp: record.timestamp,
                employee: record.employee,
            },
        });

        return {
            id: createdRecord.id,
            timestamp: createdRecord.timestamp,
            employee: createdRecord.employee,
        };
    } catch (error) {
        console.error('記録の保存に失敗しました:', error);
        throw new Error('データベースへの保存に失敗しました');
    }
};

export const getRecords = async (): Promise<PokyRecord[]> => {
    try {
        const records = await prisma.pokyRecord.findMany({
            orderBy: { timestamp: 'desc' },
        });

        return records.map(record => ({
            id: record.id,
            timestamp: record.timestamp,
            employee: record.employee,
        }));
    } catch (error) {
        console.error('記録の取得に失敗しました:', error);
        throw new Error('データベースからの取得に失敗しました');
    }
};

export const getTodayCount = async (employee: string): Promise<number> => {
    try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const count = await prisma.pokyRecord.count({
            where: {
                employee: employee,
                timestamp: { gte: startOfDay, lte: endOfDay },
            },
        });

        return count;
    } catch (error) {
        console.error('今日の記録数取得に失敗しました:', error);
        throw new Error('今日の記録数取得に失敗しました');
    }
};

export const getTotalCount = async (employee: string): Promise<number> => {
    try {
        const count = await prisma.pokyRecord.count({
            where: { employee: employee },
        });
        return count;
    } catch (error) {
        console.error('総記録数取得に失敗しました:', error);
        throw new Error('総記録数取得に失敗しました');
    }
};