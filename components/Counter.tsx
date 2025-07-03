'use client';

import React, { useState, useEffect } from 'react';
import { PokyRecord } from '../types';
import RecordDialog from './RecordDialog';
import RecordsTable from './RecordsTable';
import StatsChart from './StatsChart';
import SearchFilter from './SearchFilter';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

const Counter: React.FC = () => {
  const [records, setRecords] = useState<PokyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PokyRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'chart'>('dashboard');
  const [searchStartDate, setSearchStartDate] = useState<string>('');
  const [searchEndDate, setSearchEndDate] = useState<string>('');

  const employeeName = '馬';

  useEffect(() => {
    loadData();
  }, [employeeName]);

  useEffect(() => {
    setFilteredRecords(records);
  }, [records]);

  const handleCountClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const timestamp = new Date();

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

  const handleSearch = async (startDate?: string, endDate?: string) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('employee', employeeName);

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('検索に失敗しました');

      const result = await response.json();
      if (result.success) {
        const searchResults = result.data.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp)
        }));
        setFilteredRecords(searchResults);
      }
    } catch (err) {
      console.error('検索エラー:', err);
      alert('検索に失敗しました');
    }
  };

  const handleResetSearch = () => {
    setFilteredRecords(records);
    setSearchStartDate('');
    setSearchEndDate('');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recentRecords = filteredRecords.slice(0, 10);

  const navigationItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: TrendingUp },
    { id: 'records', label: '記録一覧', icon: Calendar },
    { id: 'chart', label: '統計グラフ', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🐴 馬の指ポキカウンター</h1>
            </div>
            <nav className="flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ダッシュボード */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* ヘッダー */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
              <p className="text-gray-600">指ポキした時にボタンを押して記録しましょう</p>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">今日の回数</h3>
                <p className="text-4xl font-bold text-blue-600">{todayCount}</p>
                <p className="text-gray-500 mt-1">回</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">総回数</h3>
                <p className="text-4xl font-bold text-green-600">{totalCount}</p>
                <p className="text-gray-500 mt-1">回</p>
              </div>
            </div>

            {/* 記録ボタン */}
            <div className="text-center">
              <button
                onClick={handleCountClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                👆 指ポキ記録
              </button>
            </div>

            {/* 最近の記録 */}
            {recentRecords.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">最近の記録（最新10件）</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時刻</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.employee}さん
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.timestamp).toLocaleString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 記録一覧・検索 */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">記録一覧・検索</h2>
              <p className="text-gray-600">過去の記録を検索・管理できます</p>
            </div>
            <SearchFilter
              onSearch={handleSearch}
              onReset={handleResetSearch}
            />
            <RecordsTable
              records={filteredRecords}
              onDelete={handleDeleteRecord}
              isLoading={false}
            />
          </div>
        )}

        {/* 統計グラフ */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">統計グラフ</h2>
              <p className="text-gray-600">指ポキの傾向を視覚的に確認できます</p>
            </div>
            <StatsChart employeeName={employeeName} />
          </div>
        )}
      </div>

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