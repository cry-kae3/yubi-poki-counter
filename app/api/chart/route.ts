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

        const results = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(`
            SELECT 
                TO_CHAR(${dateGroup}, '${dateFormat}') as date,
                COUNT(*) as count
            FROM poky_records 
            WHERE employee = $1
            GROUP BY ${dateGroup}
            ORDER BY ${dateGroup} ASC
        `, employee);

        const chartData = results.map(row => ({
            date: row.date,
            count: Number(row.count),
        }));

        // 期間別にデータを補完
        if (chartData.length > 0) {
            const completeData = fillMissingDates(chartData, period);
            return NextResponse.json({ success: true, data: completeData });
        }

        return NextResponse.json({ success: true, data: chartData });
    } catch (error) {
        console.error('グラフデータ取得エラー:', error);
        return NextResponse.json(
            { success: false, error: 'グラフデータの取得に失敗しました' },
            { status: 500 }
        );
    }
}

function fillMissingDates(data: { date: string; count: number }[], period: string) {
    if (data.length === 0) return data;

    const filledData: { date: string; count: number }[] = [];
    const dataMap = new Map(data.map(item => [item.date, item.count]));

    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        let dateKey: string;

        switch (period) {
            case 'daily':
                dateKey = currentDate.toISOString().split('T')[0];
                break;
            case 'monthly':
                dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                break;
            case 'yearly':
                dateKey = String(currentDate.getFullYear());
                break;
            default:
                dateKey = currentDate.toISOString().split('T')[0];
        }

        filledData.push({
            date: dateKey,
            count: dataMap.get(dateKey) || 0
        });

        // 次の期間に進む
        switch (period) {
            case 'daily':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            case 'yearly':
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
        }
    }

    return filledData;
}