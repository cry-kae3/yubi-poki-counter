'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  date: string;
  count: number;
}

interface StatsChartProps {
  employeeName: string;
}

const StatsChart: React.FC<StatsChartProps> = ({ employeeName }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<number>(30);

  useEffect(() => {
    fetchChartData();
  }, [period, employeeName, dateRange]);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chart?period=${period}&employee=${encodeURIComponent(employeeName)}`);
      
      if (!response.ok) {
        throw new Error('グラフデータの取得に失敗しました');
      }

      const result = await response.json();
      if (result.success) {
        let data = result.data;
        
        if (period === 'daily' && dateRange > 0) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - dateRange);
          data = data.filter((item: ChartData) => new Date(item.date) >= cutoffDate);
        }
        
        setChartData(data);
      }
    } catch (error) {
      console.error('グラフデータ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{`期間: ${label}`}</p>
          <p className="text-blue-600">{`回数: ${payload[0].value}回`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{`期間: ${data.payload.date}`}</p>
          <p className="text-blue-600">{`回数: ${data.value}回`}</p>
          <p className="text-gray-600">{`割合: ${((data.value / chartData.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const totalCount = chartData.reduce((sum, data) => sum + data.count, 0);
  const averageCount = chartData.length > 0 ? Math.round((totalCount / chartData.length) * 10) / 10 : 0;
  const maxCount = chartData.length > 0 ? Math.max(...chartData.map(data => data.count)) : 0;
  const minCount = chartData.length > 0 ? Math.min(...chartData.map(data => data.count)) : 0;

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return '日別';
      case 'monthly': return '月別';
      case 'yearly': return '年別';
      default: return '';
    }
  };

  const getChartTypeLabel = () => {
    switch (chartType) {
      case 'line': return '📈 線グラフ';
      case 'bar': return '📊 棒グラフ';
      case 'pie': return '🥧 円グラフ';
      default: return '';
    }
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <h3 className="text-lg font-semibold text-gray-700">
          📊 {employeeName}さんの{getPeriodLabel()}統計グラフ
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="flex gap-1">
            {(['daily', 'monthly', 'yearly'] as const).map((periodOption) => (
              <button
                key={periodOption}
                onClick={() => setPeriod(periodOption)}
                className={`px-3 py-2 rounded text-sm transition-colors cursor-pointer font-medium ${
                  period === periodOption
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {periodOption === 'daily' && '📅 日別'}
                {periodOption === 'monthly' && '📊 月別'}
                {periodOption === 'yearly' && '📆 年別'}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {(['line', 'bar', 'pie'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-2 rounded text-sm transition-colors cursor-pointer font-medium ${
                  chartType === type
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type === 'line' && '📈'}
                {type === 'bar' && '📊'}
                {type === 'pie' && '🥧'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {period === 'daily' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">表示期間</label>
          <div className="flex gap-2 flex-wrap">
            {[7, 14, 30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-3 py-1 rounded text-sm transition-colors cursor-pointer ${
                  dateRange === days
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {days}日間
              </button>
            ))}
            <button
              onClick={() => setDateRange(0)}
              className={`px-3 py-1 rounded text-sm transition-colors cursor-pointer ${
                dateRange === 0
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全期間
            </button>
          </div>
        </div>
      )}

      {chartData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>表示するデータがありません</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">総回数</p>
              <p className="text-2xl font-bold text-blue-800">{totalCount}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">平均</p>
              <p className="text-2xl font-bold text-green-800">{averageCount}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">最大</p>
              <p className="text-2xl font-bold text-purple-800">{maxCount}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">最小</p>
              <p className="text-2xl font-bold text-orange-800">{minCount}</p>
            </div>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
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
              ) : chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ date, count, percent }) => 
                      `${date}: ${count}回 (${(percent * 100).toFixed(1)}%)`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {chartData.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>
                データ期間: {chartData[0].date} 〜 {chartData[chartData.length - 1].date}
                （{chartData.length}件のデータ）
              </p>
              {chartType === 'pie' && chartData.length > 8 && (
                <p className="mt-1">※ 円グラフは上位8件のみ表示しています</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatsChart;