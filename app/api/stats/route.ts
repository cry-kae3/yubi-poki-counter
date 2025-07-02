import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employee = searchParams.get('employee') || '馬';

    // 今日の記録数
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await prisma.pokyRecord.count({
      where: {
        employee,
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    });

    // 総記録数
    const totalCount = await prisma.pokyRecord.count({
      where: { employee },
    });

    return NextResponse.json({
      success: true,
      data: {
        todayCount,
        totalCount,
      }
    });
  } catch (error) {
    console.error('統計取得エラー:', error);
    return NextResponse.json(
      { success: false, error: '統計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
