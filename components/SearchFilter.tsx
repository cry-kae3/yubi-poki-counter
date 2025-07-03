'use client';

import React, { useState } from 'react';

interface SearchFilterProps {
  onSearch: (startDate?: string, endDate?: string) => void;
  onReset: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, onReset }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleSearch = () => {
    onSearch(startDate || undefined, endDate || undefined);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onReset();
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    onSearch(today, today);
  };

  const handleYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    setStartDate(yesterdayStr);
    setEndDate(yesterdayStr);
    onSearch(yesterdayStr, yesterdayStr);
  };

  const handleThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const start = startOfWeek.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    
    setStartDate(start);
    setEndDate(end);
    onSearch(start, end);
  };

  const handleLastWeek = () => {
    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
    
    const start = startOfLastWeek.toISOString().split('T')[0];
    const end = endOfLastWeek.toISOString().split('T')[0];
    
    setStartDate(start);
    setEndDate(end);
    onSearch(start, end);
  };

  const handleThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const start = startOfMonth.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    
    setStartDate(start);
    setEndDate(end);
    onSearch(start, end);
  };

  const handleLastMonth = () => {
    const today = new Date();
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const start = startOfLastMonth.toISOString().split('T')[0];
    const end = endOfLastMonth.toISOString().split('T')[0];
    
    setStartDate(start);
    setEndDate(end);
    onSearch(start, end);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">🔍 検索・フィルター</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">開始日</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">終了日</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">クイック選択</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm cursor-pointer"
          >
            今日
          </button>
          <button
            onClick={handleYesterday}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm cursor-pointer"
          >
            昨日
          </button>
          <button
            onClick={handleThisWeek}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm cursor-pointer"
          >
            今週
          </button>
          <button
            onClick={handleLastWeek}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm cursor-pointer"
          >
            先週
          </button>
          <button
            onClick={handleThisMonth}
            className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm cursor-pointer"
          >
            今月
          </button>
          <button
            onClick={handleLastMonth}
            className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm cursor-pointer"
          >
            先月
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSearch}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer"
        >
          🔍 検索
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
        >
          リセット
        </button>
      </div>

      {(startDate || endDate) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>検索条件:</strong> 
            {startDate && ` ${startDate} から`}
            {endDate && ` ${endDate} まで`}
            {!startDate && endDate && ` ${endDate} 以前`}
            {startDate && !endDate && ` ${startDate} 以降`}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;