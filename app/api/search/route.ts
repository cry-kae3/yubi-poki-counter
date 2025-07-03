import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const employee = searchParams.get('employee') || '馬';
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');

        let whereCondition: any = { employee };

        // 日付範囲の条件を構築
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            whereCondition.timestamp = {
                gte: start,
                lte: end,
            };
        } else if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            whereCondition.timestamp = {
                gte: start,
            };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            whereCondition.timestamp = {
                lte: end,
            };
        }

        // クエリオプションを構築
        const queryOptions: any = {
            where: whereCondition,
            orderBy: { timestamp: 'desc' },
        };

        // ページネーション対応
        if (limit) {
            queryOptions.take = parseInt(limit);
        }

        if (offset) {
            queryOptions.skip = parseInt(offset);
        }

        // データ取得と件数取得を並列実行
        const [records, totalCount] = await Promise.all([
            prisma.pokyRecord.findMany(queryOptions),
            prisma.pokyRecord.count({ where: whereCondition })
        ]);

        const mappedRecords = records.map(record => ({
            id: record.id,
            timestamp: record.timestamp.toISOString(),
            employee: record.employee,
        }));

        return NextResponse.json({
            success: true,
            data: mappedRecords,
            totalCount,
            hasMore: limit ? (parseInt(offset || '0') + parseInt(limit)) < totalCount : false
        });
    } catch (error) {
        console.error('検索エラー:', error);
        return NextResponse.json(
            { success: false, error: '検索に失敗しました' },
            { status: 500 }
        );
    }
}