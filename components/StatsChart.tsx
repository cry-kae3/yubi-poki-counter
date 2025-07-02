'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ChartData {
  date: string;
  count: number;
}

interface StatsChartProps {
  employeeName: string;
}

const StatsChart: React.FC<StatsChartProps> = ({ employeeName }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/chart?period=${period}&employee=${encodeURIComponent(employeeName)}`);
        
        if (!response.ok) {
          throw new Error('グラフデータの取得に失敗しました');
        }

        const result = await response.json();
        if (result.success) {
          setChartData(result.data);
        }
      } catch (error) {
        console.error('グラフデータ取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [period, employeeName]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{`日付: ${label}`}</p>
          <p className="text-blue-600">{`回数: ${payload[0].value}回`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 sm:mb-0">
          📊 {employeeName}さんの統計グラフ
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-1">
            {(['daily', 'monthly'] as const).map((periodOption) => (
              <button
                key={periodOption}
                onClick={() => setPeriod(periodOption)}
                className={`px-4 py-2 rounded text-sm transition-colors cursor-pointer font-medium ${
                  period === periodOption
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {periodOption === 'daily' && '📅 日別'}
                {periodOption === 'monthly' && '📊 月別'}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded text-sm transition-colors cursor-pointer font-medium ${
                chartType === 'line'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📈 線グラフ
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded text-sm transition-colors cursor-pointer font-medium ${
                chartType === 'bar'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 棒グラフ
            </button>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>表示するデータがありません</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">総回数</p>
              <p className="text-2xl font-bold text-blue-800">
                {chartData.reduce((sum, data) => sum + data.count, 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">平均</p>
              <p className="text-2xl font-bold text-green-800">
                {chartData.length > 0 
                  ? Math.round(chartData.reduce((sum, data) => sum + data.count, 0) / chartData.length * 10) / 10
                  : 0
                }
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">最大</p>
              <p className="text-2xl font-bold text-purple-800">
                {Math.max(...chartData.map(data => data.count))}
              </p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#1D4ED8' }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {chartData.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              {chartData[0].date} 〜 {chartData[chartData.length - 1].date}
              （{chartData.length}件のデータ）
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatsChart;