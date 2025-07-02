'use client';

import React, { useState, useEffect } from 'react';
import { PokyRecord } from '../types';
import RecordDialog from './RecordDialog';
import RecordsTable from './RecordsTable';
import StatsChart from './StatsChart';

const Counter: React.FC = () => {
  const [records, setRecords] = useState<PokyRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState<boolean>(false);

  const employeeName = '馬';

  useEffect(() => {
    loadData();
  }, [employeeName]);

  const handleCountClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const timestamp = new Date();

      // API経由でデータ保存
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee: employeeName,
          timestamp: timestamp.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      const result = await response.json();

      if (result.success) {
        const savedRecord = {
          ...result.data,
          timestamp: new Date(result.data.timestamp)
        };
        
        setRecords(prevRecords => [savedRecord, ...prevRecords]);
        
        // 今日の記録かチェック
        const today = new Date();
        const isToday = 
          today.getDate() === timestamp.getDate() &&
          today.getMonth() === timestamp.getMonth() &&
          today.getFullYear() === timestamp.getFullYear();
        
        if (isToday) {
          setTodayCount(prev => prev + 1);
        }
        
        setTotalCount(prev => prev + 1);
        setIsDialogOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '記録の保存に失敗しました';
      alert(errorMessage);
      console.error('保存エラー:', err);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('この記録を削除しますか？')) return;

    try {
      const response = await fetch(`/api/records?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('削除に失敗しました');

      const result = await response.json();
      if (result.success) {
        setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
        setTotalCount(prev => prev - 1);
        
        // 今日の記録かチェックして減算
        const deletedRecord = records.find(r => r.id === id);
        if (deletedRecord) {
          const today = new Date();
          const recordDate = new Date(deletedRecord.timestamp);
          const isToday = 
            today.getDate() === recordDate.getDate() &&
            today.getMonth() === recordDate.getMonth() &&
            today.getFullYear() === recordDate.getFullYear();
          
          if (isToday) {
            setTodayCount(prev => prev - 1);
          }
        }
      }
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [recordsResponse, statsResponse] = await Promise.all([
        fetch('/api/records'),
        fetch(`/api/stats?employee=${employeeName}`)
      ]);

      if (!recordsResponse.ok || !statsResponse.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const recordsData = await recordsResponse.json();
      const statsData = await statsResponse.json();

      if (recordsData.success && statsData.success) {
        const mappedRecords = recordsData.data.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp)
        }));
        
        setRecords(mappedRecords);
        setTodayCount(statsData.data.todayCount);
        setTotalCount(statsData.data.totalCount);
      } else {
        throw new Error('APIエラー');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの読み込みに失敗しました';
      setError(errorMessage);
      console.error('データ読み込みエラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  const recentRecords = records.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🐴 馬の指ポキカウンター
        </h1>
        <p className="text-gray-600">指ポキした時にボタンを押して記録しましょう</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-blue-600">今日の回数</h3>
          <p className="text-3xl font-bold text-blue-800">{todayCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-green-600">総回数</h3>
          <p className="text-3xl font-bold text-green-800">{totalCount}</p>
        </div>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={handleCountClick}
          className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          👆 指ポキ記録
        </button>
      </div>

      {recentRecords.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            📋 最近の記録（最新5件）
          </h3>
          <div className="space-y-2">
            {recentRecords.map((record) => (
              <div 
                key={record.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <span className="text-gray-600">{record.employee}さん</span>
                  <span className="text-sm text-gray-500 ml-4">
                    {new Date(record.timestamp).toLocaleString('ja-JP')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteRecord(record.id)}
                  className="ml-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors cursor-pointer font-medium"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <RecordDialog
        isOpen={isDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        employeeName={employeeName}
      />
    </div>
  );
};

export default Counter;