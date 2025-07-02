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

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">🔍 検索フィルター</h3>
      
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

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleToday}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm cursor-pointer"
        >
          今日
        </button>
        <button
          onClick={handleThisWeek}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm cursor-pointer"
        >
          今週
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSearch}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer"
        >
          検索
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
        >
          リセット
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;