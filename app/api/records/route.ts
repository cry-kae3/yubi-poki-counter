import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

export async function GET() {
  try {
    const records = await prisma.pokyRecord.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const mappedRecords = records.map(record => ({
      id: record.id,
      timestamp: record.timestamp.toISOString(),
      employee: record.employee,
    }));

    return NextResponse.json({ success: true, data: mappedRecords });
  } catch (error) {
    console.error('記録取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { employee, timestamp } = await request.json();

    const record = await prisma.pokyRecord.create({
      data: {
        employee,
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        timestamp: record.timestamp.toISOString(),
        employee: record.employee,
      }
    });
  } catch (error) {
    console.error('記録保存エラー:', error);
    return NextResponse.json(
      { success: false, error: 'データの保存に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDが指定されていません' },
        { status: 400 }
      );
    }

    await prisma.pokyRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('記録削除エラー:', error);
    return NextResponse.json(
      { success: false, error: 'データの削除に失敗しました' },
      { status: 500 }
    );
  }
}
