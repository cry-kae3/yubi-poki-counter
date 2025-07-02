import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const employee = searchParams.get('employee') || '馬';

        let whereCondition: any = { employee };

        if (startDate && endDate) {
            whereCondition.timestamp = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        } else if (startDate) {
            whereCondition.timestamp = {
                gte: new Date(startDate),
            };
        } else if (endDate) {
            whereCondition.timestamp = {
                lte: new Date(endDate),
            };
        }

        const records = await prisma.pokyRecord.findMany({
            where: whereCondition,
            orderBy: { timestamp: 'desc' },
        });

        const mappedRecords = records.map(record => ({
            id: record.id,
            timestamp: record.timestamp.toISOString(),
            employee: record.employee,
        }));

        return NextResponse.json({ success: true, data: mappedRecords });
    } catch (error) {
        console.error('検索エラー:', error);
        return NextResponse.json(
            { success: false, error: '検索に失敗しました' },
            { status: 500 }
        );
    }
}