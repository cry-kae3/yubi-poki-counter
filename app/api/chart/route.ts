import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'daily';
        const employee = searchParams.get('employee') || '馬';

        let dateFormat: string;
        let dateGroup: string;

        switch (period) {
            case 'daily':
                dateFormat = 'YYYY-MM-DD';
                dateGroup = "DATE_TRUNC('day', timestamp)";
                break;
            case 'monthly':
                dateFormat = 'YYYY-MM';
                dateGroup = "DATE_TRUNC('month', timestamp)";
                break;
            case 'yearly':
                dateFormat = 'YYYY';
                dateGroup = "DATE_TRUNC('year', timestamp)";
                break;
            default:
                return NextResponse.json(
                    { success: false, error: '無効な期間タイプです' },
                    { status: 400 }
                );
        }

        const results = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT 
        TO_CHAR(${dateGroup}, ${dateFormat}) as date,
        COUNT(*) as count
      FROM poky_records 
      WHERE employee = ${employee}
      GROUP BY ${dateGroup}
      ORDER BY ${dateGroup} ASC
    `;

        const chartData = results.map(row => ({
            date: row.date,
            count: Number(row.count),
        }));

        return NextResponse.json({ success: true, data: chartData });
    } catch (error) {
        console.error('グラフデータ取得エラー:', error);
        return NextResponse.json(
            { success: false, error: 'グラフデータの取得に失敗しました' },
            { status: 500 }
        );
    }
}